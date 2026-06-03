import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Enable pgcrypto for gen_random_uuid() if needed
    await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Force drop tables to reset schema correctly for UUID issues
    // Or ALTER them safely if they want to keep data
    try {
      await query(`ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;`);
      await query(`ALTER TABLE public.users ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;`);
      await query(`ALTER TABLE public.projects ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;`);
      await query(`ALTER TABLE public.transactions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;`);
    } catch(err) {
      console.log('Skipping alter tables (might not exist yet or already altered):', err);
    }


    // Create users table explicitly without UUID type constraint to avoid NextAuth id mismatch
    await query(`
      CREATE TABLE IF NOT EXISTS public.users (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        avatar TEXT,
        credits INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user',
        password TEXT DEFAULT ''
      )
    `);

    // Ensure credits default is 0 for existing databases, and add expiration & unlimited columns
    try {
      await query(`ALTER TABLE public.users ALTER COLUMN credits SET DEFAULT 0;`);
      await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`);
      await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '';`);
      await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits_expired_at TIMESTAMP WITH TIME ZONE;`);
      await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT FALSE;`);
    } catch (e) {
      console.log('Skipping alter user columns:', e);
    }

    // Create projects table
    await query(`
      CREATE TABLE IF NOT EXISTS public.projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        title TEXT,
        idea TEXT NOT NULL,
        answers JSONB,
        status TEXT NOT NULL DEFAULT 'draft',
        result JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS public.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        amount INTEGER NOT NULL,
        credits_added INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        ipaymu_trx_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Ensure transactions table column defaults
    try {
      await query(`ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS ipaymu_trx_id TEXT;`);
    } catch(e) {}

    // Create site settings table
    await query(`
      CREATE TABLE IF NOT EXISTS public.site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Seed site settings defaults
    const defaultSettings = [
      ['starter_price', '49000'],
      ['starter_credits', '5'],
      ['pro_price', '99000'],
      ['pro_credits', '25'],
      ['max_price', '179000'],
      ['max_credits', '-1'],
      ['tutorial_youtube_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ']
    ];

    for (const [key, val] of defaultSettings) {
      await query(`
        INSERT INTO public.site_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [key, val]);
    }

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    console.error("Database init error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
