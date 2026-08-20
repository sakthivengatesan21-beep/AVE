'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { FileText, Search } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>('/audit-logs');
      setLogs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Append-Only Audit Log</h1>
        <p className="text-xs text-zinc-400 mt-1">Immutable evidence trail of all gateway events, policy resolutions, and Z3 outcomes.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">No audit logs recorded yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] bg-zinc-900/50">
                <th className="py-3 pl-4">Timestamp</th>
                <th className="py-3">Event Type</th>
                <th className="py-3">Action ID</th>
                <th className="py-3 pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 pl-4 text-zinc-400 text-[11px]">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="py-3 font-sans text-blue-400 font-bold text-[11px]">{l.event_type}</td>
                  <td className="py-3 text-zinc-500 text-[10px]">{l.action_id?.slice(0, 8) || 'N/A'}</td>
                  <td className="py-3 pr-4 text-zinc-400 max-w-md truncate">{JSON.stringify(l.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
