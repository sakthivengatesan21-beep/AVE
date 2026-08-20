'use client';

import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';

export interface StagedStep {
  id: string;
  label: string;
}

const DEFAULT_STEPS: StagedStep[] = [
  { id: 'move_in', label: 'Analyzing move-in baseline evidence' },
  { id: 'compare', label: 'Comparing visual condition differences' },
  { id: 'timeline', label: 'Reviewing maintenance incident timeline' },
  { id: 'connect', label: 'Connecting temporal evidence graph' },
  { id: 'generate', label: 'Generating evidence-based assessment' },
];

interface StagedLoadingProps {
  steps?: StagedStep[];
  onComplete?: () => void;
  autoAdvanceMs?: number;
}

export default function StagedLoading({
  steps = DEFAULT_STEPS,
  onComplete,
  autoAdvanceMs = 800,
}: StagedLoadingProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, autoAdvanceMs);
      return () => clearTimeout(timer);
    } else if (currentStepIndex === steps.length && onComplete) {
      const completionTimer = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(completionTimer);
    }
  }, [currentStepIndex, steps.length, autoAdvanceMs, onComplete]);

  return (
    <div className="w-full max-w-lg mx-auto bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">AI Temporal Reasoning Pipeline</h3>
          <p className="text-xs text-zinc-400">Processing visual and chronological evidence logs...</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone
                  ? 'text-emerald-400 font-medium'
                  : isCurrent
                  ? 'text-blue-400 font-semibold text-sm'
                  : 'text-zinc-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  isDone
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : isCurrent
                    ? 'bg-blue-950 border-blue-500 text-blue-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                }`}
              >
                {isDone ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </div>

              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress Line */}
      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, (currentStepIndex / steps.length) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
