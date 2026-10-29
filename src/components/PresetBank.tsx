/**
 * PresetBank.tsx - Curated Sound Preset Bank
 */

import React, { useState } from 'react';
import { RETRO_PRESETS, RetroPreset, ChipId } from '../lib/retrochips';
import { Sparkles, Play, BookmarkCheck } from 'lucide-react';

interface PresetBankProps {
  onSelectPreset: (preset: RetroPreset) => void;
  activePresetId?: string;
}

export const PresetBank: React.FC<PresetBankProps> = ({
  onSelectPreset,
  activePresetId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Bass', 'Lead', 'Pad', 'Arp', 'Keys'];

  const filtered = selectedCategory === 'All'
    ? RETRO_PRESETS
    : RETRO_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider font-mono">
            Banco de Presets Clásicos
          </h3>
        </div>

        {/* Categories segmented buttons */}
        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 retro-scroll">
        {filtered.map((preset) => {
          const isActive = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer group ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                  : 'bg-neutral-950/80 hover:bg-neutral-900/70 border-neutral-800/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono uppercase text-neutral-500">
                  {preset.chipId.toUpperCase()}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-1.5">
                {preset.description}
              </p>

              {preset.inspiredBy && (
                <div className="text-[10px] text-neutral-500 italic">
                  Inspirado en: {preset.inspiredBy}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
