'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Timeline from '@/components/Timeline';
import {
  getProperty,
  getEvidence,
  getMaintenanceEvents,
  getAnalyses
} from '@/lib/storage';
import { Property, Evidence, MaintenanceEvent, DamageAnalysis } from '@/lib/types';
import {
  FileText,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Scale,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react';

export default function ReportPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || 'prop-greenwood-204';

  const [property, setProperty] = useState<Property | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEvent[]>([]);
  const [analyses, setAnalyses] = useState<DamageAnalysis[]>([]);

  useEffect(() => {
    async function loadReportData() {
      const p = await getProperty(propertyId);
      const e = await getEvidence(propertyId);
      const m = await getMaintenanceEvents(propertyId);
      const a = await getAnalyses(propertyId);

      setProperty(p);
      setEvidence(e);
      setMaintenance(m);
      setAnalyses(a);
    }
    loadReportData();
  }, [propertyId]);

  const handlePrint = () => {
    window.print();
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'pre_existing':
        return '🟢 Pre-Existing';
      case 'maintenance_related':
        return '🔵 Maintenance-Related';
      case 'normal_wear':
        return '🟡 Normal Wear';
      case 'potentially_tenant':
        return '🔴 Potentially Tenant';
      case 'new_unexplained':
        return '🟠 New / Unexplained';
      default:
        return '⚪ Inconclusive';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans print:bg-white print:text-black">

      <div className="print:hidden">
        <Navigation />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Top Control Bar (Hidden during print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Evidence Attribution Report</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Official timestamped property evidence documentation summary report
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Official Printable Document Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 space-y-8 print:border-none print:p-0 print:text-black">

          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-zinc-800 print:border-black pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 print:text-black font-bold text-xl tracking-tight">
                <ShieldCheck className="w-6 h-6" />
                <span>ProofStay Evidence Report</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-gray-600">
                Temporal Property Condition & Damage Attribution Summary
              </p>
            </div>

            <div className="text-right text-xs font-mono text-zinc-400 print:text-gray-600">
              <p>Report ID: REP-{propertyId.slice(-6).toUpperCase()}</p>
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Section 1: Property Information */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 print:text-black uppercase tracking-wider">
              1. Property Information
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-900/50 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-lg text-xs">
              <div>
                <span className="text-zinc-500 print:text-gray-500 block text-[10px] uppercase">Property Name</span>
                <span className="font-semibold text-zinc-100 print:text-black">{property?.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block text-[10px] uppercase">Address</span>
                <span className="font-semibold text-zinc-100 print:text-black">{property?.address}</span>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block text-[10px] uppercase">Move-In Date</span>
                <span className="font-semibold text-zinc-100 print:text-black">{property?.move_in_date}</span>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block text-[10px] uppercase">Move-Out Date</span>
                <span className="font-semibold text-zinc-100 print:text-black">{property?.move_out_date}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Documentation Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 print:text-black uppercase tracking-wider">
              2. Documentation Summary
            </h2>

            <div className="grid grid-cols-4 gap-4 text-center text-xs">
              <div className="p-3 bg-zinc-900 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-lg">
                <span className="text-lg font-bold font-mono text-zinc-100 print:text-black block">6</span>
                <span className="text-[10px] text-zinc-400 print:text-gray-600">Rooms Documented</span>
              </div>
              <div className="p-3 bg-zinc-900 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-lg">
                <span className="text-lg font-bold font-mono text-zinc-100 print:text-black block">{evidence.length}</span>
                <span className="text-[10px] text-zinc-400 print:text-gray-600">Photos Collected</span>
              </div>
              <div className="p-3 bg-zinc-900 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-lg">
                <span className="text-lg font-bold font-mono text-amber-400 print:text-black block">{maintenance.length}</span>
                <span className="text-[10px] text-zinc-400 print:text-gray-600">Maintenance Events</span>
              </div>
              <div className="p-3 bg-zinc-900 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-lg">
                <span className="text-lg font-bold font-mono text-blue-400 print:text-black block">{analyses.length}</span>
                <span className="text-[10px] text-zinc-400 print:text-gray-600">Issues Analyzed</span>
              </div>
            </div>
          </div>

          {/* Section 3: Detected Changes Summary Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 print:text-black uppercase tracking-wider">
              3. Detected Condition Changes
            </h2>

            <div className="overflow-x-auto border border-zinc-800 print:border-gray-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-900 print:bg-gray-200 text-zinc-400 print:text-black border-b border-zinc-800 print:border-gray-300 uppercase text-[10px]">
                    <th className="p-3">Issue Point</th>
                    <th className="p-3">Visual Change</th>
                    <th className="p-3">Likely Category</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3 text-right">Evidence Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-gray-300 text-zinc-200 print:text-black">
                  {analyses.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 font-semibold">{a.issue}</td>
                      <td className="p-3 capitalize text-zinc-400 print:text-gray-700">{a.change_detected.replace('_', ' ')}</td>
                      <td className="p-3 font-medium">{getCategoryBadge(a.classification)}</td>
                      <td className="p-3 uppercase font-mono text-[11px] text-blue-400 print:text-black">{a.confidence}</td>
                      <td className="p-3 text-right uppercase font-mono text-[11px] text-emerald-400 print:text-black">{a.evidence_strength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Detailed Findings */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-400 print:text-black uppercase tracking-wider">
              4. Detailed Issue Findings & Reasoning
            </h2>

            <div className="space-y-4">
              {analyses.map((a) => (
                <div key={a.id} className="p-4 bg-zinc-900/40 print:bg-gray-50 border border-zinc-800 print:border-gray-300 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 print:border-gray-300 pb-2">
                    <span className="font-bold text-xs text-zinc-100 print:text-black">{a.issue}</span>
                    <span className="text-[11px] font-medium">{getCategoryBadge(a.classification)}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-zinc-300 print:text-black list-disc list-inside">
                    {a.reasoning.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Important Legal Disclaimer */}
          <div className="p-4 bg-zinc-900 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-lg text-xs space-y-1 text-zinc-400 print:text-gray-700">
            <div className="flex items-center gap-2 text-zinc-200 print:text-black font-bold">
              <Scale className="w-4 h-4 text-blue-400 print:text-black" />
              <span>Important Disclaimer</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This report is an evidence organization and temporal visual analysis tool. It does not determine legal liability, contractual responsibility, or entitlement to a security deposit refund. Final decisions should be made by the relevant landlord, tenant, property manager, or qualified legal arbiter.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
