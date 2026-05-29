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
        credits INTEGER DEFAULT 8
      )
    `);

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    console.error("Database init error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
