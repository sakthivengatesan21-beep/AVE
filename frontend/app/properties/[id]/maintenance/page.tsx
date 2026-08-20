'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Timeline from '@/components/Timeline';
import {
  getRooms,
  getMaintenanceEvents,
  addMaintenanceEvent,
  getEvidence
} from '@/lib/storage';
import { Room, MaintenanceEvent, MaintenanceCategory, Evidence } from '@/lib/types';
import { Wrench, Plus, Calendar, FileText, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function MaintenanceEventsPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || 'prop-greenwood-204';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceEvent[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [category, setCategory] = useState<MaintenanceCategory>('water_leakage');
  const [date, setDate] = useState('2026-10-12');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'reported' | 'in_progress' | 'resolved'>('resolved');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const rList = await getRooms(propertyId);
      setRooms(rList);
      if (rList.length > 0) setSelectedRoomId(rList[0].id);

      const mList = await getMaintenanceEvents(propertyId);
      setMaintenanceList(mList);

      const eList = await getEvidence(propertyId);
      setEvidenceList(eList);
    }
    load();
  }, [propertyId]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !selectedRoomId) return;

    const newEvent = await addMaintenanceEvent({
      property_id: propertyId,
      room_id: selectedRoomId,
      date,
      category,
      description,
      status,
      attachments: [],
    });

    setMaintenanceList([...maintenanceList, newEvent]);
    setDescription('');
    setSuccessMsg('Maintenance incident event logged to chronological property record.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono uppercase font-semibold">
                Phase 2
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Maintenance Timeline & Incident Log</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Document water leaks, repairs, plumbing events, and contractor receipts during tenancy
            </p>
          </div>

          <Link
            href={`/properties/${propertyId}/move-out`}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <span>Next: Move-Out Evidence</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form: Add Maintenance Event */}
          <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 h-fit">
            <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Add Maintenance Event
              </h2>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Affected Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 capitalize"
                >
                  <option value="water_leakage">Water Leakage / Moisture</option>
                  <option value="plumbing">Plumbing Repair</option>
                  <option value="structural">Structural / Drywall</option>
                  <option value="electrical">Electrical System</option>
                  <option value="appliance">Appliance Servicing</option>
                  <option value="heating_cooling">Heating / Cooling</option>
                  <option value="other">Other Incident</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Incident Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Resolution Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="reported">Reported / Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved / Repaired</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Incident & Work Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g., Water leaking from ceiling near kitchen window pipe riser during heavy upper-floor drainage."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Save Maintenance Event</span>
              </button>
            </form>
          </div>

          {/* Timeline View Column */}
          <div className="lg:col-span-2">
            <Timeline evidenceList={evidenceList} maintenanceList={maintenanceList} />
          </div>

        </div>

      </main>
    </div>
  );
}
