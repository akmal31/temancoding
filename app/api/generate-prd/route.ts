import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { idea, answers } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
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
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ prd: response.text });
  } catch (error) {
    console.error('Error generating PRD:', error);
    return NextResponse.json({ error: 'Failed to generate PRD' }, { status: 500 });
  }
}
