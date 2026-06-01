import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apikey = process.env.IPAYMU_API_KEY;
  const va = process.env.IPAYMU_VA;

  if (!apikey || !va) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 500 },
    );
  }

  // Parse the body
  let bodyReq = { amount: 30000, credits: 2 };
  try {
    bodyReq = await req.json();
  } catch (e) {}

  let credits = bodyReq.credits || 2;
  let amount = bodyReq.amount || 30000;

  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const origin = host ? `${protocol}://${host}` : process.env.APP_URL || "http://localhost:3000";

  // Create transaction in DB first
  let txId = "";
  try {
    const txRes = await query(
      `INSERT INTO public.transactions (user_id, amount, credits_added, status)
             VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [session.user.id, amount, credits],
    );
    txId = txRes.rows[0].id;
  } catch (err: any) {
    // Table doesn't exist? let's create it on the fly if needed (good practice for quick prototyping)
    await query(`
            CREATE TABLE IF NOT EXISTS public.transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id text,
                amount INTEGER,
                credits_added INTEGER,
                status TEXT,
                ipaymu_trx_id TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
    // Maybe schema mismatch since it was created earlier.
    try {
      await query(
        `ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS ipaymu_trx_id TEXT`,
      );
    } catch (e) {}

    const txRes = await query(
      `INSERT INTO public.transactions (user_id, amount, credits_added, status)
             VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [session.user.id, amount, credits],
    );
    txId = txRes.rows[0].id;
  }

  try {
    const bodyStr = {
      product: [`Credit Teman Coding - ${credits} Credits`],
      qty: ["1"],
      price: [`${amount}`],
      returnUrl: `${origin}/auth-success?topup=true&trx=${txId}`,
      cancelUrl: `${origin}/topup`,
      notifyUrl: `${origin}/api/ipaymu-notify`,
      referenceId: txId,
      buyerName: session.user.name || "",
      buyerEmail: session.user.email || "",
    };

    const jsonBody = JSON.stringify(bodyStr);
    const signatureBody = crypto
      .createHash("sha256")
      .update(jsonBody)
      .digest("hex")
      .toLowerCase();
    const stringToSign = `POST:${va}:${signatureBody}:${apikey}`;
    const signature = crypto
      .createHmac("sha256", apikey)
      .update(stringToSign)
      .digest("hex");

    let now = new Date();
    // yyyymmddhhmmss string
    let timestamp = now
      .toISOString()
      .replace(/T/, "")
      .replace(/\..+/, "")
      .replace(/-/g, "")
      .replace(/:/g, "")
      .replace(/ /g, "");

    const ipaymuUrl = process.env.IPAYMU_ENV === 'sandbox' 
      ? "https://sandbox.ipaymu.com/api/v2/payment" 
      : "https://my.ipaymu.com/api/v2/payment";

    const response = await fetch(ipaymuUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        va: va,
        signature: signature,
        timestamp: timestamp,
      },
      body: jsonBody,
    });

    const ipaymuData = await response.json();

    if (ipaymuData && ipaymuData.Success === true) {
      // update transaction with trx_id
      await query(
        `UPDATE public.transactions SET ipaymu_trx_id = $1 WHERE id = $2`,
        [ipaymuData.Data.SessionID, txId],
      );
      return NextResponse.json({ url: ipaymuData.Data.Url });
    } else {
      console.error("IPAYMU Error:", ipaymuData);
      
      let errorMessage = "Failed to create payment session";
      if (ipaymuData.Message === "Invalid domain") {
         errorMessage = `URL Origin ini (${origin}) belum didaftarkan di iPaymu Sandbox/Production. Silakan login ke dashboard iPaymu > Integration > Website, dan tambahkan URL aplikasi ini.`;
      } else if (ipaymuData.Message) {
         errorMessage = ipaymuData.Message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 },
      );
    }
  } catch (err: any) {
    console.error("System Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
