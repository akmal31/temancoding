import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, credits } = await req.json();

    // Start a transaction implicitly by doing queries? Or just sequential.
    // Realistically you'd use a payment gateway webhook. Here we simulate success.
    const res = await query(
      `INSERT INTO public.transactions (user_id, amount, credits_added, status) 
       VALUES ($1, $2, $3, 'success') RETURNING id`,
      [session.user.id, amount, credits]
    );

    // Update user credits
    await query(
      `UPDATE public.users SET credits = credits + $1 WHERE user_id = $2`,
      [credits, session.user.id]
    );

    return NextResponse.json({ success: true, transaction_id: res.rows[0].id });
  } catch (error: any) {
    console.error('Error processing topup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
