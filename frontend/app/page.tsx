'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Shield, CheckCircle2, AlertOctagon, Clock, Activity, ArrowRight, RefreshCw, Zap } from 'lucide-react';

interface DashboardSummary {
  total_actions: number;
  verified_actions: number;
  blocked_actions: number;
  avg_latency_ms: number;
  active_policies: number;
  active_agents: number;
  recent_activity: Array<{
    id: string;
    time: string;
    agent: string;
    tool: string;
    status: string;
    arguments: any;
  }>;
}

export default function OverviewPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi<DashboardSummary>('/dashboard/summary');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 font-sans tracking-tight">Verification Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">Monitor agent tool calls and formal policy enforcement in real time.</p>
        </div>
        <button
          onClick={loadSummary}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-md text-red-300 text-xs flex items-center justify-between">
          <span>Failed to connect to AVE backend: {error}</span>
          <button onClick={loadSummary} className="underline text-red-200">Retry</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Actions Intercepted</span>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            {loading && !data ? '...' : data?.total_actions || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">All agent tool call attempts</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Verified Actions (SAT)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {loading && !data ? '...' : data?.verified_actions || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Formal Z3 constraints satisfied</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Blocked Actions (UNSAT)</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {loading && !data ? '...' : data?.blocked_actions || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Prevented external tool calls</div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Verification Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-400">
            {loading && !data ? '...' : `${data?.avg_latency_ms || 0} ms`}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Average Z3 solver execution</div>
        </div>
      </div>

      {/* Real-time Activity Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Live Action Stream
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">Auto-polling 5s</span>
        </div>

        {loading && !data ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading activity...</div>
        ) : !data?.recent_activity || data.recent_activity.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">No agent actions recorded yet. Use the Agent Playground to send test tool calls.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Time</th>
                  <th className="pb-3">Agent</th>
                  <th className="pb-3">Tool</th>
                  <th className="pb-3">Parameters</th>
                  <th className="pb-3">Decision</th>
                  <th className="pb-3 text-right pr-2">Action ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono">
                {data.recent_activity.map((act) => {
                  const isBlocked = act.status === 'BLOCKED';
                  return (
                    <tr key={act.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 pl-2 text-zinc-400 text-[11px]">{act.time}</td>
                      <td className="py-3 font-sans text-zinc-200 font-medium">{act.agent}</td>
                      <td className="py-3 text-blue-400">{act.tool}</td>
                      <td className="py-3 text-zinc-400 max-w-xs truncate">{JSON.stringify(act.arguments)}</td>
                      <td className="py-3">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800/80">
                            <AlertOctagon className="w-3 h-3" /> BLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right pr-2 text-zinc-500 text-[10px]">{act.id.slice(0, 8)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
