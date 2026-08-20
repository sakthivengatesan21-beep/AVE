'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Bot, Shield, CheckCircle2 } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>('/agents');
      setAgents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Registered AI Agents</h1>
        <p className="text-xs text-zinc-400 mt-1">Monitored agent instances integrated with the AVE gateway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-zinc-500">Loading agents...</div>
        ) : (
          agents.map((a) => (
            <div key={a.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm text-zinc-100">{a.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {a.status}
                </span>
              </div>

              <p className="text-xs text-zinc-400">{a.description}</p>

              <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
                <span>AGENT ID:</span>
                <span className="text-zinc-300">{a.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
