'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Settings, Shield, Server, Database, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any>('/health');
      setHealth(res);
    } catch (err) {
      console.error(err);
      setHealth({ status: 'unhealthy', database_connected: false, solver: 'Z3 Unavailable' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">System Status & Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Runtime infrastructure, formal solver engine status, and database configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 font-sans font-bold text-zinc-100 border-b border-zinc-800 pb-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span>FastAPI Gateway Server</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">API STATUS:</span>
            <span className={health?.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}>
              {health?.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">ENVIRONMENT:</span>
            <span className="text-zinc-300">Production / Local Sandbox</span>
          </div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 font-sans font-bold text-zinc-100 border-b border-zinc-800 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Z3 Formal SMT Solver</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">SOLVER VERSION:</span>
            <span className="text-emerald-400">{health?.solver || 'Z3 SMT Solver'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">AST PARSER:</span>
            <span className="text-zinc-300">Safe Visitor (No eval)</span>
          </div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 font-sans font-bold text-zinc-100 border-b border-zinc-800 pb-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Database Storage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">SUPABASE / SQL:</span>
            <span className={health?.database_connected ? 'text-emerald-400' : 'text-rose-400'}>
              {health?.database_connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
