'use client';

import React, { useState } from 'react';
import { Columns, SlidersHorizontal, ZoomIn, ZoomOut, Calendar, Tag } from 'lucide-react';

interface ImageComparisonProps {
  moveInUrl: string;
  moveOutUrl: string;
  moveInDate?: string;
  moveOutDate?: string;
  roomName?: string;
  issueName?: string;
}

export default function ImageComparison({
  moveInUrl,
  moveOutUrl,
  moveInDate = 'Jan 15, 2026',
  moveOutDate = 'Dec 28, 2026',
  roomName = 'Kitchen',
  issueName,
}: ImageComparisonProps) {
  const [mode, setMode] = useState<'slider' | 'side_by_side'>('side_by_side');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Top Header & Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/80">
              {roomName}
            </span>
            {issueName && (
              <span className="text-xs text-zinc-300 font-medium">{issueName}</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Interactive Move-In vs. Move-Out Visual Evidence Comparison</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Zoom controls */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
            <button
              onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.25))}
              className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-zinc-400 px-1 font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.25))}
              className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
            <button
              onClick={() => setMode('side_by_side')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                mode === 'side_by_side'
                  ? 'bg-zinc-800 text-blue-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setMode('slider')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                mode === 'slider'
                  ? 'bg-zinc-800 text-blue-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Slider</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Viewing Area */}
      {mode === 'side_by_side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Move In Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300 px-1">
              <span className="flex items-center gap-1 text-blue-400">
                <Tag className="w-3 h-3" /> Move-In Baseline
              </span>
              <span className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                <Calendar className="w-3 h-3" /> {moveInDate}
              </span>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 group">
              <img
                src={moveInUrl}
                alt="Move-In Baseline"
                className="w-full h-full object-cover transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur text-zinc-300 border border-zinc-800 text-[10px] font-medium px-2 py-0.5 rounded">
                BEFORE
              </div>
            </div>
          </div>

          {/* Move Out Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300 px-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <Tag className="w-3 h-3" /> Move-Out Evidence
              </span>
              <span className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                <Calendar className="w-3 h-3" /> {moveOutDate}
              </span>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 group">
              <img
                src={moveOutUrl}
                alt="Move-Out Evidence"
                className="w-full h-full object-cover transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur text-emerald-400 border border-emerald-800/80 text-[10px] font-semibold px-2 py-0.5 rounded">
                AFTER
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Slider Mode */
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 select-none">
          {/* Background Image: Move Out (After) */}
          <img
            src={moveOutUrl}
            alt="Move-Out Evidence"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(${zoomLevel})` }}
          />

          {/* Foreground Image: Move In (Before) Clipped */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={moveInUrl}
              alt="Move-In Baseline"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: `scale(${zoomLevel})`,
                width: '100%',
                maxWidth: 'none',
              }}
            />
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-lg cursor-ew-resize z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Interactive Range Input overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />

          {/* Labels */}
          <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur text-blue-400 border border-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded pointer-events-none">
            MOVE-IN ({moveInDate})
          </div>
          <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur text-emerald-400 border border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded pointer-events-none">
            MOVE-OUT ({moveOutDate})
          </div>
        </div>
      )}
    </div>
  );
}
