import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea } = await req.json();
    if (!idea) {
      return NextResponse.json({ error: 'idea is required' }, { status: 400 });
    }

    const title = idea.slice(0, 30) + (idea.length > 30 ? '...' : '');

    const res = await query(
      `INSERT INTO public.projects (user_id, title, idea, status)
       VALUES ((SELECT user_id FROM public.users WHERE email = $1), $2, $3, 'draft')
       RETURNING id`,
      [session.user.email, title, idea]
    );

    return NextResponse.json({ id: res.rows[0].id });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
