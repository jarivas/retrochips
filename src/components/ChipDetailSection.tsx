/**
 * ChipDetailSection.tsx - Comprehensive Chip Specification & Hardware History View
 */

import React from 'react';
import { ChipId, CHIP_REGISTRY } from '../lib/retrochips';
import { Cpu, Gamepad2, Calendar, Radio, Layers, Award } from 'lucide-react';

interface ChipDetailSectionProps {
  chipId: ChipId;
}

export const ChipDetailSection: React.FC<ChipDetailSectionProps> = ({ chipId }) => {
  const chip = CHIP_REGISTRY[chipId];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
      {/* Top Title Banner */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chip.accentHex }}
            />
            <h2 className="text-xl font-bold font-mono text-neutral-100">
              {chip.name}
            </h2>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
              {chip.hardwareName}
            </span>
          </div>
          <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
            {chip.description}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>Año: <strong className="text-neutral-200">{chip.year}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
            <Cpu className="w-3.5 h-3.5 text-neutral-500" />
            <span>Fabricante: <strong className="text-neutral-200">{chip.manufacturer}</strong></span>
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-neutral-500 block mb-1 font-mono uppercase text-[10px]">
            Arquitectura de Síntesis
          </span>
          <span className="font-semibold text-neutral-200">
            {chip.architecture}
          </span>
        </div>

        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-neutral-500 block mb-1 font-mono uppercase text-[10px]">
            Reloj Maestro / Frecuencia
          </span>
          <span className="font-mono font-semibold text-amber-400">
            {chip.specs.sampleRateOrClock}
          </span>
        </div>

        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-neutral-500 block mb-1 font-mono uppercase text-[10px]">
            Resolución DAC & Salida
          </span>
          <span className="font-mono font-semibold text-neutral-200">
            {chip.specs.bitDepth}
          </span>
        </div>

        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-neutral-500 block mb-1 font-mono uppercase text-[10px]">
            Consolas & Sistemas
          </span>
          <span className="font-semibold text-neutral-200">
            {chip.consoles.join(', ')}
          </span>
        </div>
      </div>

      {/* Channel Summary & Notable Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
          <h4 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Configuración de Canales Hardware
          </h4>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 mb-3">
            {chip.channelsSummary}
          </p>
          <ul className="space-y-1.5 text-xs text-neutral-400">
            {chip.specs.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
          <h4 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            Bandas Sonoras & Videojuegos Emblemáticos
          </h4>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {chip.notableGames.map((game, i) => (
              <span
                key={i}
                className="text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg"
              >
                {game}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed italic">
            El timbre y la personalidad auditiva de este chip definieron la estética musical de toda una generación de compositores y jugadores.
          </p>
        </div>
      </div>
    </div>
  );
};
