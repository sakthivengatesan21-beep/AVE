'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getRooms, getEvidence, addEvidence } from '@/lib/storage';
import { Room, Evidence, ConditionTag } from '@/lib/types';
import { Camera, Check, Plus, Sparkles, Tag, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function MoveInDocumentationPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || 'prop-greenwood-204';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [conditionTag, setConditionTag] = useState<ConditionTag>('clean');
  const [analyzing, setAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const rList = await getRooms(propertyId);
      setRooms(rList);
      if (rList.length > 0) setSelectedRoomId(rList[0].id);

      const evList = await getEvidence(propertyId);
      setEvidenceList(evList.filter((e) => e.type === 'move_in'));
    }
    load();
  }, [propertyId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !selectedRoom) return;

    setAnalyzing(true);
    try {
      // Call AI vision endpoint
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: photoUrl,
          roomName: selectedRoom.name,
        }),
      });

      const aiData = await res.json();

      const newEv = await addEvidence({
        room_id: selectedRoom.id,
        type: 'move_in',
        file_url: photoUrl,
        captured_at: new Date().toISOString(),
        description: description || `Move-in photo for ${selectedRoom.name}`,
        condition_tags: [conditionTag],
        ai_analysis: aiData,
      });

      setEvidenceList([...evidenceList, newEv]);
      setPhotoUrl('');
      setDescription('');
      setSuccessMsg(`Baseline photo uploaded and analyzed for ${selectedRoom.name}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono uppercase font-semibold">
                Phase 1
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Move-In Evidence Documentation</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Establish an indisputable baseline record of room conditions at move-in handover
            </p>
          </div>

          <Link
            href={`/properties/${propertyId}/maintenance`}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <span>Next: Maintenance Events</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>

        {/* Room Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60">
          {rooms.map((room) => {
            const count = evidenceList.filter((e) => e.room_id === room.id).length;
            const isSelected = room.id === selectedRoomId;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span>{room.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form: Upload Move-In Evidence */}
          <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 h-fit">
            <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                Upload Move-In Photo
              </h2>
              <span className="text-[10px] font-mono text-blue-400">{selectedRoom?.name}</span>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Image URL / File Path</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Provide sample photo URL or paste web image link</p>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Condition Tag</label>
                <select
                  value={conditionTag}
                  onChange={(e) => setConditionTag(e.target.value as ConditionTag)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 capitalize"
                >
                  <option value="clean">Clean / Intact</option>
                  <option value="minor_crack">Minor Crack</option>
                  <option value="stain">Stain / Discoloration</option>
                  <option value="scratch">Scratch / Abrasion</option>
                  <option value="dent">Dent / Mark</option>
                  <option value="water_mark">Water Mark</option>
                  <option value="other">Other Pre-existing</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Description & Location Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Hairline crack beside kitchen window frame noted at move-in."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Photo with Vision AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Run AI Vision Scan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Evidence Grid Display for Selected Room */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Baseline Evidence Photos for {selectedRoom?.name}
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">
                {evidenceList.filter((e) => e.room_id === selectedRoomId).length} Photos Captured
              </span>
            </div>

            {evidenceList.filter((e) => e.room_id === selectedRoomId).length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>No move-in photos captured for {selectedRoom?.name} yet.</p>
                <p className="text-[11px] text-zinc-600">Use the upload panel to add baseline evidence.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidenceList
                  .filter((e) => e.room_id === selectedRoomId)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden space-y-3 p-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                        <img src={ev.file_url} alt="Move in evidence" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur text-blue-400 border border-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                          MOVE-IN BASELINE
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                          <span className="font-mono">{new Date(ev.captured_at).toLocaleDateString()}</span>
                          <span className="capitalize px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                            {ev.condition_tags?.[0]?.replace('_', ' ') || 'baseline'}
                          </span>
                        </div>

                        <p className="text-zinc-200 leading-relaxed">{ev.description}</p>

                        {ev.ai_analysis && (
                          <div className="p-2.5 bg-zinc-900 border border-blue-900/50 rounded-lg text-[11px] space-y-1">
                            <span className="text-blue-400 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Visual AI Findings:
                            </span>
                            <p className="text-zinc-300">{ev.ai_analysis.summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
