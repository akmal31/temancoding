import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Server misconfiguration: AI key missing' }, { status: 500 });
    }

    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    }

    const prompt = `Kamu adalah seorang system architect dan product manager senior (berbahasa Indonesia yang asik, ramah, dan profesional).
Seorang user ingin membuat aplikasi dengan ide berikut: "${idea}"

Bantu user ini menggali idenya lebih dalam agar kita bisa membuatkan Product Requirement Document (PRD) dan arsitektur teknis yang akurat. 
Berikan 3-5 pertanyaan penting yang butuh klarifikasi (misal: scope fitur, target pengguna, preferensi platform web/mobile, atau fitur utama). 
Jangan terlalu banyak pertanyaan, cukup yang esensial.

Format output HARUS selalu berupa JSON array berisi string pertanyaan. 
Contoh output:
["Platform apa aja yang mau didukung? (Web, iOS, atau Android)", "Fitur utamanya apa aja selain X?", "Apakah butuh fitur login/user?"]

Pastikan HANYA MENGEMBALIKAN array JSON valid, tanpa markdown \`\`\`json atau teks lain di luar array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '[]';
    
    // Attempt to parse json from response by stripping potential markdown code blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleanedText);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions', details: error?.message || String(error) }, { status: 500 });
  }
}
