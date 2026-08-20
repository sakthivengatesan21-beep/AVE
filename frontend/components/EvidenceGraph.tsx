'use client';

import React, { useState } from 'react';
import { DamageAnalysis } from '@/lib/types';
import { Network, FileText, Camera, Wrench, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface EvidenceGraphProps {
  analyses: DamageAnalysis[];
}

interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'move_in' | 'maintenance' | 'move_out' | 'conclusion';
  date?: string;
  details: {
    title: string;
    description: string;
    date?: string;
    photoUrl?: string;
    classification?: string;
  };
}

export default function EvidenceGraph({ analyses }: EvidenceGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Find water stain analysis or default to first
  const waterStainAnalysis = analyses.find((a) => a.issue.toLowerCase().includes('water')) || analyses[0];

  const graphNodes: GraphNode[] = [
    {
      id: 'node-in-01',
      label: 'Move-In Photo',
      sublabel: 'Ceiling baseline clean',
      type: 'move_in',
      date: 'Jan 15, 2026',
      details: {
        title: 'Move-In Baseline Evidence (Photo)',
        description: 'Photographic record of kitchen upper ceiling plaster showing 0% visible water staining at initial handover.',
        date: 'Jan 15, 2026',
        photoUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      id: 'node-maint-01',
      label: 'Water Leakage Report',
      sublabel: 'Ceiling pipe drip logged',
      type: 'maintenance',
      date: 'Oct 12, 2026',
      details: {
        title: 'Building Incident Report #maint-001',
        description: 'Active water leakage reported from upper floor drainage stack dripping through kitchen ceiling plaster.',
        date: 'Oct 12, 2026',
        photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      id: 'node-maint-02',
      label: 'Plumbing Repair',
      sublabel: 'Riser pipe fixed',
      type: 'maintenance',
      date: 'Oct 14, 2026',
      details: {
        title: 'Contractor Repair Log #maint-002',
        description: 'Plumbing contractor replaced defective pipe gasket. Ceiling drywall allowed to dry without repainting.',
        date: 'Oct 14, 2026',
      },
    },
    {
      id: 'node-out-01',
      label: 'Move-Out Photo',
      sublabel: 'Yellow water ring stain',
      type: 'move_out',
      date: 'Dec 28, 2026',
      details: {
        title: 'Move-Out Evidence Photo',
        description: 'Final inspection photo capturing visible 25cm yellow water ring at the former leak origin.',
        date: 'Dec 28, 2026',
        photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      id: 'node-[conclusion]',
      label: 'Attribution Result',
      sublabel: 'Likely maintenance-related',
      type: 'conclusion',
      details: {
        title: 'Temporal Evidence Attribution Assessment',
        description: 'Temporal reasoning confirms water stain occurred following documented Oct 12 leak prior to move-out handover.',
        classification: waterStainAnalysis?.classification || 'maintenance_related',
      },
    },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-5">
      <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" />
            Interactive Causal Evidence Graph
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Click any node below to inspect underlying physical evidence, photo records, and timeline connections
          </p>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
          Reasoning Chain
        </span>
      </div>

      {/* Visual Graph Nodes Flow Container */}
      <div className="relative py-8 px-4 bg-zinc-900/40 rounded-lg border border-zinc-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-3 relative z-10">
          {graphNodes.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;

            let nodeBadge = 'bg-blue-950 border-blue-800 text-blue-400';
            let icon = <Camera className="w-4 h-4" />;

            if (node.type === 'maintenance') {
              nodeBadge = 'bg-amber-950 border-amber-800 text-amber-400';
              icon = <Wrench className="w-4 h-4" />;
            } else if (node.type === 'move_out') {
              nodeBadge = 'bg-emerald-950 border-emerald-800 text-emerald-400';
              icon = <Camera className="w-4 h-4" />;
            } else if (node.type === 'conclusion') {
              nodeBadge = 'bg-purple-950 border-purple-800 text-purple-400';
              icon = <CheckCircle2 className="w-4 h-4" />;
            }

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`flex flex-col items-center text-center p-3 rounded-lg border transition-all cursor-pointer w-36 shrink-0 ${
                    isSelected
                      ? 'bg-zinc-800 border-blue-500 shadow-lg scale-105 ring-2 ring-blue-500/30'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className={`p-2 rounded-full border mb-2 ${nodeBadge}`}>
                    {icon}
                  </div>
                  <span className="text-xs font-semibold text-zinc-100 line-clamp-1">{node.label}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{node.sublabel}</span>
                  {node.date && (
                    <span className="mt-1.5 text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      {node.date}
                    </span>
                  )}
                </button>

                {/* Connecting Arrow Line */}
                {index < graphNodes.length - 1 && (
                  <div className="flex-1 flex items-center justify-center shrink-0">
                    <div className="h-0.5 w-full bg-gradient-to-r from-zinc-700 to-zinc-800 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-zinc-600" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="p-4 bg-zinc-900 border border-blue-800/80 rounded-lg space-y-3 relative animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-100 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-zinc-100">{selectedNode.details.title}</h4>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{selectedNode.details.description}</p>

          {selectedNode.details.photoUrl && (
            <div className="pt-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">Attached Photo Evidence:</span>
              <img
                src={selectedNode.details.photoUrl}
                alt="Evidence"
                className="w-32 h-20 object-cover rounded border border-zinc-800"
              />
            </div>
          )}

          {selectedNode.details.classification && (
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Attribution Conclusion:</span>
              <span className="font-semibold text-blue-400 uppercase tracking-wider bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                {selectedNode.details.classification.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
