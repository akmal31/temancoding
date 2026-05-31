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

    const { id, answers, status: reqStatus } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    
    // We expect `answers` to carry the payload. `answers.idea` should contain the idea if it's migrating
    const ideaText = answers?.idea || 'Untitled Idea';
    const title = ideaText.slice(0, 30) + (ideaText.length > 30 ? '...' : '');
    const prdResult = answers?.prd || null;
    const finalStatus = reqStatus || 'draft';

    const res = await query(
      `INSERT INTO public.projects (id, user_id, title, idea, answers, status, result, updated_at)
       VALUES (
         $1, 
         (SELECT user_id FROM public.users WHERE email = $2), 
         $3, 
         $4, 
         $5, 
         $6, 
         $7,
         NOW()
       )
       ON CONFLICT (id) DO UPDATE 
       SET answers = EXCLUDED.answers,
           status = EXCLUDED.status,
           result = EXCLUDED.result,
           updated_at = NOW(),
           user_id = COALESCE(public.projects.user_id, EXCLUDED.user_id)
       RETURNING id`,
      [id, session.user.email, title, ideaText, answers, finalStatus, prdResult ? JSON.stringify({ prd: prdResult }) : null]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
