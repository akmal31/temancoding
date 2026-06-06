'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Edit3, PlusCircle, Film, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Project = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/projects/list')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProjects(data);
          }
        })
        .catch(err => console.error(err));
    }
  }, [session, pathname]); // re-fetch when navigation happens (to update draft/completion status)

  if (status === 'loading') {
    return <>{children}</>;
  }

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto hidden md:flex">
        <div className="p-6">
          <Link 
            href="/" 
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("last_visited_path");
              }
            }}
            className="mb-8 flex items-center group"
          >
            <img src="https://storage.googleapis.com/timetraq-public/other/temankecil/Logo%20Teman%20Coding%20trans.png" alt="Temancoding Logo" className="h-8 w-auto object-contain" />
          </Link>

          <Link href="/tutorial" className="flex items-center gap-2 px-4 py-2.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/10 rounded-xl font-medium transition-colors mb-3 text-sm">
            <Film className="w-4 h-4 text-red-500" />
            Tutorial Video
          </Link>

          <Link 
            href="/" 
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("last_visited_path");
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-medium transition-colors mb-6 text-sm"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            New Project
          </Link>

          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">Your Projects</h3>
          <div className="flex flex-col gap-1">
            {projects.length === 0 ? (
              <p className="text-sm text-zinc-500 px-2 py-2">No projects yet.</p>
            ) : (
              projects.map(proj => (
                <Link 
                  key={proj.id} 
                  href={`/project/${proj.id}/questions`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    pathname?.includes(proj.id) ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  {proj.status === 'draft' ? (
                    <Edit3 className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <div className="flex-1 truncate text-sm">
                    {proj.title || 'Untitled Project'}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Trigger Button (Floating FAB) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-650 border border-indigo-500/30 text-white flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all active:scale-90 hover:brightness-110"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 z-[101] p-6 flex flex-col md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
                <Link 
                  href="/" 
                  onClick={() => {
                    setIsMobileOpen(false);
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("last_visited_path");
                    }
                  }} 
                  className="flex items-center"
                >
                  <img src="https://storage.googleapis.com/timetraq-public/other/temankecil/Logo%20Teman%20Coding%20trans.png" alt="Temancoding Logo" className="h-8 w-auto object-contain" />
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Link 
                href="/tutorial" 
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/10 rounded-2xl font-medium transition-colors mb-3 text-sm"
              >
                <Film className="w-5 h-5 text-red-500" />
                <span>Tutorial Video</span>
              </Link>

              <Link 
                href="/" 
                onClick={() => {
                  setIsMobileOpen(false);
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("last_visited_path");
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl font-medium transition-colors mb-6 text-sm"
              >
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <span>New Project</span>
              </Link>

              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">Your Projects</h3>
              <div className="flex flex-col gap-1 overflow-y-auto flex-1">
                {projects.length === 0 ? (
                  <p className="text-sm text-zinc-600 px-2 py-2">No projects yet.</p>
                ) : (
                  projects.map(proj => (
                    <Link 
                      key={proj.id} 
                      href={`/project/${proj.id}/questions`}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        pathname?.includes(proj.id) ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      {proj.status === 'draft' ? (
                        <Edit3 className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <div className="flex-1 truncate text-sm">
                        {proj.title || 'Untitled Project'}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
