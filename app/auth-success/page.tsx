"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const isTopup = searchParams?.get("topup");

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS" }, "*");
      window.close();
    } else {
      if (isTopup) {
        // Refresh context for next-auth to get latest credits
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        window.location.href = "/";
      }
    }
  }, [isTopup]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-space">
      <p>
        {isTopup
          ? "Pembayaran berhasil. Sedang memproses creditmu..."
          : "Login berhasil. Jendela ini akan tertutup otomatis..."}
      </p>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
          <p>Processing...</p>
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
