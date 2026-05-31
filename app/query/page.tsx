'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Play } from 'lucide-react';

export default function QueryPage() {
  const { data: session, status } = useSession();
  const [sql, setSql] = useState('SELECT * FROM public.users LIMIT 10;');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunQuery = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/db-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Query failed');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return null;

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-zinc-400">Silakan login terlebih dahulu untuk mengakses halaman ini.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 py-12 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-space font-bold text-white mb-2">Database Query</h1>
          <p className="text-zinc-400 font-light">Jalankan query SQL langsung ke database yang terhubung.</p>
        </div>

        <div className="flex flex-col gap-4">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="w-full h-40 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-green-400 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="SELECT * FROM table_name;"
          />
          
          <div className="flex justify-end">
            <button
              onClick={handleRunQuery}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? <span className="animate-pulse">Loading...</span> : <><Play className="w-4 h-4" /> Run Query</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-zinc-400">
              Returned {result.rowCount} rows.
            </div>
            
            {result.rows && result.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      {Object.keys(result.rows[0]).map((key) => (
                        <th key={key} className="px-6 py-3 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {result.rows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-zinc-800/50">
                        {Object.values(row).map((val: any, j: number) => (
                          <td key={j} className="px-6 py-4 text-zinc-300">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800">
                No results or empty set.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
