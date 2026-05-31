import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  let session = null;
  let creditDeducted = false;
  
  try {
    session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user?.id;

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Server misconfiguration: AI key missing' }, { status: 500 });
    }

    const { idea, answers, projectState, id } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    }
    
    // Deduct credit if user is authenticated
    if (isAuthenticated) {
      const userRes = await query('SELECT credits FROM public.users WHERE user_id = $1', [session!.user!.id]);
      const credits = userRes.rows[0]?.credits || 0;

      if (credits <= 0) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
      }

      await query(`UPDATE public.users SET credits = credits - 1 WHERE user_id = $1`, [session!.user!.id]);
      creditDeducted = true;
    }

    const payload = answers ? `Ide awal: ${idea}\n\nKlarifikasi tambahan dari user:\n${JSON.stringify(answers, null, 2)}` : `Ide awal: ${idea}`;

    const prompt = `Kamu adalah seorang system architect dan product manager expert.
Buatkan Product Requirement Document (PRD) dan Rekomendasi Arsitektur Teknis yang lengkap, rapi, dan komprehensif berdasarkan input berikut:

${payload}

Struktur Dokumen (Format Markdown):
1. **Ringkasan Produk (Executive Summary)**: Penjelasan singkat visi dan tujuan aplikasi.
2. **Target Pengguna**: Siapa yang akan menggunakan, masalah apa yang diselesaikan.
3. **User Flow & Fitur Utama (Core Features)**: Daftar fitur terpenting dan alur logika kerja.
4. **Rekomendasi Arsitektur (Tech Stack)**: Rekomendasi Frontend, Backend, Database, dan layanan pihak ketiga, beri alasan kenapa.
5. **Skema Database (Database Schema)**: Contoh model ERD / tabel database utama (usahakan beri relasi antar tabel dasar agar developer langsung paham).
6. **Milestone / Tahapan Pengembangan (Phases)**: Fase MVP hingga scale up.

Penting: 
- Dokumen harus terstruktur sangat rapi dan mudah dibaca oleh agen AI maupun developer manusia. 
- Gunakan bahasa Indonesia baku namun mudah dipahami.
- Hanya output hasil dokumen Markdown, tanpa ada pesan perkenalan atau penutup.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const prdResult = response.text;
    
    // Update DB with completed status and result if authenticated
    if (isAuthenticated && id) {
       const ideaText = idea.slice(0, 30) + (idea.length > 30 ? '...' : '');
       const finalAnswers = projectState || answers;
       
       await query(
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
              idea = EXCLUDED.idea,
              user_id = COALESCE(public.projects.user_id, EXCLUDED.user_id)`,
         [id, session!.user!.email, ideaText, idea, finalAnswers, 'completed', JSON.stringify({ prd: prdResult })]
       );
    }

    return NextResponse.json({ prd: prdResult });
  } catch (error: any) {
    console.error('Error generating PRD:', error);
    
    if (creditDeducted && session?.user?.id) {
        // Refund if generation failed
        try {
            await query(`UPDATE public.users SET credits = credits + 1 WHERE user_id = $1`, [session.user.id]);
        } catch (refundError) {
            console.error('CRITICAL: Failed to refund credit:', refundError);
        }
    }
    
    return NextResponse.json({ error: 'Failed to generate PRD', details: error?.message || String(error) }, { status: 500 });
  }
}

