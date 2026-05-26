import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Enable pgcrypto for gen_random_uuid() if needed
    await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS public.users (
        user_id UUID PRIMARY KEY,
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
        user_id UUID,
        title TEXT,
        idea TEXT NOT NULL,
        answers JSONB,
        status TEXT NOT NULL DEFAULT 'draft',
        result JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    console.error("Database init error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
