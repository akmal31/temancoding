"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { useRouter, useSearchParams } from "next/navigation";
import { Coins, Check, Zap } from "lucide-react";
import { motion } from "motion/react";

function TopUpContent() {
  const { user, addCredits } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  if (!user) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  const packages = [
    {
      id: "basic",
      name: "Starter",
      originalPrice: "Rp 50.000",
      price: "Rp 30.000",
      credits: 2,
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      originalPrice: "Rp 100.000",
      price: "Rp 50.000",
      credits: 5,
      popular: true,
    },
    {
      id: "max",
      name: "Max",
      originalPrice: "Rp 200.000",
      price: "Rp 100.000",
      credits: 12,
      popular: false,
    },
  ];

  const handleBuy = async (pkg: (typeof packages)[0]) => {
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseInt(pkg.price.replace(/\\D/g, "")),
          credits: pkg.credits,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        router.push(data.url);
      } else {
        alert(
          "Gagal menginisiasi pembayaran: " + (data.error || "Unknown error"),
        );
      }
    } catch (err) {
      alert("Error: " + err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center py-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-space mb-4">
            Isi Credit
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            1 Credit = 1x generate Arsitektur dan PRD secara lengkap. Beli
            paketan biar lebih hemat.
          </p>
        </div>

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
                  PALING LARIS
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-space font-bold mb-2">
                  {pkg.name}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="text-xl font-medium">
                    {pkg.credits} Credit
                  </span>
                </div>
              </div>

              <div className="mb-8 flex-1">
                <div className="flex flex-col">
                  <span className="text-zinc-500 line-through text-sm">
                    {pkg.originalPrice}
                  </span>
                  <span className="text-4xl font-bold font-space">
                    {pkg.price}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleBuy(pkg)}
                className={`w-full py-4 rounded-xl font-medium transition-all ${pkg.popular ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]" : "bg-white hover:bg-zinc-200 text-black"}`}
              >
                Beli Sekarang
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function TopUp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <TopUpContent />
    </Suspense>
  );
}
