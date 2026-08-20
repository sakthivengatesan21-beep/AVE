'use client';

import React from 'react';
import { Evidence, MaintenanceEvent } from '@/lib/types';
import { Camera, Wrench, Calendar, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

interface TimelineProps {
  evidenceList: Evidence[];
  maintenanceList: MaintenanceEvent[];
}

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  category: string;
  description: string;
  type: 'move_in' | 'move_out' | 'maintenance';
  status?: string;
  photoUrl?: string;
}

export default function Timeline({ evidenceList, maintenanceList }: TimelineProps) {
  const items: TimelineItem[] = [];

  evidenceList.forEach((e) => {
    items.push({
      id: e.id,
      date: e.captured_at ? new Date(e.captured_at).toISOString().split('T')[0] : '2026-01-15',
      title: e.type === 'move_in' ? 'Move-In Visual Evidence Captured' : 'Move-Out Visual Evidence Captured',
      category: e.type === 'move_in' ? 'Baseline Record' : 'Final Inspection',
      description: e.description || `Photographic condition record saved.`,
      type: e.type === 'move_in' ? 'move_in' : 'move_out',
      photoUrl: e.file_url,
    });
  });

  maintenanceList.forEach((m) => {
    items.push({
      id: m.id,
      date: m.date,
      title: `${m.category.replace('_', ' ').toUpperCase()} Maintenance Event`,
      category: 'Maintenance Log',
      description: m.description,
      type: 'maintenance',
      status: m.status,
    });
  });

  // Sort chronologically ascending
  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-6">
      <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Chronological Evidence & Event Timeline
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Temporal correlation between baseline condition, reported incidents, and move-out inspections
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
          {items.length} Chronological Points
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {items.map((item) => {
          let badgeBg = 'bg-blue-950/80 text-blue-400 border-blue-800/80';
          let icon = <Camera className="w-3.5 h-3.5 text-blue-400" />;

          if (item.type === 'move_out') {
            badgeBg = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
            icon = <Camera className="w-3.5 h-3.5 text-emerald-400" />;
          } else if (item.type === 'maintenance') {
            badgeBg = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
            icon = <Wrench className="w-3.5 h-3.5 text-amber-400" />;
          }

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs group-hover:border-blue-500 transition-colors">
                {icon}
              </div>

              {/* Event Content Card */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3.5 hover:border-zinc-700 transition-colors space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeBg}`}>
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">{item.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">{item.date}</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{item.description}</p>

                {item.status && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                    <span className="text-zinc-500">Status:</span>
                    <span className="capitalize font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </div>
                )}

                {item.photoUrl && (
                  <div className="pt-2">
                    <div className="relative w-24 h-16 rounded overflow-hidden border border-zinc-800 bg-zinc-950">
                      <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
