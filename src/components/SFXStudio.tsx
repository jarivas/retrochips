/**
 * SFXStudio.tsx - Retro Sound Effects Generator & WAV Exporter
 */

import React, { useState } from 'react';
import { RetroSFXGenerator, SFXType, ChipId, audioEngine } from '../lib/retrochips';
import { Volume2, Download, Zap, Flame, Award, HeartCrack, Disc } from 'lucide-react';

interface SFXStudioProps {
  currentChipId: ChipId;
}

export const SFXStudio: React.FC<SFXStudioProps> = ({ currentChipId }) => {
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const sfxList: { type: SFXType; label: string; desc: string; icon: string }[] = [
    { type: 'jump', label: 'Salto Clásico', desc: 'Barrido ascendente rápido para plataformas 8-bit', icon: '⬆️' },
    { type: 'laser', label: 'Disparo Láser', desc: 'Caída de frecuencia exponencial zapping', icon: '⚡' },
    { type: 'coin', label: 'Moneda / Ítem', desc: 'Arpegio de dos notas brillantes (B5 → E6)', icon: '🪙' },
    { type: 'powerup', label: 'Power-Up', desc: 'Casada ascendente de 4 tonos triunfales', icon: '⭐' },
    { type: 'explosion', label: 'Explosión LFSR', desc: 'Ruido analógico con filtro pasa-bajos decreciente', icon: '💥' },
    { type: 'hit', label: 'Golpe / Daño', desc: 'Impacto seco en diente de sierra y transitorio de ruido', icon: '🥊' },
    { type: 'victory', label: 'Fanfarria Victoria', desc: 'Fanfarria clásica de victoria de nivel', icon: '🏆' },
    { type: 'gameover', label: 'Game Over', desc: 'Glissando descendente melancólico en onda triangular', icon: '💀' }
  ];

  const handlePlaySFX = (type: SFXType) => {
    setLastGenerated(type);
    RetroSFXGenerator.playSFX(type, currentChipId);
  };

  const handleDownloadSFX = async (type: SFXType) => {
    audioEngine.startRecording();
    RetroSFXGenerator.playSFX(type, currentChipId);

    // Stop after audio completes
    setTimeout(async () => {
      const wav = await audioEngine.stopRecording();
      if (wav) {
        const url = URL.createObjectURL(wav);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sfx-${type}-${Date.now()}.wav`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 700);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider font-mono">
            Generador de Efectos de Sonido (SFX) Retro
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Genera y descarga efectos de audio de 8-bit y 16-bit directamente en formato .WAV sin compresión
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sfxList.map((sfx) => {
          const isSelected = lastGenerated === sfx.type;

          return (
            <div
              key={sfx.type}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-neutral-950 border-amber-500/60 shadow-sm'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{sfx.icon}</span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    {sfx.type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-200 mb-1">
                  {sfx.label}
                </h4>
                <p className="text-[11px] text-neutral-400 leading-snug mb-3">
                  {sfx.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-900">
                <button
                  onClick={() => handlePlaySFX(sfx.type)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700/80 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escuchar</span>
                </button>
                <button
                  onClick={() => handleDownloadSFX(sfx.type)}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition-colors cursor-pointer"
                  title="Descargar archivo .WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
