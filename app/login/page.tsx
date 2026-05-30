'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (process.env.NODE_ENV !== 'production') {
      signIn('credentials', { callbackUrl: redirect });
      return;
    }
    
    const width = 500;
    const height = 600;
    const left = typeof window !== 'undefined' ? window.screenX + (window.outerWidth - width) / 2 : 0;
    const top = typeof window !== 'undefined' ? window.screenY + (window.outerHeight - height) / 2 : 0;
    
    // We direct the popup to NextAuth's signin route and tell it to redirect to /auth-success when done
    const authUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent('/auth-success')}`;
    const popup = window.open(authUrl, 'google-login', `width=${width},height=${height},left=${left},top=${top}`);
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage);
        window.location.href = redirect;
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      
      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          window.location.href = redirect;
        }
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative p-6">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <h1 className="text-3xl font-space font-bold mb-2">Masuk</h1>
        <p className="text-zinc-400 mb-8 font-light">
          {process.env.NODE_ENV !== 'production' 
            ? "Mode Lokal: Login otomatis tanpa akun Google."
            : "Login pakai Google biar bisa simpen progress bikin app kamu."}
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black px-6 py-4 rounded-xl font-medium transition-colors"
        >
          {process.env.NODE_ENV !== 'production' ? null : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
          )}
          {process.env.NODE_ENV !== 'production' ? "Masuk Lokal (Bypass)" : "Masuk dengan Google"}
        </button>
      </motion.div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6"><div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
