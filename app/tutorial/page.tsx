"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "motion/react";
import { 
  Film, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  Database, 
  HelpCircle,
  Layers,
  ChevronRight,
  Bot
} from "lucide-react";
import Link from "next/link";

export default function TutorialPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("last_visited_path", "/tutorial");
    }
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data.tutorial_youtube_url) {
            let url = data.tutorial_youtube_url;
            if (url.includes("watch?v=")) {
              const videoId = url.split("v=")[1]?.split("&")[0];
              if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes("youtu.be/")) {
              const videoId = url.split("youtu.be/")[1]?.split("?")[0];
              if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
            }
            setYoutubeUrl(url);
          }
        }
      } catch (err) {
        console.error("Gagal memuat url tutorial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const steps = [
    {
      title: "1. Tulis Ide Kasar",
      subtitle: "Gunakan Bahasa Santai",
      desc: "Tidak perlu bahasa formal atau spesifik komputer. Ceritakan saja idemu seperti curhat ke teman dekat (contoh: 'bikin aplikasi pencatat stok barang di warung sembako keluarga').",
      icon: <HelpCircle className="w-5 h-5 text-indigo-400" />,
      color: "from-indigo-500/20 to-blue-500/10"
    },
    {
      title: "2. Jawab Pertanyaan AI",
      subtitle: "Mengisi Gap Detail",
      desc: "Teman Coding akan menyusun pertanyaan cerdas tentang detail aplikasimu (auth, fitur pembayaran, printer struk, dsb.). Cukup jawab seadanya sesukamu, AI kami akan paham.",
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      color: "from-purple-500/20 to-pink-500/10"
    },
    {
      title: "3. Salin Skema & PRD",
      subtitle: "Arsitektur Siap Pakai",
      desc: "Tekan tombol generate dan tunggu sampai AI kami selesai menganalisa ide dan jawabanmu dan setelah selesai maka akan muncul dokumen PRD yang lengkap dengan alur diagram sistem, serta code dan schema database.",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/10"
    },
    {
      title: "4. Paste ke AI Coding",
      subtitle: "Tonton Kode Dibuat",
      desc: "Salin output dari Teman Coding ke AI Agent andalanmu (seperti Cursor, Windsurf, v0, Bolt, atau Lovable). Tonton ribuan baris kode dibuat rapi tanpa ada salah logika!",
      icon: <Bot className="w-5 h-5 text-amber-400" />,
      color: "from-amber-500/20 to-orange-500/10"
    }
  ];

  return (
    <main className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col relative w-full pb-20">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 w-full mt-6">
        
        {/* BACK TO HOME BUTTON AT THE VERY TOP */}
        <div className="mb-6 flex justify-start">
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("last_visited_path");
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 hover:text-white rounded-xl text-xs hover:bg-zinc-800 transition-all font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali Ke Home</span>
          </Link>
        </div>
        
        {/* TOP BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>PANDUAN PEMULA - TEMAN CODING</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-space text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 tracking-tight">
            Cara Kerja Teman Coding
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed font-light">
            Pelajari langkah demi langkah bagaimana Teman Coding menyulap ide kasar sederhanamu menjadi blueprint sistem berstandar profesional yang dimengerti oleh AI Coding pendampingmu.
          </p>
        </motion.div>

        {/* STEP BY STEP INTERACTIVE TRAIL */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isActive 
                    ? "bg-zinc-900/90 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                    : "bg-zinc-950/40 border-zinc-900/65 hover:border-zinc-800 hover:bg-zinc-900/20"
                }`}
              >
                {/* Background light gradient */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-40 blur-lg`} />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                      {step.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full">
                      Langkah {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100 font-space tracking-wide">{step.title}</h3>
                  <p className="text-xs text-indigo-400/90 font-medium mt-1">{step.subtitle}</p>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed font-light">{step.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>



        {/* COMPREHENSIVE LECTURE / TUTORIAL DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="text-xl sm:text-2xl font-bold font-space text-white">
              Mengapa Output Teman Coding Sangat Powerful?
            </h3>
            
            <div className="flex flex-col gap-4 text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
              <p>
                Ketika Anda memasukkan ide langsung ke AI Coding (seperti Cursor atau ChatGPT), AI cenderung menebak-nebak (halusinasi) struktur database dan stack teknologi. Hal ini memicu puluhan <strong>error runtime compile</strong> di tengah jalan yang sulit diperbaiki pemula.
              </p>
              <p>
                <strong>Teman Coding bertindak sebagai System Architect (Arsitek Sistem) pribadi Anda:</strong> sistem memilah struktur sistem, menyajikan PRD terstruktur berisi use-case, hingga skema database relational yang solid. Begitu AI Coding menerima cetak biru yang rapi, AI akan mengerti batas aplikasi Anda dan membuat keseluruhan program secara presisi dalam sekali perintah.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex gap-4 mt-2">
              <Bot className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Kombinasikan dengan AI Agent Coding Favoritmu</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Skema database hasil racikan kami dirancang sesuai standar internasional menggunakan format <strong>Prisma</strong> atau <strong>Drizzle Schema</strong>, sehingga sangat ramah ketika di-upload ke tool developer AI modern.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold font-space text-zinc-100 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Tips Sukses Developer
              </h4>
              <ul className="flex flex-col gap-3.5 text-xs text-zinc-400 font-light leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-zinc-200">Mulai dari Hal Kecil:</strong> Jangan kumpulkan puluhan fitur kompleks di ide pertamamu. Lebih baik bikin MVP (Minimum Viable Product).
                </li>
                <li>
                  <strong className="text-zinc-200">Koreksi Diskusi AI:</strong> Jika AI menanyakan pilihan printer struk, dan kamu berubah pikiran, langsung tulis balasan santai di kolom jawabannya.
                </li>
                <li>
                  <strong className="text-zinc-200">Gunakan Prompt Terbaik:</strong> Copy-paste prompt yang kami hasilkan di tab <strong className="text-indigo-400">&ldquo;Prompt Coding AI&rdquo;</strong> agar instruksi coding terdengar tajam.
                </li>
              </ul>
            </div>

            <div className="border-t border-zinc-800 pt-5 mt-5">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-indigo-650 to-purple-650 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)]"
              >
                <span>Mulai Buat Project Pertama</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ORIGINAL VIDEO TUTORIAL CONTAINER (As an extra backup) */}
        <div className="border-t border-zinc-900 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-col gap-4"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-space text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-400" />
                Masih Bingung? Tonton Video Tutorial Kami
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Panduan video visual dari Teman Coding berdurasi singkat yang menjelaskan alur lengkap dari nol sampai jadi aplikasi.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-2xl shadow-indigo-500/5 mb-8"
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              </div>
            ) : (
              <iframe
                src={youtubeUrl}
                title="Teman Coding Tutorial Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800"
          >
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Butuh bantuan tambahan atau konsultasi fitur?</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tonton ulang tutorial di atas agar kamu paham cara membuat diagram arsitektur lengkap, menyusun dokumen PRD, dan menyalin model skema database terbaik untuk project code idemu. Tim developer Teman Coding siap membimbing kesuksesan project kamu!
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  );
}
