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

    // Check credits, unlimited status, and active period (masa aktif)
    const userRes = await query('SELECT credits, is_unlimited, credits_expired_at FROM public.users WHERE user_id = $1', [session.user.id]);
    const userRow = userRes.rows[0];
    const credits = userRow?.credits || 0;
    const isUnlimited = !!userRow?.is_unlimited;
    const creditsExpiredAt = userRow?.credits_expired_at ? new Date(userRow.credits_expired_at) : null;
    const now = new Date();

    const isExpired = creditsExpiredAt !== null && now > creditsExpiredAt;

    if (isExpired) {
      return NextResponse.json(
        { error: 'Masa aktif token / kredit Anda telah habis. Silakan beli paket baru.' },
        { status: 403 }
      );
    }

    if (isUnlimited) {
      // Unlimited access, no credits deducted
      return NextResponse.json({ success: true, remaining: credits, isUnlimited: true });
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Jumlah token / kredit Anda tidak mencukupi. Silakan lakukan pengisian ulang.' }, { status: 403 });
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
