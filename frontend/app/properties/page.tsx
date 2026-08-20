'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getProperties, createProperty } from '@/lib/storage';
import { Property } from '@/lib/types';
import { Building2, Plus, Calendar, MapPin, User, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function PropertiesListPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    landlord_name: '',
    move_in_date: '2026-01-15',
    move_out_date: '2026-12-31',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const list = await getProperties();
      setProperties(list);
    }
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) return;

    const newProp = await createProperty({
      user_id: 'user-demo-01',
      name: form.name,
      address: form.address,
      landlord_name: form.landlord_name || 'Landlord/Manager',
      move_in_date: form.move_in_date,
      move_out_date: form.move_out_date,
    });

    setProperties([newProp, ...properties]);
    setShowCreateModal(false);
    setSuccessMsg('Your property evidence record has been created.');
    setTimeout(() => setSuccessMsg(null), 4000);
    setForm({
      name: '',
      address: '',
      landlord_name: '',
      move_in_date: '2026-01-15',
      move_out_date: '2026-12-31',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Property Records</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage your rental properties, baseline condition photo logs, and tenancy timeline records
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Property Record</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/80">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Active
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">
                    {prop.name}
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{prop.address}</span>
                  </p>
                </div>

                <div className="border-t border-zinc-800/80 pt-3 space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-500" /> Landlord:
                    </span>
                    <span className="font-medium text-zinc-200">{prop.landlord_name}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" /> Lease Term:
                    </span>
                    <span className="text-zinc-300">{prop.move_in_date} → {prop.move_out_date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <Link
                  href={`/properties/${prop.id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group/link"
                >
                  <span>Open Property Detail</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Property */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Create Property Evidence Record
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-400 hover:text-zinc-100 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Greenwood Apartment 204"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Full Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 742 Evergreen Terrace, Apt 204"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Landlord / Property Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Apex Property Management"
                    value={form.landlord_name}
                    onChange={(e) => setForm({ ...form, landlord_name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-300 mb-1">Move-In Date</label>
                    <input
                      type="date"
                      value={form.move_in_date}
                      onChange={(e) => setForm({ ...form, move_in_date: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-300 mb-1">Expected Move-Out</label>
                    <input
                      type="date"
                      value={form.move_out_date}
                      onChange={(e) => setForm({ ...form, move_out_date: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Create Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
