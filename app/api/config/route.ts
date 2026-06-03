import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const defaultSettings: Record<string, string> = {
  starter_price: "49000",
  starter_credits: "5",
  pro_price: "99000",
  pro_credits: "25",
  max_price: "179000",
  max_credits: "-1",
  tutorial_youtube_url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
};

async function ensureTableAndGetSettings() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public.site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Fetch existing settings
    const res = await query(`SELECT key, value FROM public.site_settings`);
    const currentSettingsObj: Record<string, string> = {};
    for (const row of res.rows) {
      currentSettingsObj[row.key] = row.value;
    }

    // Insert missing defaults
    const missingKeys = Object.keys(defaultSettings).filter(k => !(k in currentSettingsObj));
    for (const key of missingKeys) {
      await query(`
        INSERT INTO public.site_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [key, defaultSettings[key]]);
      currentSettingsObj[key] = defaultSettings[key];
    }

    return currentSettingsObj;
  } catch (err) {
    console.error("Failed to fetch or setup site settings:", err);
    return defaultSettings;
  }
}

export async function GET() {
  const settings = await ensureTableAndGetSettings();
  
  // Format numeric values where appropriate for ease of frontend consumption
  const formatted = {
    starter_price: parseInt(settings.starter_price) || 49000,
    starter_credits: parseInt(settings.starter_credits) || 5,
    pro_price: parseInt(settings.pro_price) || 99000,
    pro_credits: parseInt(settings.pro_credits) || 25,
    max_price: parseInt(settings.max_price) || 179000,
    max_credits: parseInt(settings.max_credits) || -1,
    tutorial_youtube_url: settings.tutorial_youtube_url
  };

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const userRole = (session?.user as any)?.role || 'user';

  if (!session || (userRole !== 'admin' && userEmail !== 'akmalgumilar@gmail.com')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const allowedKeys = Object.keys(defaultSettings);

    for (const [key, val] of Object.entries(body)) {
      if (allowedKeys.includes(key)) {
        await query(`
          INSERT INTO public.site_settings (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `, [key, String(val)]);
      }
    }

    const updatedSettings = await ensureTableAndGetSettings();
    const formatted = {
      starter_price: parseInt(updatedSettings.starter_price) || 49000,
      starter_credits: parseInt(updatedSettings.starter_credits) || 5,
      pro_price: parseInt(updatedSettings.pro_price) || 99000,
      pro_credits: parseInt(updatedSettings.pro_credits) || 25,
      max_price: parseInt(updatedSettings.max_price) || 179000,
      max_credits: parseInt(updatedSettings.max_credits) || -1,
      tutorial_youtube_url: updatedSettings.tutorial_youtube_url
    };

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("POST config error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
