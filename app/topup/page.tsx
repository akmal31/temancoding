"use client";

import { Suspense, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { useRouter, useSearchParams } from "next/navigation";
import { Coins, Check, Zap, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

function TopUpContent() {
  const { user } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [config, setConfig] = useState({
    starter_price: 49000,
    starter_credits: 5,
    pro_price: 99000,
    pro_credits: 25,
    max_price: 179000,
    max_credits: -1,
  });

  useEffect(() => {
    if (!user) {
      if (typeof window !== "undefined") router.replace("/login");
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Gagal mendapatkan harga token dari database: ", err);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [user, router]);

  if (!user) {
    return null;
  }

  const formatPrice = (p: number) => {
    return "Rp " + p.toLocaleString("id-ID");
  };

  const packages = [
    {
      id: "starter",
      name: "Starter",
      priceValue: config.starter_price,
      price: formatPrice(config.starter_price),
      credits: config.starter_credits,
      popular: false,
      info: `${config.starter_credits} Credit`,
    },
    {
      id: "pro",
      name: "Pro",
      priceValue: config.pro_price,
      price: formatPrice(config.pro_price),
      credits: config.pro_credits,
      popular: true,
      info: `${config.pro_credits} Credit`,
    },
    {
      id: "max",
      name: "Max",
      priceValue: config.max_price,
      price: formatPrice(config.max_price),
      credits: config.max_credits,
      popular: false,
      info: "Unlimited Token",
    },
  ];

  const handleBuy = async (pkg: (typeof packages)[0]) => {
    setErrorMessage("");
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pkg.priceValue,
          credits: pkg.credits,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        router.push(data.url);
      } else {
        setErrorMessage(data.error || "Gagal menginisiasi pembayaran. Mohon hubungi administrator.");
      }
    } catch (err: any) {
      setErrorMessage("Koneksi gagal: " + err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <div className="flex-1 flex flex-col items-center py-20 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-space mb-4">
            Pilih Paket Token & Kredit Anda
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Pilih paket yang paling cocok untuk asisten coding digitalmu. 
            Setiap pembelian paket token ini memiliki <span className="text-indigo-400 font-semibold">masa aktif selama 30 hari</span> sejak pembayaran sukses.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 w-full max-w-xl p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loadingConfig ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {packages.map((pkg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                key={pkg.id}
                className={`relative flex flex-col p-8 rounded-3xl border ${pkg.popular ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5"} backdrop-blur-sm`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3 fill-current" />
                    REKOMENDASI (PALING LARIS)
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-space font-bold mb-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-xl font-semibold">
                      {pkg.info}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">Masa aktif 30 hari</span>
                </div>

                <div className="mb-8 flex-1">
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold font-space text-indigo-300">
                      {pkg.price}
                    </span>
                  </div>
                </div>

                <ul className="mb-8 space-y-2 text-sm text-zinc-400 border-t border-zinc-800/60 pt-4">
                  <li className="flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Akses Penuh Arsitektur & PRD</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Teknologi AI Gemini 3.5 Flash</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Masa Aktif Paket 30 Hari</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleBuy(pkg)}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${pkg.popular ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]" : "bg-white hover:bg-zinc-200 text-black"}`}
                >
                  Beli Paket ini
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TopUp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-black">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <TopUpContent />
    </Suspense>
  );
}
