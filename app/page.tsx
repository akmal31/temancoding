"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [typedText, setTypedText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const fullText =
    "Ceritakan idemu dengan bahasa yang santai.\nKami akan merancang arsitektur dan langkah pembuatannya.";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastPath = localStorage.getItem("last_visited_path");
      if (lastPath && lastPath !== "/" && lastPath !== "/login" && lastPath !== "/tutorial") {
        router.replace(lastPath);
      }
    }
  }, [router]);

  useEffect(() => {
    // If user is logged in, check if there's a pending idea
    if (session?.user) {
      const pendingIdea = localStorage.getItem("pending_idea");
      if (pendingIdea) {
        localStorage.removeItem("pending_idea");

        // Auto submit the idea to create project
        const createPendingProject = async () => {
          setIsSubmitting(true);
          try {
            const res = await fetch("/api/projects/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idea: pendingIdea }),
            });
            if (!res.ok) throw new Error("Failed to create project");
            const data = await res.json();
            router.push(`/project/${data.id}/questions`);
          } catch (error) {
            console.error(error);
            setIsSubmitting(false);
          }
        };
        createPendingProject();
      }
    }
  }, [session, router]);

  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;

    // reset typedText before starting
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypedText("");

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        currentText += fullText[currentIndex];
        setTypedText(currentText);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (session?.user) {
        // Save to DB
        const res = await fetch("/api/projects/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea }),
        });
        if (!res.ok) throw new Error("Failed to create project");
        const data = await res.json();
        router.push(`/project/${data.id}/questions`);
      } else {
        // Save the idea temporarily
        localStorage.setItem("pending_idea", idea);
        // Redirect to login page
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full h-full">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4 text-center text-zinc-100 font-sans">
            Mau bikin apa{" "}
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              hari ini?
            </span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light min-h-[56px] whitespace-pre-line">
            {typedText}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[2px] h-[20px] bg-zinc-400 ml-1 align-middle"
            />
          </p>
          <br />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl flex flex-col items-center"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full bg-zinc-800/60 border border-zinc-600/50 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="isi dengan ide singkat mu, ga usah terlalu detail..."
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xl text-white placeholder-zinc-400 resize-none h-32"
              autoFocus
            />

            <div className="flex items-center justify-end mt-4">
              <button
                type="submit"
                disabled={!idea.trim() || isSubmitting}
                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-100 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? "Memproses..." : "Generate Architecture"}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
          <p className="mt-6 text-zinc-500 text-sm text-center">
            Mulai dari ide kasar, biarkan kami yang merumuskan menjadi rencana
            development yang siap dipakai AI.
          </p>
        </motion.div>
      </div>

      <footer className="relative z-10 px-6 sm:px-10 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-auto">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Auto-Save Drafts</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Setiap input tersimpan di Database kami.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">PDF Output Ready</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Siap paste ke AI Agent Coding andalanmu.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Precision AI</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Arsitektur minim halusinasi, langsung rapi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
