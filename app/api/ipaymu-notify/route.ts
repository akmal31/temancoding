import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // iPaymu sends form-urlencoded data to notifyUrl
    const formData = await req.formData();
    const trx_id = formData.get("trx_id") as string;
    const status = formData.get("status") as string;
    const status_code = formData.get("status_code") as string;
    const reference_id = formData.get("reference_id") as string;

    console.log("IPAYMU Webhook:", {
      trx_id,
      status,
      status_code,
      reference_id,
    });

    if (status === "berhasil" || status_code === "1") {
      const txRes = await query(
        "SELECT * FROM public.transactions WHERE id = $1",
        [reference_id],
      );
      if (txRes.rows.length > 0) {
        const tx = txRes.rows[0];
        if (tx.status !== "success") {
          await query(
            "UPDATE public.transactions SET status = 'success', ipaymu_trx_id = $1 WHERE id = $2",
            [trx_id || tx.ipaymu_trx_id, reference_id],
          );
          await query(
            "UPDATE public.users SET credits = credits + $1 WHERE user_id = $2",
            [tx.credits_added, tx.user_id],
          );
          console.log(
            `Successfully credited ${tx.credits_added} to user ${tx.user_id}`,
          );
        }
      }
    } else if (
      status === "gagal" ||
      status_code === "-1" ||
      status === "expired"
    ) {
      await query(
        "UPDATE public.transactions SET status = 'failed' WHERE id = $1",
        [reference_id],
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("IPaymu Notify Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
