'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Activity, AlertOctagon, CheckCircle2, Search, X, Shield, Clock } from 'lucide-react';

export default function LiveActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [actionDetail, setActionDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadActions = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>('/actions');
      setActions(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
    const interval = setInterval(loadActions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectAction = async (id: string) => {
    try {
      setSelectedActionId(id);
      setDetailLoading(true);
      const res = await fetchApi<any>(`/actions/${id}`);
      setActionDetail(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = actions.filter((a) =>
    a.tool_name.toLowerCase().includes(search.toLowerCase()) ||
    a.status.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(a.arguments).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Live Actions Audit</h1>
          <p className="text-xs text-zinc-400 mt-1">Real-time log of all intercepted tool execution attempts.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 w-64"
          />
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        {loading && actions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading intercepted actions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">No actions match your search query.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] bg-zinc-900/50">
                <th className="py-3 pl-4">Timestamp</th>
                <th className="py-3">Tool Name</th>
                <th className="py-3">Arguments</th>
                <th className="py-3">Decision</th>
                <th className="py-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
              {filtered.map((a) => {
                const isBlocked = a.status === 'BLOCKED';
                return (
                  <tr key={a.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 pl-4 text-zinc-400 text-[11px]">{new Date(a.created_at).toLocaleTimeString()}</td>
                    <td className="py-3 font-sans text-blue-400 font-semibold">{a.tool_name}</td>
                    <td className="py-3 text-zinc-400 max-w-sm truncate">{JSON.stringify(a.arguments)}</td>
                    <td className="py-3">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800/80">
                          <AlertOctagon className="w-3 h-3" /> BLOCKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                          <CheckCircle2 className="w-3 h-3" /> EXECUTED
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-4">
                      <button
                        onClick={() => handleSelectAction(a.id)}
                        className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-300 font-sans text-[11px] transition-colors"
                      >
                        Inspect Proof
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Proof Inspector Drawer */}
      {selectedActionId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold text-zinc-100 font-mono">Verification Proof Drawer</h2>
              </div>
              <button
                onClick={() => { setSelectedActionId(null); setActionDetail(null); }}
                className="p-1 hover:bg-zinc-900 rounded text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading || !actionDetail ? (
              <div className="py-12 text-center text-xs text-zinc-500">Loading action verification evidence...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Overview Meta */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 font-mono">
                  <div>
                    <span className="text-zinc-500 text-[10px]">ACTION ID:</span>
                    <p className="text-zinc-200">{actionDetail.action.id}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px]">TOOL NAME:</span>
                    <p className="text-blue-400 font-bold">{actionDetail.action.tool_name}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px]">INTERCEPT STATUS:</span>
                    <p className={actionDetail.action.status === 'BLOCKED' ? 'text-rose-400' : 'text-emerald-400'}>
                      {actionDetail.action.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px]">AGENT:</span>
                    <p className="text-zinc-200">{actionDetail.agent?.name || 'System Agent'}</p>
                  </div>
                </div>

                {/* Runtime Arguments */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Runtime Action Arguments</h3>
                  <pre className="p-3 bg-zinc-900 rounded border border-zinc-800 text-zinc-300 font-mono overflow-x-auto">
                    {JSON.stringify(actionDetail.action.arguments, null, 2)}
                  </pre>
                </div>

                {/* Verification Runs */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Z3 Verification Runs</h3>
                  {actionDetail.verification_runs.map((vr: any) => (
                    <div key={vr.id} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 font-bold">Solver: {vr.solver.toUpperCase()}</span>
                        <span className={vr.result === 'SAT' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          Result: {vr.result}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px]">Constraint Evaluated:</span>
                        <p className="text-zinc-200 bg-zinc-950 p-2 rounded border border-zinc-800 mt-1">{vr.constraint_evaluated}</p>
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                        <span>Latency: {vr.verification_time_ms} ms</span>
                        <span>{new Date(vr.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Violations & Repair */}
                {actionDetail.violations && actionDetail.violations.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">Violation & Repair Guidance</h3>
                    {actionDetail.violations.map((vio: any) => (
                      <div key={vio.id} className="p-4 bg-rose-950/20 border border-rose-800/80 rounded space-y-2">
                        <p className="text-rose-300 font-sans">{vio.reason}</p>
                        <div className="p-3 bg-zinc-950 rounded border border-rose-900/50 font-mono text-[11px] text-zinc-300">
                          <span className="text-zinc-500">SUGGESTION: </span>
                          <span>{vio.repair_guidance?.suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
