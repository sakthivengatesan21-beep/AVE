'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ImageComparison from '@/components/ImageComparison';
import { getRooms, getEvidence, addEvidence } from '@/lib/storage';
import { Room, Evidence, ConditionTag } from '@/lib/types';
import { Camera, LogOut, Sparkles, CheckCircle2, Loader2, ArrowRight, Columns } from 'lucide-react';

export default function MoveOutDocumentationPage() {
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
      setEvidenceList(evList);
    }
    load();
  }, [propertyId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Separate evidence for selected room
  const moveInEvidence = evidenceList.find((e) => e.room_id === selectedRoomId && e.type === 'move_in');
  const moveOutEvidenceList = evidenceList.filter((e) => e.room_id === selectedRoomId && e.type === 'move_out');

  const handleUploadMoveOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !selectedRoom) return;

    setAnalyzing(true);
    try {
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
        type: 'move_out',
        file_url: photoUrl,
        captured_at: new Date().toISOString(),
        description: description || `Move-out photo for ${selectedRoom.name}`,
        condition_tags: [conditionTag],
        ai_analysis: aiData,
      });

      setEvidenceList([...evidenceList, newEv]);
      setPhotoUrl('');
      setDescription('');
      setSuccessMsg(`Move-out photo saved and compared for ${selectedRoom.name}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Move out upload error', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono uppercase font-semibold">
                Phase 3
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Move-Out Evidence Documentation</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Capture matching viewpoint photos at move-out handover for AI before/after comparison
            </p>
          </div>

          <Link
            href={`/properties/${propertyId}/analysis`}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Damage Analysis</span>
          </Link>
        </div>

        {/* Room Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60">
          {rooms.map((room) => {
            const hasMoveOut = evidenceList.some((e) => e.room_id === room.id && e.type === 'move_out');
            const isSelected = room.id === selectedRoomId;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span>{room.name}</span>
                {hasMoveOut && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
              </button>
            );
          })}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Interactive Comparison Module if Move-In & Move-Out photos exist */}
        {moveInEvidence && moveOutEvidenceList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Columns className="w-4 h-4 text-blue-400" />
                Side-By-Side Visual Comparison for {selectedRoom?.name}
              </h2>
            </div>
            <ImageComparison
              moveInUrl={moveInEvidence.file_url}
              moveOutUrl={moveOutEvidenceList[0].file_url}
              moveInDate={new Date(moveInEvidence.captured_at).toLocaleDateString()}
              moveOutDate={new Date(moveOutEvidenceList[0].captured_at).toLocaleDateString()}
              roomName={selectedRoom?.name}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Reference Move-In Baseline View */}
          <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800/80 pb-3">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Move-In Baseline Reference ({selectedRoom?.name})
              </h2>
            </div>

            {moveInEvidence ? (
              <div className="space-y-3 text-xs">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                  <img src={moveInEvidence.file_url} alt="Move-in reference" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur text-blue-400 border border-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                    BEFORE ({new Date(moveInEvidence.captured_at).toLocaleDateString()})
                  </div>
                </div>
                <p className="text-zinc-300 leading-relaxed">{moveInEvidence.description}</p>
                <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-400">
                  💡 Aim to capture your move-out photo from the exact same camera angle and framing.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800">
                No move-in baseline photo uploaded for {selectedRoom?.name}.
              </div>
            )}
          </div>

          {/* Form: Upload Move-Out Photo */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Capture Move-Out Photo ({selectedRoom?.name})
              </h2>
            </div>

            <form onSubmit={handleUploadMoveOut} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Move-Out Image URL / File Path</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Observed Move-Out State</label>
                <select
                  value={conditionTag}
                  onChange={(e) => setConditionTag(e.target.value as ConditionTag)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 capitalize"
                >
                  <option value="clean">Clean / Unchanged</option>
                  <option value="stain">New Stain Discoloration</option>
                  <option value="scratch">New Surface Scratch</option>
                  <option value="minor_crack">Expanded Crack</option>
                  <option value="water_mark">Water Ring Mark</option>
                  <option value="dent">New Dent / Hole</option>
                  <option value="other">Other Visual Change</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Move-Out Notes & Observations</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Water stain visible on ceiling plaster near former leak site."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Move-Out Photo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Move-Out Photo & Register Evidence</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
