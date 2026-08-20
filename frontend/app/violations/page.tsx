'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { AlertTriangle, Wrench, Shield } from 'lucide-react';

export default function ViolationsPage() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadViolations = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>('/violations');
      setViolations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Blocked Policy Violations</h1>
        <p className="text-xs text-zinc-400 mt-1">Actions rejected by Z3 formal verification before hitting external tools.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading violations...</div>
        ) : violations.length === 0 ? (
          <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-xs text-zinc-500">
            No policy violations recorded yet.
          </div>
        ) : (
          violations.map((v) => (
            <div key={v.id} className="p-5 bg-zinc-950 border border-rose-900/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="font-bold text-xs text-rose-300 font-mono">VIOLATION #{v.id.slice(0, 8)}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-rose-950 text-rose-400 border border-rose-800">
                  {v.severity} SEVERITY
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-zinc-500 font-mono">REASON:</span>
                  <p className="text-zinc-200 mt-0.5 font-medium">{v.reason}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-zinc-900 rounded border border-zinc-800 font-mono">
                    <span className="text-zinc-500 text-[10px]">EXPECTED CONDITION:</span>
                    <p className="text-emerald-400 mt-1">{v.expected_condition}</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded border border-zinc-800 font-mono">
                    <span className="text-zinc-500 text-[10px]">ACTUAL VALUES RECEIVED:</span>
                    <pre className="text-rose-300 mt-1 text-[11px]">{JSON.stringify(v.actual_values, null, 2)}</pre>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-900/50 rounded font-mono flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-blue-400 text-[10px] font-bold">REPAIR GUIDANCE SUGGESTION:</span>
                    <p className="text-zinc-300 font-sans mt-0.5">{v.repair_guidance?.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
