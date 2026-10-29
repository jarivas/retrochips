/**
 * ChipSelector.tsx - Visual console & sound chip selector grid
 */

import React from 'react';
import { CHIP_REGISTRY, ChipId } from '../lib/retrochips';
import { Cpu, Gamepad2, Radio, Sparkles } from 'lucide-react';

interface ChipSelectorProps {
  selectedChip: ChipId;
  onSelectChip: (id: ChipId) => void;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  onSelectChip
}) => {
  const chips = Object.values(CHIP_REGISTRY);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
      {chips.map((chip) => {
        const isSelected = selectedChip === chip.id;

        return (
          <button
            key={chip.id}
            onClick={() => onSelectChip(chip.id)}
            className={`group relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-neutral-900 border-neutral-700 shadow-md ring-1 ring-amber-500/40'
                : 'bg-neutral-950/80 hover:bg-neutral-900/60 border-neutral-800/80 text-neutral-400'
            }`}
          >
            {/* Top metadata row */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[11px] font-mono text-neutral-500 font-medium">
                {chip.year}
              </span>
              <span
                className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                style={{ backgroundColor: chip.accentHex }}
              />
            </div>

            {/* Hardware & Chip Name */}
            <div className="mb-1">
              <h4
                className={`text-xs font-bold font-mono tracking-tight transition-colors line-clamp-1 ${
                  isSelected ? 'text-neutral-100' : 'text-neutral-300 group-hover:text-neutral-100'
                }`}
              >
                {chip.name.split(' ')[0]} {chip.name.split(' ')[1] || ''}
              </h4>
              <p className="text-[11px] text-neutral-500 truncate">
                {chip.consoles[0].split('(')[0].trim()}
              </p>
            </div>

            {/* Architecture pill/type */}
            <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
              <span className="text-neutral-400 font-mono">
                {chip.specs.channels} Ch
              </span>
              <span className="text-neutral-500 uppercase tracking-wider text-[9px] font-mono">
                {chip.id === 'ym2612' ? 'FM 4-Op' : chip.id === 'snes_sdsp' ? 'DSP Sample' : chip.id === 'sid6581' ? 'Analog Synth' : 'PSG'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
