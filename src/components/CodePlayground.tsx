/**
 * CodePlayground.tsx - Live Interactive JavaScript SDK & Sandbox
 */

import React, { useState } from 'react';
import { ChipId, generateLibrarySnippet, NES2A03, YM2612, GameBoyAPU, SNES_SDSP, SID6581 } from '../lib/retrochips';
import { Play, Copy, Check, Terminal, Code2, BookOpen } from 'lucide-react';

interface CodePlaygroundProps {
  currentChipId: ChipId;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ currentChipId }) => {
  const [selectedChip, setSelectedChip] = useState<ChipId>(currentChipId);
  const [copied, setCopied] = useState<boolean>(false);
  const [execStatus, setExecStatus] = useState<string | null>(null);

  const snippet = generateLibrarySnippet(selectedChip, 'E4');

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    try {
      setExecStatus('Ejecutando síntesis en Web Audio API...');
      if (selectedChip === 'nes2a03') {
        const nes = new NES2A03();
        nes.playPulse1('E4', 0.4, 0.9);
        setTimeout(() => nes.playTriangle('E3', 0.4), 100);
      } else if (selectedChip === 'ym2612') {
        const ym = new YM2612();
        ym.setAlgorithm(4);
        ym.setFeedback(6);
        ym.playFMVoice('E4', 0.5, 0.9);
      } else if (selectedChip === 'gameboy') {
        const gb = new GameBoyAPU();
        gb.playCh3('E4', 0.6);
      } else if (selectedChip === 'snes_sdsp') {
        const snes = new SNES_SDSP();
        snes.setEcho(true, 0.18, 0.45, 0.4);
        snes.playVoice('E4', 0.8, 0.9);
      } else if (selectedChip === 'sid6581') {
        const sid = new SID6581();
        sid.setFilter('lowpass', 2400, 5.0);
        sid.playVoice('E4', 0.6);
      }
      setTimeout(() => setExecStatus('¡Código ejecutado con éxito! Sintetizador en reproducción.'), 300);
      setTimeout(() => setExecStatus(null), 3500);
    } catch (err: any) {
      setExecStatus(`Error al ejecutar: ${err.message}`);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Biblioteca JavaScript / TypeScript RetroChips
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Integración directa en cualquier aplicación web moderna (Vite, Next.js, Node o Browser nativo)
          </p>
        </div>

        {/* Chip Tabs */}
        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 flex-wrap">
          {(['nes2a03', 'ym2612', 'gameboy', 'snes_sdsp', 'sid6581', 'sn76489', 'sonyspu'] as ChipId[]).map((cId) => (
            <button
              key={cId}
              onClick={() => setSelectedChip(cId)}
              className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                selectedChip === cId
                  ? 'bg-neutral-800 text-amber-400 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cId === 'nes2a03' ? 'NES 2A03' : cId === 'ym2612' ? 'YM2612' : cId === 'gameboy' ? 'Game Boy' : cId === 'snes_sdsp' ? 'SNES S-DSP' : cId === 'sid6581' ? 'SID 6581' : cId === 'sn76489' ? 'SN76489' : 'PS1 SPU'}
            </button>
          ))}
        </div>
      </div>

      {/* Installation block */}
      <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-neutral-400 truncate">
          <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span className="text-neutral-500 select-none">$</span>
          <span className="text-amber-300 font-semibold truncate">npm install @retro-chips/core</span>
        </div>
        <span className="text-[11px] text-neutral-500 hidden sm:inline whitespace-nowrap">
          Cero dependencias externas · 100% Web Audio API
        </span>
      </div>

      {/* Code Viewer & Live Playground */}
      <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden font-mono text-xs">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-neutral-400 ml-2 font-medium">
              example-{selectedChip}.ts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-neutral-950" />
              <span>Probar en Vivo</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 overflow-x-auto text-neutral-200 leading-relaxed text-xs retro-scroll">
          <code>{snippet}</code>
        </pre>

        {/* Live Execution Console Banner */}
        {execStatus && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{execStatus}</span>
          </div>
        )}
      </div>

      {/* Quick API Reference Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
          <h5 className="font-bold font-mono text-neutral-200 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Control de Notas & Frecuencia
          </h5>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Soporta notación científica estándar como <code className="text-amber-400 font-mono">'C4'</code>, <code className="text-amber-400 font-mono">'F#5'</code>, números MIDI (60 = C4), o valores directos en Hertz (<code className="text-amber-400 font-mono">440</code>).
          </p>
        </div>

        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
          <h5 className="font-bold font-mono text-neutral-200 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Envolventes & Síntesis Fiel
          </h5>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Modela fielmente los circuitos reales: divisores de frecuencia, registros de desplazamiento LFSR, interpolación gaussiana y algoritmos FM con feedback.
          </p>
        </div>

        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
          <h5 className="font-bold font-mono text-neutral-200 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Grabación & Exportación WAV
          </h5>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Incluye exportador nativo de búferes de audio a archivos <code className="text-amber-400 font-mono">.wav</code> PCM sin pérdida de 16 bits para uso directo en motores de videojuegos (Godot, Unity, Phaser).
          </p>
        </div>
      </div>
    </div>
  );
};
