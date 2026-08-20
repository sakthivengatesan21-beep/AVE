'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { FileCode, Plus, Check, X, Shield, Trash2, Power } from 'lucide-react';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toolName, setToolName] = useState('issue_refund');
  const [policyType, setPolicyType] = useState('numeric_constraint');
  const [constraint, setConstraint] = useState('');
  const [severity, setSeverity] = useState('high');

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>('/policies');
      setPolicies(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleToggle = async (policy: any) => {
    try {
      await fetchApi(`/policies/${policy.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !policy.enabled })
      });
      loadPolicies();
    } catch (err: any) {
      alert(`Failed to update policy: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this formal policy?')) return;
    try {
      await fetchApi(`/policies/${id}`, { method: 'DELETE' });
      loadPolicies();
    } catch (err: any) {
      alert(`Failed to delete policy: ${err.message}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/policies', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          tool_name: toolName,
          policy_type: policyType,
          constraint_definition: constraint,
          severity,
          enabled: true
        })
      });
      setShowModal(false);
      setName('');
      setDescription('');
      setConstraint('');
      loadPolicies();
    } catch (err: any) {
      alert(`Failed to create policy: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Formal Policy Repository</h1>
          <p className="text-xs text-zinc-400 mt-1">Mathematical constraints translated into Z3 Python solver expressions.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Formal Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-zinc-500">Loading policies...</div>
        ) : (
          policies.map((p) => (
            <div key={p.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm text-zinc-100">{p.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                    p.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    {p.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400">{p.description}</p>

                <div className="space-y-1 font-mono text-xs">
                  <span className="text-zinc-500 text-[10px]">APPLIES TO TOOL:</span>
                  <span className="ml-2 text-blue-400 font-bold">{p.tool_name}</span>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <span className="text-zinc-500 text-[10px]">Z3 FORMAL CONSTRAINT:</span>
                  <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-200">
                    {p.constraint_definition}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">SEVERITY: {p.severity}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(p)}
                    className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-zinc-200"
                    title={p.enabled ? 'Disable Policy' : 'Enable Policy'}
                  >
                    <Power className={`w-4 h-4 ${p.enabled ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 hover:bg-zinc-900 rounded text-rose-500 hover:text-rose-400"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-zinc-100">Create New Formal Policy</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Policy Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Max Daily Withdrawal"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Restricts cash withdrawals above threshold"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Target Tool</label>
                  <input
                    type="text"
                    required
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                    <option value="medium">medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Formal Constraint Definition (Z3 Expression Syntax)</label>
                <input
                  type="text"
                  required
                  value={constraint}
                  onChange={(e) => setConstraint(e.target.value)}
                  placeholder="e.g. withdrawal_amount <= 20000 OR is_vip == true"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Save Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
