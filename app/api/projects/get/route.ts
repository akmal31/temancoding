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

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const res = await query(
      `SELECT p.*, p.user_id as pid, u.email FROM public.projects p
       LEFT JOIN public.users u ON p.user_id = u.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // allow access if it's the right user, or if project has no user yet (stored locally before login)
    const project = res.rows[0];
    if (project.pid && project.email !== session.user.email) {
       return NextResponse.json({ error: 'Unauthorized user for this project', project_user: project.email, session_user: session.user.email }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
