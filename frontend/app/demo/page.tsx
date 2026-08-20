'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Play, Shield, AlertOctagon, CheckCircle2, ArrowRight, RotateCcw, Wrench, FileCode, Check } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  tool: string;
  arguments: any;
  expected: 'VERIFIED' | 'BLOCKED';
  policy: string;
}

const PREDEFINED_SCENARIOS: Scenario[] = [
  {
    id: 'scen-1',
    name: 'Safe Refund',
    description: 'Issue refund of ₹5,000 against original payment of ₹10,000.',
    tool: 'issue_refund',
    arguments: { refund_amount: 5000, original_payment: 10000 },
    expected: 'VERIFIED',
    policy: 'Refund Limit (refund_amount <= original_payment)'
  },
  {
    id: 'scen-2',
    name: 'Invalid Refund (Exceeds Payment)',
    description: 'Attempt to issue refund of ₹15,000 against original payment of ₹10,000.',
    tool: 'issue_refund',
    arguments: { refund_amount: 15000, original_payment: 10000 },
    expected: 'BLOCKED',
    policy: 'Refund Limit (refund_amount <= original_payment)'
  },
  {
    id: 'scen-3',
    name: 'High Transfer Without Approval',
    description: 'Transfer ₹75,000 without manager approval.',
    tool: 'transfer_money',
    arguments: { transfer_amount: 75000, manager_approval: false },
    expected: 'BLOCKED',
    policy: 'Transfer Limit (transfer_amount <= 50000 OR manager_approval == true)'
  },
  {
    id: 'scen-4',
    name: 'Approved High Transfer',
    description: 'Transfer ₹75,000 with manager approval.',
    tool: 'transfer_money',
    arguments: { transfer_amount: 75000, manager_approval: true },
    expected: 'VERIFIED',
    policy: 'Transfer Limit (transfer_amount <= 50000 OR manager_approval == true)'
  },
  {
    id: 'scen-5',
    name: 'Dangerous Prod Record Deletion',
    description: 'Attempt to delete database record in production environment.',
    tool: 'delete_record',
    arguments: { environment: 'production', operation: 'DELETE', table: 'users', record_id: 'usr_8812' },
    expected: 'BLOCKED',
    policy: 'Production DB Protection (environment != "production" OR operation != "DELETE")'
  }
];

