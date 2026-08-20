'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  getProperties,
  getEvidence,
  getMaintenanceEvents,
  getAnalyses,
  getActivities
} from '@/lib/storage';
import { Property, Evidence, MaintenanceEvent, DamageAnalysis, ActivityLog } from '@/lib/types';
import {
  Building2,
  Camera,
  Wrench,
  LogOut,
  BrainCircuit,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export default function DashboardPage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceEvent[]>([]);
  const [analysesList, setAnalysesList] = useState<DamageAnalysis[]>([]);
  const [activityList, setActivityList] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const properties = await getProperties();
        const activeProp = properties[0] || null;
        setProperty(activeProp);

        if (activeProp) {
          const ev = await getEvidence(activeProp.id);
          const maint = await getMaintenanceEvents(activeProp.id);
          const anal = await getAnalyses(activeProp.id);
          const act = await getActivities(activeProp.id);

          setEvidenceList(ev);
          setMaintenanceList(maint);
          setAnalysesList(anal);
          setActivityList(act);
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute metrics
  const moveInEvidenceCount = evidenceList.filter((e) => e.type === 'move_in').length;
  const moveOutEvidenceCount = evidenceList.filter((e) => e.type === 'move_out').length;

  const moveInCompleteness = Math.min(100, Math.round((moveInEvidenceCount / 6) * 100)) || 86;
  const moveOutCompleteness = Math.min(100, Math.round((moveOutEvidenceCount / 6) * 100)) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Evidence Record Dashboard</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">
                Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time property condition tracking, maintenance logs, and damage attribution overview
            </p>
          </div>

          <Link
            href={`/properties/${property?.id || 'prop-greenwood-204'}/analysis`}
            className="self-start sm:self-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Run Damage Analysis</span>
          </Link>
        </div>

        {/* Active Property Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">{property?.name || 'Greenwood Apartment 204'}</h2>
                <p className="text-xs text-zinc-400">{property?.address || '742 Evergreen Terrace, Apt 204'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Move-In</span>
                <span className="text-zinc-200">{property?.move_in_date || '2026-01-15'}</span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Move-Out</span>
                <span className="text-zinc-200">{property?.move_out_date || '2026-12-31'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div>
              <span className="text-zinc-500 text-[11px] block">Landlord / Manager</span>
              <span className="font-semibold text-zinc-200">{property?.landlord_name || 'Apex Property Management'}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Documented Rooms</span>
              <span className="font-semibold text-zinc-200">6 Rooms</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Baseline Photos</span>
              <span className="font-semibold text-zinc-200">{moveInEvidenceCount} Uploaded</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Analyzed Issues</span>
              <span className="font-semibold text-blue-400">{analysesList.length} Detected</span>
            </div>
          </div>
        </div>

        {/* Evidence & Documentation Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Move-in Status */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Move-In Documentation</span>
              <Camera className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-zinc-100">{moveInCompleteness}%</span>
              <span className="text-[11px] text-emerald-400 font-medium">{moveInEvidenceCount} photos</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${moveInCompleteness}%` }} />
            </div>
          </div>

          {/* Move-out Status */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Move-Out Documentation</span>
              <LogOut className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-zinc-100">{moveOutCompleteness}%</span>
              <span className="text-[11px] text-zinc-500 font-medium">{moveOutEvidenceCount} photos</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${moveOutCompleteness}%` }} />
            </div>
          </div>

          {/* Maintenance Events */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Maintenance Events</span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-amber-400">{maintenanceList.length}</span>
              <span className="text-[11px] text-zinc-400">Recorded</span>
            </div>
            <p className="text-[11px] text-zinc-500">Includes leakage & repair logs</p>
          </div>

          {/* Issues Detected */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Issues Analyzed</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-rose-400">{analysesList.length}</span>
              <span className="text-[11px] text-zinc-400">Attributed</span>
            </div>
            <p className="text-[11px] text-zinc-500">Temporal reasoning applied</p>
          </div>

        </div>

        {/* Quick Action Buttons */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <Link
              href={`/properties/${property?.id || 'prop-greenwood-204'}/move-in`}
              className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
            >
              <div className="p-2 rounded bg-blue-950 text-blue-400 border border-blue-800 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-zinc-200 block group-hover:text-blue-400 transition-colors">
                  Document Move-In
                </span>
                <span className="text-[10px] text-zinc-500">Capture baseline</span>
              </div>
            </Link>

            <Link
              href={`/properties/${property?.id || 'prop-greenwood-204'}/maintenance`}
              className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
            >
              <div className="p-2 rounded bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-zinc-200 block group-hover:text-amber-400 transition-colors">
                  Add Maintenance Event
                </span>
                <span className="text-[10px] text-zinc-500">Log leak or repair</span>
              </div>
            </Link>

            <Link
              href={`/properties/${property?.id || 'prop-greenwood-204'}/move-out`}
              className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
            >
              <div className="p-2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-zinc-200 block group-hover:text-emerald-400 transition-colors">
                  Document Move-Out
                </span>
                <span className="text-[10px] text-zinc-500">Capture final state</span>
              </div>
            </Link>

            <Link
              href={`/properties/${property?.id || 'prop-greenwood-204'}/report`}
              className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
            >
              <div className="p-2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-zinc-200 block group-hover:text-indigo-400 transition-colors">
                  Generate Report
                </span>
                <span className="text-[10px] text-zinc-500">Download PDF</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Activity Log Feed */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Activity Feed
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">Live Timestamped</span>
          </div>

          <div className="space-y-3">
            {activityList.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60 hover:bg-zinc-900 transition-colors text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{act.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {act.type}
                    </span>
                  </div>
                  <p className="text-zinc-400">{act.description}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
