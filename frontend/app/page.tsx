'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Camera,
  Wrench,
  LogOut,
  BrainCircuit,
  FileText,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
  Scale
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-8">

            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence-Based Rental Damage Attribution System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Know what changed. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                Know what happened.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
              Document your rental&apos;s condition, connect maintenance history, and generate evidence-based damage analysis before a deposit dispute happens.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/properties"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                <span>Start Property Record</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>View Demo Record</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>

            {/* Neutrality Callout Banner */}
            <div className="pt-6 max-w-2xl mx-auto">
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 justify-center text-center">
                <Scale className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Objective analysis using transparent temporal evidence logic. Never claims legal liability.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Visual Workflow Diagram Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-zinc-950">
          <div className="max-w-6xl mx-auto space-y-12">

            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                How ProofStay Attributes Property Changes
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
                Connect physical photographs, timestamps, and building incident logs into an undeniable chronological proof chain.
              </p>
            </div>

            {/* Step Flow Box */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2 text-center flex flex-col items-center">
                <div className="p-2 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold text-blue-400">Step 1</span>
                <h3 className="text-xs font-bold text-zinc-200">MOVE-IN</h3>
                <p className="text-[11px] text-zinc-400">Capture baseline condition photos</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2 text-center flex flex-col items-center">
                <div className="p-2 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold text-sky-400">Step 2</span>
                <h3 className="text-xs font-bold text-zinc-200">CONDITION</h3>
                <p className="text-[11px] text-zinc-400">Tag room baseline items</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2 text-center flex flex-col items-center">
                <div className="p-2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold text-amber-400">Step 3</span>
                <h3 className="text-xs font-bold text-zinc-200">MAINTENANCE</h3>
                <p className="text-[11px] text-zinc-400">Log leaks & repair receipts</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2 text-center flex flex-col items-center">
                <div className="p-2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400">Step 4</span>
                <h3 className="text-xs font-bold text-zinc-200">MOVE-OUT</h3>
                <p className="text-[11px] text-zinc-400">Capture matching viewpoints</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2 text-center flex flex-col items-center">
                <div className="p-2 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold text-purple-400">Step 5</span>
                <h3 className="text-xs font-bold text-zinc-200">AI ANALYSIS</h3>
                <p className="text-[11px] text-zinc-400">Compare & temporal reasoning</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2 text-center flex flex-col items-center">
                <div className="p-2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold text-indigo-400">Step 6</span>
                <h3 className="text-xs font-bold text-zinc-200">REPORT</h3>
                <p className="text-[11px] text-zinc-400">Export downloadable PDF</p>
              </div>

            </div>

          </div>
        </section>

        {/* Feature Comparison Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
          <div className="max-w-5xl mx-auto space-y-12">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Traditional Inspection App
                </div>
                <ul className="space-y-3 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Only records photos without temporal correlation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Ignores building maintenance events during tenancy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Makes arbitrary or biased claims regarding tenant fault</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-zinc-950 border border-blue-800/80 rounded-xl space-y-4 shadow-xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  ProofStay Temporal Attribution
                </div>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Connects move-in evidence + maintenance events + move-out photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Uses transparent computer vision + chronological reasoning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Strictly objective, non-accusatory language with confidence factors</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500">
        <p>ProofStay — Evidence-Based Temporal Damage Attribution System</p>
      </footer>
    </div>
  );
}
