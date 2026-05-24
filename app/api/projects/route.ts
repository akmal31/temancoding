import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { idea, answers, prd_result } = await req.json();

    // If we only have database for logged in users:
    const userId = session?.user?.id || null;

    const res = await query(
      `INSERT INTO public.projects (user_id, idea, answers, prd_result) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, idea, answers ? JSON.stringify(answers) : null, prd_result || null]
    );

    return NextResponse.json({ id: res.rows[0].id });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