export default function AgentDemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(PREDEFINED_SCENARIOS[0]);
  const [customArgs, setCustomArgs] = useState<string>(JSON.stringify(PREDEFINED_SCENARIOS[0].arguments, null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [retryResult, setRetryResult] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);

  const handleSelectScenario = (scen: Scenario) => {
    setSelectedScenario(scen);
    setCustomArgs(JSON.stringify(scen.arguments, null, 2));
    setResult(null);
    setRetryResult(null);
  };

  const handleExecuteToolCall = async () => {
    try {
      setLoading(true);
      setResult(null);
      setRetryResult(null);

      const parsedArgs = JSON.parse(customArgs);
      const res = await fetchApi<any>('/gateway/execute', {
        method: 'POST',
        body: JSON.stringify({
          agent_id: 'agent-expense-01',
          tool: selectedScenario.tool,
          arguments: parsedArgs
        })
      });

      setResult(res);
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryWithCorrection = async () => {
    if (!result?.action_id || !result?.repair_guidance) return;
    try {
      setRetrying(true);
      setRetryResult(null);

      // Auto-construct corrected arguments based on repair guidance or manual tweak
      let corrected: any = JSON.parse(customArgs);
      if (selectedScenario.tool === 'transfer_money') {
        corrected.transfer_amount = 40000;
        corrected.manager_approval = false;
      } else if (selectedScenario.tool === 'issue_refund') {
        corrected.refund_amount = 8000;
      } else if (selectedScenario.tool === 'delete_record') {
        corrected.environment = 'staging';
      }

      const res = await fetchApi<any>('/gateway/retry', {
        method: 'POST',
        body: JSON.stringify({
          action_id: result.action_id,
          corrected_arguments: corrected
        })
      });

      setRetryResult(res);
    } catch (err: any) {
      alert(`Retry execution failed: ${err.message}`);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Agent Tool Call Playground</h1>
        <p className="text-xs text-zinc-400 mt-1">Simulate AI agent tool calls and test live Z3 policy enforcement and self-correction retries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenario Selector Sidebar */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Demo Scenarios</h2>
          <div className="space-y-2">
            {PREDEFINED_SCENARIOS.map((scen) => {
              const isSelected = selectedScenario.id === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500/80 text-zinc-100 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>{scen.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      scen.expected === 'BLOCKED' ? 'bg-rose-950 text-rose-400 border border-rose-800/50' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    }`}>
                      {scen.expected}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">{scen.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Dispatcher Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs text-zinc-500 font-mono">TARGET TOOL:</span>
                <span className="ml-2 font-mono text-xs text-blue-400 font-bold">{selectedScenario.tool}</span>
              </div>
              <span className="text-[11px] text-zinc-500">{selectedScenario.policy}</span>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 font-medium mb-1.5">Action Parameters (JSON)</label>
              <textarea
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                rows={5}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <button
              onClick={handleExecuteToolCall}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Evaluating with Z3 Engine...' : 'Submit Action to AVE Gateway'}
            </button>
          </div>

          {/* Verification Result Output */}
          {result && (
            <div className={`p-5 rounded-lg border space-y-4 ${
              result.decision === 'BLOCK'
                ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
                : 'bg-emerald-950/20 border-emerald-800/80 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.decision === 'BLOCK' ? (
                    <AlertOctagon className="w-5 h-5 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="font-bold text-sm">
                    DECISION: {result.decision === 'BLOCK' ? 'ACTION BLOCKED' : 'ACTION VERIFIED & EXECUTED'}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Z3 Solver Time: {result.verification_time_ms} ms
                </span>
              </div>

              {result.decision === 'BLOCK' ? (
                <div className="space-y-3 bg-zinc-950/80 p-4 rounded border border-rose-900/50 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500">POLICY VIOLATION:</span>
                    <span className="ml-2 text-rose-300">{result.policy_name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">FORMAL CONSTRAINT:</span>
                    <div className="mt-1 p-2 bg-zinc-900 text-zinc-200 rounded border border-zinc-800">
                      {result.constraint}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Z3 PROOF:</span>
                    <span className="ml-2 text-rose-400 font-bold">{result.result} (UNSAT)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">REPAIR GUIDANCE:</span>
                    <p className="text-zinc-300 mt-1 font-sans text-xs">{result.repair_guidance?.suggestion}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-end">
                    <button
                      onClick={handleRetryWithCorrection}
                      disabled={retrying}
                      className="flex items-center gap-2 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded text-xs font-sans font-medium transition-colors"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                      {retrying ? 'Re-verifying Corrected Action...' : 'Execute Agent Auto-Correction Retry'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-zinc-950/80 p-4 rounded border border-emerald-900/50 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500">POLICY SATISFIED:</span>
                    <span className="ml-2 text-emerald-300">{result.policy_name || 'All system policies'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Z3 PROOF:</span>
                    <span className="ml-2 text-emerald-400 font-bold">SATISFIABLE (SAT)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">SIMULATED EXTERNAL TOOL OUTPUT:</span>
                    <pre className="mt-1 p-2.5 bg-zinc-900 text-emerald-300 rounded border border-zinc-800 text-[11px] overflow-x-auto">
                      {JSON.stringify(result.execution_result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Retry Result Panel */}
          {retryResult && (
            <div className="p-5 bg-emerald-950/20 border border-emerald-800/80 rounded-lg text-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">RETRY SUCCESSFUL: ACTION VERIFIED & EXECUTED</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">Fresh Z3 Time: {retryResult.verification_time_ms} ms</span>
              </div>
              <p className="text-xs text-zinc-300">The corrected action was re-submitted and passed formal Z3 evaluation.</p>
              <pre className="p-2.5 bg-zinc-950 text-emerald-300 rounded border border-zinc-800 text-[11px] font-mono overflow-x-auto">
                {JSON.stringify(retryResult.execution_result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
