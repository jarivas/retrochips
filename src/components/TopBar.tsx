/**
 * TopBar.tsx - Top Navigation Bar complying with the Top Bar Contract
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Circle, StopCircle } from 'lucide-react';
import { audioEngine } from '../lib/retrochips';

interface TopBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSFXModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onSelectTab }) => {
  const [volume, setVolume] = useState<number>(0.75);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (!isMuted) {
      audioEngine.setMasterVolume(val);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setMasterVolume(volume);
      setIsMuted(false);
    } else {
      audioEngine.setMasterVolume(0);
      setIsMuted(true);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const wavBlob = await audioEngine.stopRecording();
      setIsRecording(false);
      if (wavBlob) {
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `retrochips-synth-${Date.now()}.wav`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      const started = audioEngine.startRecording();
      if (started) {
        setIsRecording(true);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onSelectTab('synth')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-neutral-100 group-hover:text-amber-400 transition-colors whitespace-nowrap">
              RetroChips.js
            </span>
          </button>
          <span className="hidden sm:inline-block text-xs text-neutral-500 font-mono">
            1977-1999 Audio Engine
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onSelectTab('chips')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-100 ${
              activeTab === 'chips' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Consolas & Chips
          </button>
          <button
            onClick={() => onSelectTab('synth')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-100 ${
              activeTab === 'synth' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Sintetizador
          </button>
          <button
            onClick={() => onSelectTab('tracker')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-100 ${
              activeTab === 'tracker' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Secuenciador Tracker
          </button>
          <button
            onClick={() => onSelectTab('sfx')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-100 ${
              activeTab === 'sfx' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Generador SFX
          </button>
          <button
            onClick={() => onSelectTab('sdk')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-100 ${
              activeTab === 'sdk' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            SDK & Código JS
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Master Volume */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
            <button
              onClick={toggleMute}
              className="text-neutral-400 hover:text-neutral-200 transition-colors p-0.5"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 accent-amber-400 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Record / WAV Export Button */}
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 hover:text-white'
            }`}
          >
            {isRecording ? (
              <>
                <StopCircle className="w-3.5 h-3.5 text-white" />
                <span>Detener & Guardar WAV</span>
              </>
            ) : (
              <>
                <Circle className="w-2.5 h-2.5 text-red-500 fill-red-500" />
                <span>Grabar WAV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
