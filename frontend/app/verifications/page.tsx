'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { CheckCircle2, AlertOctagon, Clock, Shield } from 'lucide-react';

export default function VerificationRunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>('/verifications');
      setRuns(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const filtered = runs.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'SAT') return r.result === 'SAT';
    if (filter === 'UNSAT') return r.result === 'UNSAT';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Z3 Verification Executions</h1>
          <p className="text-xs text-zinc-400 mt-1">Formal mathematical satisfiability checks per action.</p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 p-1 border border-zinc-800 rounded text-xs font-medium">
          {['ALL', 'SAT', 'UNSAT'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded transition-colors ${
                filter === f ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading Z3 verification runs...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">No verification runs match the selected filter.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] bg-zinc-900/50">
                <th className="py-3 pl-4">Timestamp</th>
                <th className="py-3">Solver</th>
                <th className="py-3">Formal Constraint Evaluated</th>
                <th className="py-3">Z3 Result</th>
                <th className="py-3 text-right pr-4">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 pl-4 text-zinc-400 text-[11px]">{new Date(r.created_at).toLocaleTimeString()}</td>
                  <td className="py-3 font-sans text-blue-400 uppercase font-semibold">{r.solver}</td>
                  <td className="py-3 text-zinc-300 max-w-md truncate">{r.constraint_evaluated}</td>
                  <td className="py-3">
                    {r.result === 'SAT' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                        <CheckCircle2 className="w-3 h-3" /> SAT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800/80">
                        <AlertOctagon className="w-3 h-3" /> UNSAT
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right pr-4 text-blue-400 font-bold">{r.verification_time_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
