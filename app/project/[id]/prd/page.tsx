'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Download, FileText, Code } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';

export default function PRDPage() {
  const params = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const id = params.id as string;
    
    const loadPrd = async () => {
      let parsed = null;
      let dbFailed = false;

      // Ensure we check session first if needed, but since we don't have session status 
      // directly here, let's just attempt fetch and gracefully fail to localStorage
      try {
        const res = await fetch(`/api/projects/get?id=${id}`);
        if (res.ok) {
           const dbProject = await res.json();
           parsed = dbProject.answers || { idea: dbProject.idea, id: dbProject.id, prd: dbProject.prd_result };
           
           if (!parsed.prd && dbProject.prd_result) {
              parsed.prd = dbProject.prd_result;
           }
        } else {
           dbFailed = true;
        }
      } catch (err) {
        dbFailed = true;
      }

      if (!parsed || dbFailed) {
        const stored = localStorage.getItem(`project_${id}`);
        if (stored) {
          parsed = JSON.parse(stored);
        }
      }

      if (!parsed) {
        router.replace('/');
        return;
      }
      
      if (!parsed.prd) {
        router.replace(`/project/${id}/questions`);
        return;
      }
      
      setProject(parsed);
    };

    loadPrd();
  }, [params.id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (!project) return null;

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 print:hidden">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Buat Project Baru
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(project.prd);
                alert('PRD disalin ke clipboard!');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl px-5 py-2.5 font-medium transition-colors text-sm"
            >
              <Code className="w-4 h-4" />
              Copy
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 rounded-xl px-5 py-2.5 font-medium transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 print:bg-white border border-white/5 print:border-none rounded-3xl p-8 sm:p-12 prose prose-invert print:prose-p:text-black print:prose-headings:text-black print:prose-li:text-black prose-indigo max-w-none"
        >
          <div className="print:hidden mb-12 flex items-center gap-4 text-indigo-400 border-b border-white/10 pb-6">
            <FileText className="w-8 h-8" />
            <h1 className="text-2xl font-space font-bold m-0 text-white">Product Requirements & Architecture</h1>
          </div>
          
          <div className="markdown-body font-sans text-zinc-300 leading-relaxed text-base print:text-black">
            <Markdown remarkPlugins={[remarkGfm]}>
              {project.prd}
            </Markdown>
          </div>
        </motion.div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; }
          .markdown-body { color: black !important; }
          .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { color: black !important; border-bottom-color: #ddd !important; }
          .markdown-body table { border-color: #ddd !important; }
          .markdown-body th, .markdown-body td { border-color: #ddd !important; }
          .markdown-body code { background: #f5f5f5 !important; color: #333 !important; }
        }
      `}} />
    </main>
  );
}
