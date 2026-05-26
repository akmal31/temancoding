import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await query(
      `SELECT p.id, p.title, p.status, p.created_at FROM public.projects p
       JOIN public.users u ON p.user_id = u.user_id
       WHERE u.email = $1
       ORDER BY p.created_at DESC`,
      [session.user.email]
    );

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('List projects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
