'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAppContext } from '@/lib/context';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, deductCredit } = useAppContext();
  
  const [project, setProject] = useState<any>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params.id as string;
    const stored = localStorage.getItem(`project_${id}`);
    
    if (!stored) {
      router.replace('/');
      return;
    }
    
    const parsed = JSON.parse(stored);
    
    const fetchQuestions = async (idea: string, projId: string, projData: any) => {
      try {
        const res = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setQuestions(data.questions);
        const updated = { ...projData, questions: data.questions, answers: {} };
        localStorage.setItem(`project_${projId}`, JSON.stringify(updated));
        
      } catch (err) {
        console.error(err);
        setError('Gagal mendapatkan pertanyaan dari AI. Coba muat ulang.');
      } finally {
        setLoading(false);
      }
    };
    
    // Disable exact setState in effect warning for now
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProject(parsed);
    
    if (parsed.questions && parsed.questions.length > 0) {
      setQuestions(parsed.questions);
      setAnswers(parsed.answers || {});
      setLoading(false);
    } else {
      fetchQuestions(parsed.idea, id, parsed);
    }
  }, [params.id, router]);

  const handleAnswer = (index: number, val: string) => {
    const newAnswers = { ...answers, [index]: val };
    setAnswers(newAnswers);
    
    // Save draft
    if (project) {
      const updated = { ...project, answers: newAnswers };
      localStorage.setItem(`project_${project.id}`, JSON.stringify(updated));
      setProject(updated);
    }
  };

  const handleGeneratePRD = async () => {
    // Explicitly save the answers right before generating or redirecting
    if (project) {
      const updated = { ...project, answers };
      localStorage.setItem(`project_${project.id}`, JSON.stringify(updated));
    }

    if (!user) {
      router.push(`/login?redirect=/project/${project?.id || params.id}/questions`);
      return;
    }

    if (!deductCredit()) {
      router.push(`/topup?redirect=/project/${project?.id || params.id}/questions`);
      return;
    }

    setGenerating(true);
    
    try {
      const mappedAnswers = questions.map((q, i) => ({
        pertanyaan: q,
        jawaban: answers[i] || 'Belum dijawab'
      }));

      const res = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: project.idea, answers: mappedAnswers }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Save PRD
      const updated = { ...project, prd: data.prd };
      localStorage.setItem(`project_${project.id}`, JSON.stringify(updated));
      
      router.push(`/project/${project.id}/prd`);
    } catch (err) {
      console.error(err);
      setError('Gagal membuat PRD. Silakan coba lagi.');
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 py-12">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Batal & Kembali
        </button>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-zinc-400 animate-pulse">AI lagi nyiapin pertanyaan buat ide kamu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm text-zinc-500 font-medium mb-2 uppercase tracking-wider">Ide Kamu</h3>
              <p className="text-lg text-zinc-300 italic">&quot;{project?.idea}&quot;</p>
            </div>

            <div>
              <h1 className="text-3xl font-space font-bold mb-2">Yuk, jelasin dikit lagi!</h1>
              <p className="text-zinc-400 mb-8">Biar hasil arsitektur &amp; PRD nya akurat, jawab pertanyaan singkat ini ya. Ga harus panjang-panjang.</p>
              
              <div className="space-y-8">
                {questions.map((q, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <label className="text-lg font-medium text-zinc-200">
                      <span className="text-indigo-400 font-space mr-2">Q{i + 1}.</span> {q}
                    </label>
                    <textarea 
                      value={answers[i] || ''}
                      onChange={(e) => handleAnswer(i, e.target.value)}
                      placeholder="Tulis jawabanmu di sini..."
                      className="w-full min-h-[100px] bg-zinc-900 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y text-zinc-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-white/10">
              <button
                onClick={handleGeneratePRD}
                disabled={generating}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-full px-8 py-4 font-medium transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sedang Meracik Arsitektur...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Arsitektur & PRD </span>
                    <span className="bg-black/20 text-xs px-2 py-0.5 rounded-full ml-1">1 Credit</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
            
          </motion.div>
        )}
      </div>
    </main>
  );
}
