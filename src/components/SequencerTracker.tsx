/**
 * SequencerTracker.tsx - Interactive 16-step Retro Chiptune Tracker & Song Player
 */

import React, { useState, useEffect, useRef } from 'react';
import { DEMO_TRACKS } from '../lib/retrochips';
import { Play, Pause, RotateCcw, Music, Sparkles } from 'lucide-react';
import { NES2A03 } from '../lib/retrochips/chips/nes2a03';
import { GameBoyAPU } from '../lib/retrochips/chips/gameboy';
import { YM2612 } from '../lib/retrochips/chips/ym2612';
import { SNES_SDSP } from '../lib/retrochips/chips/snes_sdsp';
import { SID6581 } from '../lib/retrochips/chips/sid6581';

interface SequencerTrackerProps {
  nesInstance: NES2A03;
  gbInstance: GameBoyAPU;
  ymInstance: YM2612;
  snesInstance: SNES_SDSP;
  sidInstance: SID6581;
}

export const SequencerTracker: React.FC<SequencerTrackerProps> = ({
  nesInstance,
  gbInstance,
  ymInstance,
  snesInstance,
  sidInstance
}) => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(DEMO_TRACKS[0].tempo);

  const tracker = DEMO_TRACKS[selectedTrackIndex];
  const stepTimerRef = useRef<number | null>(null);
  const currentStepRef = useRef<number>(0);

  // Update tempo when switching track
  useEffect(() => {
    setTempo(DEMO_TRACKS[selectedTrackIndex].tempo);
    setCurrentStep(0);
    currentStepRef.current = 0;
  }, [selectedTrackIndex]);

  const stepDurationMs = (60000 / tempo) / 4; // 16th notes

  const playStepNotes = (stepIdx: number) => {
    const curTrack = DEMO_TRACKS[selectedTrackIndex];
    curTrack.channels.forEach((ch) => {
      const step = ch.steps[stepIdx];
      if (!step || !step.note) {
        if (step?.fx) {
          // Play special drum/FX step
          if (curTrack.chipId === 'ym2612') {
            if (step.fx === 'kick') ymInstance.playDACSample('segaKick');
            else if (step.fx === 'snare') ymInstance.playDACSample('segaSnare');
            else if (step.fx === 'cymbal') ymInstance.playDACSample('segaCymbal');
            else if (step.fx === 'tom') ymInstance.playDACSample('segaTom');
          } else if (curTrack.chipId === 'nes2a03') {
            if (step.fx === 'snare') nesInstance.playNoise(7, false, 0.15);
            else if (step.fx === 'hihat') nesInstance.playNoise(11, false, 0.08);
          }
        }
        return;
      }

      const dur = step.duration || 0.25;
      const vel = step.velocity || 0.85;

      if (curTrack.chipId === 'ym2612') {
        if (ch.channelId === 'ym_bass') {
          ymInstance.playFMVoice(step.note, dur, vel);
        } else {
          ymInstance.playFMVoice(step.note, dur, vel);
        }
      } else if (curTrack.chipId === 'nes2a03') {
        if (ch.channelId === 'tri') {
          nesInstance.playTriangle(step.note, dur, vel);
        } else {
          nesInstance.playPulse1(step.note, dur, vel);
        }
      } else if (curTrack.chipId === 'snes_sdsp') {
        snesInstance.playVoice(step.note, dur, vel);
      } else if (curTrack.chipId === 'gameboy') {
        if (ch.channelId === 'gb_flute') {
          gbInstance.playCh3(step.note, dur, vel);
        } else {
          gbInstance.playCh1(step.note, dur, vel);
        }
      } else if (curTrack.chipId === 'sid6581') {
        sidInstance.playVoice(step.note, dur, vel);
      }
    });
  };

  useEffect(() => {
    if (!isPlaying) {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      return;
    }

    stepTimerRef.current = window.setInterval(() => {
      const nextStep = (currentStepRef.current + 1) % tracker.rows;
      currentStepRef.current = nextStep;
      setCurrentStep(nextStep);
      playStepNotes(nextStep);
    }, stepDurationMs);

    return () => {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
      }
    };
  }, [isPlaying, tempo, selectedTrackIndex, stepDurationMs]);

  const togglePlay = () => {
    if (!isPlaying) {
      playStepNotes(currentStep);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    currentStepRef.current = 0;
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-4">
      {/* Top Bar: Song selector & Playback controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider font-mono">
            Secuenciador Tracker Clásico
          </h3>
        </div>

        {/* Track Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DEMO_TRACKS.map((t, idx) => (
            <button
              key={t.name}
              onClick={() => {
                setIsPlaying(false);
                setSelectedTrackIndex(idx);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                selectedTrackIndex === idx
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls & Tempo */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-neutral-950" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Reproducir Pista</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
            title="Reiniciar al inicio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Tempo slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-mono">
            Tempo: <span className="text-amber-400 font-bold">{tempo} BPM</span>
          </span>
          <input
            type="range"
            min="60"
            max="200"
            step="2"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value, 10))}
            className="w-24 sm:w-32 h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Tracker Grid View (16 Rows x Channels) */}
      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
        <div className="overflow-x-auto max-h-72 retro-scroll">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-neutral-900/90 border-b border-neutral-800 text-neutral-400 sticky top-0 z-10">
                <th className="py-2 px-3 w-12 text-center text-neutral-500">Paso</th>
                {tracker.channels.map((ch) => (
                  <th key={ch.channelId} className="py-2 px-3 font-semibold text-neutral-200">
                    {ch.channelName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: tracker.rows }).map((_, rowIdx) => {
                const isCurrent = rowIdx === currentStep;

                return (
                  <tr
                    key={rowIdx}
                    className={`border-b border-neutral-900/80 transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-200 font-bold'
                        : rowIdx % 4 === 0
                        ? 'bg-neutral-900/30 text-neutral-300'
                        : 'text-neutral-400 hover:bg-neutral-900/50'
                    }`}
                  >
                    <td className="py-1.5 px-3 text-center text-[11px] font-mono tabular-nums text-neutral-500">
                      {String(rowIdx).padStart(2, '0')}
                    </td>
                    {tracker.channels.map((ch) => {
                      const step = ch.steps[rowIdx];
                      const displayStr = step?.note || (step?.fx ? `[${step.fx}]` : '···');

                      return (
                        <td
                          key={ch.channelId}
                          className={`py-1.5 px-3 tabular-nums ${
                            step?.note
                              ? isCurrent
                                ? 'text-amber-300 font-bold'
                                : 'text-neutral-200'
                              : 'text-neutral-600'
                          }`}
                        >
                          {displayStr}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
