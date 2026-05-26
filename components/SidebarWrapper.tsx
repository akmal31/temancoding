'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Edit3, PlusCircle } from 'lucide-react';
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
  const pathname = usePathname();

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
    return <div className="flex w-full h-screen">{children}</div>;
  }

  if (!session?.user) {
    return <div className="flex w-full h-screen">{children}</div>;
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto hidden md:flex">
        <div className="p-6">
          <Link href="/" className="mb-8 flex items-center group">
            <img src="https://storage.googleapis.com/timetraq-public/other/temankecil/Logo%20Teman%20Coding%20trans.png" alt="Temancoding Logo" className="h-8 w-auto object-contain" />
          </Link>

          <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-medium transition-colors mb-6">
            <PlusCircle className="w-5 h-5" />
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
