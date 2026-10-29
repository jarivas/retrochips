/**
 * App.tsx - RetroChips.js Synthesizer Workstation & Sound Chip Library
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChipId, 
  CHIP_REGISTRY, 
  RetroPreset, 
  ChannelState, 
  audioEngine,
  NES2A03,
  GameBoyAPU,
  YM2612,
  SNES_SDSP,
  SID6581,
  SN76489,
  SonySPU
} from './lib/retrochips';

import { TopBar } from './components/TopBar';
import { OscilloscopeCanvas } from './components/OscilloscopeCanvas';
import { ChipSelector } from './components/ChipSelector';
import { ChannelRegistersPanel } from './components/ChannelRegistersPanel';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { PresetBank } from './components/PresetBank';
import { SequencerTracker } from './components/SequencerTracker';
import { SFXStudio } from './components/SFXStudio';
import { CodePlayground } from './components/CodePlayground';
import { ChipDetailSection } from './components/ChipDetailSection';

import { 
  Cpu, 
  Music, 
  Sparkles, 
  Sliders, 
  Volume2, 
  Info, 
  Layers, 
  Code2, 
  Zap,
  ArrowRight,
  Disc
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('synth');
  const [currentChipId, setCurrentChipId] = useState<ChipId>('ym2612');
  const [activePresetId, setActivePresetId] = useState<string | undefined>('ym_slap_bass');

  // Singletons of chip sound engines
  const engines = useRef<{
    nes?: NES2A03;
    gb?: GameBoyAPU;
    ym?: YM2612;
    snes?: SNES_SDSP;
    sid?: SID6581;
    sn?: SN76489;
    spu?: SonySPU;
  }>({});

  // Initialize instances on first turn
  if (!engines.current.nes) {
    engines.current = {
      nes: new NES2A03(),
      gb: new GameBoyAPU(),
      ym: new YM2612(),
      snes: new SNES_SDSP(),
      sid: new SID6581(),
      sn: new SN76489(),
      spu: new SonySPU()
    };
  }

  // Force re-render on parameter changes
  const [, setTick] = useState(0);
  const handleParamChange = () => setTick(t => t + 1);

  // Poll channel states periodically for VU meters
  const [channelStates, setChannelStates] = useState<ChannelState[]>([]);
  useEffect(() => {
    const timer = setInterval(() => {
      const activeEngine = getActiveEngine(currentChipId, engines.current);
      if (activeEngine && typeof activeEngine.getChannelStates === 'function') {
        setChannelStates(activeEngine.getChannelStates());
      }
    }, 100);
    return () => clearInterval(timer);
  }, [currentChipId]);

  const activeChipMeta = CHIP_REGISTRY[currentChipId];

  // Play a note through the current active sound chip
  const handlePlayNote = (note: string, duration = 0.4, velocity = 0.85) => {
    // Unlock AudioContext on first user interaction
    audioEngine.init();

    const e = engines.current;
    switch (currentChipId) {
      case 'ym2612':
        e.ym?.playFMVoice(note, duration, velocity);
        break;
      case 'nes2a03':
        e.nes?.playPulse1(note, duration, velocity);
        break;
      case 'gameboy':
        if (e.gb?.state.ch3.wavePattern) {
          e.gb.playCh3(note, duration, velocity);
        } else {
          e.gb?.playCh1(note, duration, velocity);
        }
        break;
      case 'snes_sdsp':
        e.snes?.playVoice(note, duration, velocity);
        break;
      case 'sid6581':
        e.sid?.playVoice(note, duration, velocity);
        break;
      case 'sn76489':
        e.sn?.playTone(0, note, duration, velocity);
        break;
      case 'sonyspu':
        e.spu?.playVoice(note, duration, velocity);
        break;
    }
  };

  // Load a preset into the engine
  const handleSelectPreset = (preset: RetroPreset) => {
    setActivePresetId(preset.id);
    setCurrentChipId(preset.chipId);

    const e = engines.current;
    if (preset.chipId === 'ym2612' && e.ym) {
      if (preset.settings.algorithm !== undefined) e.ym.setAlgorithm(preset.settings.algorithm);
      if (preset.settings.feedback !== undefined) e.ym.setFeedback(preset.settings.feedback);
      if (preset.settings.operators) {
        preset.settings.operators.forEach((op: any, i: number) => {
          if (e.ym!.state.operators[i]) Object.assign(e.ym!.state.operators[i], op);
        });
      }
    } else if (preset.chipId === 'nes2a03' && e.nes) {
      if (preset.settings.duty !== undefined) e.nes.state.p1.duty = preset.settings.duty;
      if (preset.settings.sweep !== undefined) e.nes.state.p1.sweep = preset.settings.sweep;
      if (preset.settings.mode) e.nes.state.noise.mode = preset.settings.mode;
    } else if (preset.chipId === 'snes_sdsp' && e.snes) {
      if (preset.settings.selectedInstrument) e.snes.setInstrument(preset.settings.selectedInstrument);
      if (preset.settings.echo) {
        e.snes.setEcho(
          preset.settings.echo.enabled,
          preset.settings.echo.delayTime,
          preset.settings.echo.feedback,
          preset.settings.echo.wetLevel
        );
      }
    } else if (preset.chipId === 'sid6581' && e.sid) {
      if (preset.settings.waveform) e.sid.state.waveform = preset.settings.waveform;
      if (preset.settings.filter) {
        e.sid.setFilter(
          preset.settings.filter.mode,
          preset.settings.filter.cutoff,
          preset.settings.filter.resonance
        );
      }
    }

    handleParamChange();
    // Audition sound
    setTimeout(() => handlePlayNote('C4', 0.5, 0.9), 50);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Hero Chip Strip: Selector with live status */}
        <section aria-label="Selector de Chips de Consola">
          <div className="flex items-center justify-between pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Chips de Sonido Clásicos (1977 - 1999)
              </h2>
            </div>
            <div className="text-xs text-neutral-500 font-mono hidden sm:block">
              {activeChipMeta.name} · {activeChipMeta.year} · {activeChipMeta.architecture}
            </div>
          </div>

          <ChipSelector
            selectedChip={currentChipId}
            onSelectChip={(id) => {
              setCurrentChipId(id);
              setActivePresetId(undefined);
            }}
          />
        </section>

        {/* Tab 1: Sintetizador & Workbench */}
        {activeTab === 'synth' && (
          <div className="space-y-6">
            {/* Visualizer & Quick Info Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <OscilloscopeCanvas accentColor={activeChipMeta.accentHex} />
              </div>

              {/* Active Chip Quick Spec Card */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-500">
                      Chip Activo
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-semibold">
                      {activeChipMeta.year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-mono text-neutral-100 mb-1">
                    {activeChipMeta.name}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                    {activeChipMeta.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-neutral-400">
                    <span>Canales:</span>
                    <span className="text-neutral-200">{activeChipMeta.specs.channels} Canales Hardware</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Frecuencia:</span>
                    <span className="text-amber-400 truncate max-w-[170px]">{activeChipMeta.specs.sampleRateOrClock}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Salida:</span>
                    <span className="text-neutral-200">{activeChipMeta.specs.bitDepth}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Register & Channel Controls */}
            <ChannelRegistersPanel
              chipId={currentChipId}
              nesInstance={engines.current.nes!}
              gbInstance={engines.current.gb!}
              ymInstance={engines.current.ym!}
              snesInstance={engines.current.snes!}
              sidInstance={engines.current.sid!}
              channelStates={channelStates}
              onParamChange={handleParamChange}
              accentColor={activeChipMeta.accentHex}
            />

            {/* Virtual Playable Keyboard & Arpeggiator */}
            <VirtualKeyboard
              onPlayNote={handlePlayNote}
              accentColor={activeChipMeta.accentHex}
            />

            {/* Preset Bank */}
            <PresetBank
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />
          </div>
        )}

        {/* Tab 2: Consolas & Chips (Deep Specs & History) */}
        {activeTab === 'chips' && (
          <div className="space-y-6">
            <ChipDetailSection chipId={currentChipId} />

            {/* Virtual Keyboard directly usable while reading specs */}
            <VirtualKeyboard
              onPlayNote={handlePlayNote}
              accentColor={activeChipMeta.accentHex}
            />
          </div>
        )}

        {/* Tab 3: Secuenciador Tracker */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-200 font-mono">
                  Secuenciador por Pasos & Tracker Multicanal
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Reproduce composiciones retro completas procesadas en tiempo real por los chips emulados
                </p>
              </div>
            </div>

            <OscilloscopeCanvas accentColor={activeChipMeta.accentHex} />

            <SequencerTracker
              nesInstance={engines.current.nes!}
              gbInstance={engines.current.gb!}
              ymInstance={engines.current.ym!}
              snesInstance={engines.current.snes!}
              sidInstance={engines.current.sid!}
            />
          </div>
        )}

        {/* Tab 4: Generador de SFX */}
        {activeTab === 'sfx' && (
          <div className="space-y-6">
            <SFXStudio currentChipId={currentChipId} />

            <OscilloscopeCanvas accentColor={activeChipMeta.accentHex} />

            <VirtualKeyboard
              onPlayNote={handlePlayNote}
              accentColor={activeChipMeta.accentHex}
            />
          </div>
        )}

        {/* Tab 5: SDK & Código JavaScript */}
        {activeTab === 'sdk' && (
          <div className="space-y-6">
            <CodePlayground currentChipId={currentChipId} />

            <OscilloscopeCanvas accentColor={activeChipMeta.accentHex} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400 font-mono">RetroChips.js</span>
            <span>·</span>
            <span>Biblioteca de Emulación de Chips de Sonido Retro (1977-1999)</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Web Audio API</span>
            <span>·</span>
            <span>16-bit PCM WAV Export</span>
            <span>·</span>
            <span>Zero External Dependencies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getActiveEngine(chipId: ChipId, engines: any) {
  switch (chipId) {
    case 'nes2a03': return engines.nes;
    case 'gameboy': return engines.gb;
    case 'ym2612': return engines.ym;
    case 'snes_sdsp': return engines.snes;
    case 'sid6581': return engines.sid;
    case 'sn76489': return engines.sn;
    case 'sonyspu': return engines.spu;
    default: return engines.ym;
  }
}
