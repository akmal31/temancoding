import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const userRes = await query('SELECT credits FROM public.users WHERE user_id = $1', [session.user.id]);
    const credits = userRes.rows[0]?.credits || 0;

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    // Deduct 1 credit
    await query(
      `UPDATE public.users SET credits = credits - 1 WHERE user_id = $1`,
      [session.user.id]
    );

    return NextResponse.json({ success: true, remaining: credits - 1 });
  } catch (error: any) {
    console.error('Error deducting credit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
