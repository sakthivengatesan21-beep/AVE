'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ImageComparison from '@/components/ImageComparison';
import EvidenceGraph from '@/components/EvidenceGraph';
import StagedLoading from '@/components/StagedLoading';
import {
  getProperty,
  getEvidence,
  getMaintenanceEvents,
  getAnalyses,
  saveAnalysis
} from '@/lib/storage';
import { Property, Evidence, MaintenanceEvent, DamageAnalysis } from '@/lib/types';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  RefreshCw,
  ShieldCheck,
  Layers,
  Info,
  Scale
} from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || 'prop-greenwood-204';

  const [property, setProperty] = useState<Property | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEvent[]>([]);
  const [analyses, setAnalyses] = useState<DamageAnalysis[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      const p = await getProperty(propertyId);
      const e = await getEvidence(propertyId);
      const m = await getMaintenanceEvents(propertyId);
      const a = await getAnalyses(propertyId);

      setProperty(p);
      setEvidence(e);
      setMaintenance(m);
      setAnalyses(a);
    }
    loadData();
  }, [propertyId]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
  };

  const handleLoadingComplete = async () => {
    try {
      const moveIn = evidence.filter((e) => e.type === 'move_in');
      const moveOut = evidence.filter((e) => e.type === 'move_out');

      const res = await fetch('/api/ai/attribute-damage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          moveInEvidence: moveIn,
          moveOutEvidence: moveOut,
          maintenanceEvents: maintenance,
        }),
      });

      const data = await res.json();
      if (data.analyses) {
        setAnalyses(data.analyses);
      }
    } catch (err) {
      console.error('Error executing attribution', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAnalysis = analyses[selectedIssueIndex] || analyses[0];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'pre_existing':
        return { label: '🟢 Pre-Existing', style: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
      case 'maintenance_related':
        return { label: '🔵 Maintenance-Related', style: 'bg-blue-950 text-blue-400 border-blue-800' };
      case 'normal_wear':
        return { label: '🟡 Normal Wear', style: 'bg-amber-950 text-amber-400 border-amber-800' };
      case 'potentially_tenant':
        return { label: '🔴 Potentially Tenant-Related', style: 'bg-rose-950 text-rose-400 border-rose-800' };
      case 'new_unexplained':
        return { label: '🟠 New / Unexplained', style: 'bg-orange-950 text-orange-400 border-orange-800' };
      default:
        return { label: '⚪ Inconclusive', style: 'bg-zinc-900 text-zinc-400 border-zinc-800' };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono uppercase font-semibold">
                Reasoning Engine
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">AI Temporal Damage Attribution</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Connect visual evidence, timestamps, and maintenance logs into objective damage attribution assessments
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Re-Run AI Analysis</span>
            </button>

            <Link
              href={`/properties/${propertyId}/report`}
              className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Generate Report</span>
            </Link>
          </div>
        </div>

        {/* Staged Loading Overlay */}
        {isAnalyzing ? (
          <div className="py-12">
            <StagedLoading onComplete={handleLoadingComplete} autoAdvanceMs={700} />
          </div>
        ) : (
          <div className="space-y-8">

            {/* Neutral Language Legal Notice */}
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-start gap-3 text-xs text-zinc-300">
              <Scale className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-zinc-100">Strict Non-Accusatory Analysis Policy</span>
                <p className="text-zinc-400 leading-relaxed">
                  ProofStay evaluates visual condition differences and temporal maintenance overlap. It does NOT claim legal liability or state "The tenant caused this". All assessments communicate likelihood and evidence strength.
                </p>
              </div>
            </div>

            {/* Issue Selector Tabs */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Detected Condition Change Points ({analyses.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analyses.map((item, idx) => {
                  const badge = getCategoryBadge(item.classification);
                  const isSelected = idx === selectedIssueIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedIssueIndex(idx)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-zinc-900 border-blue-500 shadow-lg ring-1 ring-blue-500/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.style}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.confidence} Confidence
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-zinc-100 line-clamp-1">{item.issue}</h3>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{item.reasoning[0]}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Issue Detail Breakdown Card */}
            {currentAnalysis && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-zinc-100">{currentAnalysis.issue}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getCategoryBadge(currentAnalysis.classification).style}`}>
                        {getCategoryBadge(currentAnalysis.classification).label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Temporal Evidence Assessment & Reasoned Conclusion
                    </p>
                  </div>

                  {/* Confidence & Evidence Strength Indicator */}
                  <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase block">AI Confidence</span>
                      <span className="font-bold text-blue-400 uppercase">{currentAnalysis.confidence}</span>
                    </div>
                    <div className="h-6 w-px bg-zinc-800" />
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase block">Evidence Strength</span>
                      <span className="font-bold text-emerald-400 uppercase">{currentAnalysis.evidence_strength}</span>
                    </div>
                  </div>
                </div>

                {/* Before / After Comparison */}
                {currentAnalysis.move_in_photo_url && currentAnalysis.move_out_photo_url && (
                  <ImageComparison
                    moveInUrl={currentAnalysis.move_in_photo_url}
                    moveOutUrl={currentAnalysis.move_out_photo_url}
                    moveInDate="Jan 15, 2026"
                    moveOutDate="Dec 28, 2026"
                    issueName={currentAnalysis.issue}
                  />
                )}

                {/* Evidence Reasoning Points */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    Evidence Reasoning Steps
                  </h4>

                  <ul className="space-y-2 text-xs text-zinc-300">
                    {currentAnalysis.reasoning.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                        <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* Interactive Causal Graph */}
            <EvidenceGraph analyses={analyses} />

          </div>
        )}

      </main>
    </div>
  );
}
