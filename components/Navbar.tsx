'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Coins, LogIn, LogOut, Github } from 'lucide-react';
import { useAppContext } from '@/lib/context';

export function Navbar() {
  const { user, logout } = useAppContext();
  const router = useRouter();

  return (
    <nav className="relative z-10 px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between w-full">
      <Link href="/" className="flex items-center group">
        <img src="https://storage.googleapis.com/timetraq-public/other/temankecil/Logo%20Teman%20Coding%20trans.png" alt="Temancoding Logo" className="h-10 sm:h-12 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <a 
          href="https://github.com/akmal31/temancoding"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors font-medium text-xs sm:text-sm cursor-pointer"
        >
          <Github className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        {user ? (
          <>
            <Link 
              href="/topup" 
              className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-1.5 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">
                  {user.is_unlimited && (!user.credits_expired_at || new Date() < new Date(user.credits_expired_at)) ? (
                    "Unlimited"
                  ) : user.credits_expired_at && new Date() > new Date(user.credits_expired_at) ? (
                    "Kredit Expired"
                  ) : (
                    `${user.credits} Credits`
                  )}
                </span>
              </div>
              <div className="w-[1px] h-4 bg-zinc-700 hidden sm:block"></div>
              <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hidden sm:block">TOP UP</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-zinc-500">Pro Developer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 p-[2px] group/avatar relative focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={logout}
                  className="absolute inset-0 w-full h-full opacity-0 group-hover/avatar:opacity-100 bg-black/60 rounded-full flex items-center justify-center text-white transition-opacity"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link 
            href="/login"
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors font-bold text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
