'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Timeline from '@/components/Timeline';
import {
  getProperty,
  getRooms,
  getEvidence,
  getMaintenanceEvents,
  getAnalyses
} from '@/lib/storage';
import { Property, Room, Evidence, MaintenanceEvent, DamageAnalysis } from '@/lib/types';
import {
  Building2,
  Camera,
  Wrench,
  LogOut,
  BrainCircuit,
  FileText,
  CheckSquare,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || 'prop-greenwood-204';

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEvent[]>([]);
  const [analyses, setAnalyses] = useState<DamageAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const p = await getProperty(propertyId);
        const r = await getRooms(propertyId);
        const e = await getEvidence(propertyId);
        const m = await getMaintenanceEvents(propertyId);
        const a = await getAnalyses(propertyId);

        setProperty(p);
        setRooms(r);
        setEvidence(e);
        setMaintenance(m);
        setAnalyses(a);
      } catch (err) {
        console.error('Error loading property detail data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Title & Navigation Bar */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">{property?.name || 'Greenwood Apartment 204'}</h1>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{property?.address || '742 Evergreen Terrace, Apt 204'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/properties/${propertyId}/move-in`}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Move-In</span>
              </Link>
              <Link
                href={`/properties/${propertyId}/maintenance`}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Maintenance</span>
              </Link>
              <Link
                href={`/properties/${propertyId}/move-out`}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-emerald-400" />
                <span>Move-Out</span>
              </Link>
              <Link
                href={`/properties/${propertyId}/analysis`}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Analysis</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 text-[11px] block">Landlord / Manager</span>
              <span className="font-semibold text-zinc-200">{property?.landlord_name || 'Apex Management'}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Lease Dates</span>
              <span className="font-semibold text-zinc-200">{property?.move_in_date} → {property?.move_out_date}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Documented Rooms</span>
              <span className="font-semibold text-zinc-200">{rooms.length} Rooms</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Analyzed Findings</span>
              <span className="font-semibold text-blue-400">{analyses.length} Issues Attributed</span>
            </div>
          </div>
        </div>

        {/* Room Inspection Checklists Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              Room Inspection Checklists & Baseline Evidence
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">{rooms.length} Rooms Registered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const roomEv = evidence.filter((e) => e.room_id === room.id);
              const roomMaint = maintenance.filter((m) => m.room_id === room.id);

              return (
                <div
                  key={room.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-bold text-zinc-100">{room.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {roomEv.length} Photos
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Inspection Checklist:</span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-zinc-300 font-mono text-[11px]">
                      {room.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-emerald-400">
                          <span>✓</span>
                          <span className="text-zinc-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {roomMaint.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-amber-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>{roomMaint.length} maintenance event(s) logged</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline View */}
        <Timeline evidenceList={evidence} maintenanceList={maintenance} />

      </main>
    </div>
  );
}
