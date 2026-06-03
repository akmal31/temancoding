"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SidebarWrapper } from "@/components/SidebarWrapper";
import { motion } from "motion/react";
import { Film, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TutorialPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data.tutorial_youtube_url) {
            // Ensure the URL is in embed format
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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col justify-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Panduan Penggunaan</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold font-space">Video Tutorial Teman Coding</h1>
            <Link
              href="/"
              className="self-start flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali Ke Home</span>
            </Link>
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
            <h4 className="text-sm font-semibold text-white">Butuh bantuan tambahan?</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Tonton ulang tutorial ini agar kamu paham cara membuat diagram arsitektur lengkap, menyusun dokumen PRD,
              dan menyalin model skema database terbaik untuk project code idemu.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
