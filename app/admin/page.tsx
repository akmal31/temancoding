"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { motion } from "motion/react";
import { Save, Lock, ArrowLeft, Coins, Film, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    starter_price: 49000,
    starter_credits: 5,
    pro_price: 99000,
    pro_credits: 25,
    max_price: 179000,
    max_credits: -1,
    tutorial_youtube_url: "",
  });

  const isAuthorized =
    session?.user?.email === "akmalgumilar@gmail.com" ||
    (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (!isAuthorized) {
      return; // Handled beautifully in UI below
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            starter_price: data.starter_price,
            starter_credits: data.starter_credits,
            pro_price: data.pro_price,
            pro_credits: data.pro_credits,
            max_price: data.max_price,
            max_credits: data.max_credits,
            tutorial_youtube_url: data.tutorial_youtube_url || "",
          });
        }
      } catch (err: any) {
        setError("Gagal memuat konfigurasi: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [session, status, router, isAuthorized]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized || saving) return;

    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan konfigurasi.");
      }
    } catch (err: any) {
      setError("Kesalahan koneksi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (isAuthorized && loading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-black flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-space text-white mb-2">Akses Terbatas</h1>
        <p className="text-zinc-400 max-w-sm mb-6">
          Halaman ini hanya dapat diakses oleh Administrator utama (akmalgumilar@gmail.com).
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-6 py-2.5 rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Home</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Dashboard Admin</span>
            </div>
            <h1 className="text-3xl font-bold font-space">Konfigurasi Teman Kecil</h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Dashboard Utama</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Konfigurasi berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
            {/* Package 1: Starter */}
            <div>
              <h2 className="text-lg font-bold font-space flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2 text-indigo-400">
                <Coins className="w-5 h-5" />
                <span>Paket 1: Starter</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Harga Pembelian (Rupiah)
                  </label>
                  <input
                    type="number"
                    value={settings.starter_price}
                    onChange={(e) =>
                      setSettings({ ...settings, starter_price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: 49000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Jumlah Token / Credit
                  </label>
                  <input
                    type="number"
                    value={settings.starter_credits}
                    onChange={(e) =>
                      setSettings({ ...settings, starter_credits: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: 5"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Package 2: Pro */}
            <div>
              <h2 className="text-lg font-bold font-space flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2 text-indigo-400">
                <Coins className="w-5 h-5" />
                <span>Paket 2: Pro</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Harga Pembelian (Rupiah)
                  </label>
                  <input
                    type="number"
                    value={settings.pro_price}
                    onChange={(e) =>
                      setSettings({ ...settings, pro_price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: 99000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Jumlah Token / Credit
                  </label>
                  <input
                    type="number"
                    value={settings.pro_credits}
                    onChange={(e) =>
                      setSettings({ ...settings, pro_credits: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: 25"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Package 3: Max (Unlimited) */}
            <div>
              <h2 className="text-lg font-bold font-space flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2 text-indigo-400">
                <Coins className="w-5 h-5" />
                <span>Paket 3: Max (Unlimited Option)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Harga Pembelian (Rupiah)
                  </label>
                  <input
                    type="number"
                    value={settings.max_price}
                    onChange={(e) =>
                      setSettings({ ...settings, max_price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: 179000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Mode Token / Credit
                  </label>
                  <select
                    value={settings.max_credits}
                    onChange={(e) =>
                      setSettings({ ...settings, max_credits: parseInt(e.target.value) || -1 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="-1">Unlimited Token (-1)</option>
                    <option value="50">50 Credits</option>
                    <option value="100">100 Credits</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Video Tutorial Settings */}
            <div>
              <h2 className="text-lg font-bold font-space flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2 text-indigo-400">
                <Film className="w-5 h-5" />
                <span>Konfigurasi Video Tutorial</span>
              </h2>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Link Embed Youtube
                </label>
                <input
                  type="text"
                  value={settings.tutorial_youtube_url}
                  onChange={(e) =>
                    setSettings({ ...settings, tutorial_youtube_url: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.youtube.com/embed/XXXXXX atau URL Youtube asli"
                  required
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Masukkan URL embed youtube yang valid, misalnya:{" "}
                  <code className="text-indigo-400">https://www.youtube.com/embed/dQw4w9WgXcQ</code>
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Menyimpan..." : "Simpan Semua Konfigurasi"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}
