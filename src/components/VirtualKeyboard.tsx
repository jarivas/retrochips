/**
 * VirtualKeyboard.tsx - Interactive Playable Chiptune Keyboard & Arpeggiator
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Square, Music, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { NOTE_NAMES, midiToFreq } from '../lib/retrochips';

interface VirtualKeyboardProps {
  onPlayNote: (note: string, duration?: number, velocity?: number) => void;
  accentColor?: string;
}

interface KeyConfig {
  note: string;
  isBlack: boolean;
  keyLabel?: string;
  midi: number;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onPlayNote,
  accentColor = '#f59e0b'
}) => {
  const [octaveOffset, setOctaveOffset] = useState<number>(4); // Base octave (C4)
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  // Arpeggiator state
  const [arpEnabled, setArpEnabled] = useState<boolean>(false);
  const [arpMode, setArpMode] = useState<'up' | 'down' | 'updown' | 'fast60hz'>('up');
  const [arpSpeedBpm, setArpSpeedBpm] = useState<number>(130);
  const heldNotesRef = useRef<string[]>([]);
  const arpIntervalRef = useRef<number | null>(null);
  const arpIndexRef = useRef<number>(0);

  // Keyboard mapping for QWERTY keys
  const KEY_MAPPINGS: Record<string, string> = {
    'a': 'C',
    'w': 'C#',
    's': 'D',
    'e': 'D#',
    'd': 'E',
    'f': 'F',
    't': 'F#',
    'g': 'G',
    'y': 'G#',
    'h': 'A',
    'u': 'A#',
    'j': 'B',
    'k': 'C+1',
    'o': 'C#+1',
    'l': 'D+1',
    'p': 'D#+1',
    ';': 'E+1'
  };

  const triggerNote = useCallback((noteName: string, duration = 0.35) => {
    setActiveNotes(prev => new Set(prev).add(noteName));
    onPlayNote(noteName, duration, 0.9);

    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(noteName);
        return next;
      });
    }, Math.min(duration * 1000, 300));
  }, [onPlayNote]);

  // Arpeggiator clock
  useEffect(() => {
    if (!arpEnabled || heldNotesRef.current.length === 0) {
      if (arpIntervalRef.current) {
        clearInterval(arpIntervalRef.current);
        arpIntervalRef.current = null;
      }
      return;
    }

    const intervalMs = arpMode === 'fast60hz' 
      ? 16.66 // 60 Hz NES/GameBoy hardware frame tick arp
      : (60000 / arpSpeedBpm) / 4; // 16th notes

    arpIntervalRef.current = window.setInterval(() => {
      const notes = heldNotesRef.current;
      if (notes.length === 0) return;

      let nextIndex = 0;
      if (arpMode === 'up') {
        arpIndexRef.current = (arpIndexRef.current + 1) % notes.length;
        nextIndex = arpIndexRef.current;
      } else if (arpMode === 'down') {
        arpIndexRef.current = (arpIndexRef.current - 1 + notes.length) % notes.length;
        nextIndex = arpIndexRef.current;
      } else if (arpMode === 'fast60hz') {
        arpIndexRef.current = (arpIndexRef.current + 1) % notes.length;
        nextIndex = arpIndexRef.current;
      } else {
        // Up / Down
        arpIndexRef.current = (arpIndexRef.current + 1) % (notes.length * 2 - 2 || 1);
        nextIndex = arpIndexRef.current < notes.length 
          ? arpIndexRef.current 
          : (notes.length * 2 - 2) - arpIndexRef.current;
      }

      const noteToPlay = notes[nextIndex % notes.length];
      if (noteToPlay) {
        triggerNote(noteToPlay, arpMode === 'fast60hz' ? 0.05 : 0.12);
      }
    }, intervalMs);

    return () => {
      if (arpIntervalRef.current) {
        clearInterval(arpIntervalRef.current);
      }
    };
  }, [arpEnabled, arpMode, arpSpeedBpm, triggerNote]);

  // Handle computer keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      if (KEY_MAPPINGS[key]) {
        let noteName = KEY_MAPPINGS[key];
        let targetOctave = octaveOffset;
        if (noteName.includes('+1')) {
          targetOctave += 1;
          noteName = noteName.replace('+1', '');
        }
        const fullNote = `${noteName}${targetOctave}`;

        if (arpEnabled) {
          if (!heldNotesRef.current.includes(fullNote)) {
            heldNotesRef.current.push(fullNote);
          }
        } else {
          triggerNote(fullNote);
        }
      } else if (key === 'z') {
        setOctaveOffset(prev => Math.max(1, prev - 1));
      } else if (key === 'x') {
        setOctaveOffset(prev => Math.min(7, prev + 1));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_MAPPINGS[key]) {
        let noteName = KEY_MAPPINGS[key];
        let targetOctave = octaveOffset;
        if (noteName.includes('+1')) {
          targetOctave += 1;
          noteName = noteName.replace('+1', '');
        }
        const fullNote = `${noteName}${targetOctave}`;
        heldNotesRef.current = heldNotesRef.current.filter(n => n !== fullNote);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [octaveOffset, arpEnabled, triggerNote]);

  // Generate 2 octaves of keys
  const keys: KeyConfig[] = [];
  for (let oct = 0; oct < 2; oct++) {
    const curOctave = octaveOffset + oct;
    NOTE_NAMES.forEach((name, idx) => {
      const isBlack = name.includes('#');
      let keyLabel = '';
      if (oct === 0) {
        if (name === 'C') keyLabel = 'A';
        if (name === 'C#') keyLabel = 'W';
        if (name === 'D') keyLabel = 'S';
        if (name === 'D#') keyLabel = 'E';
        if (name === 'E') keyLabel = 'D';
        if (name === 'F') keyLabel = 'F';
        if (name === 'F#') keyLabel = 'T';
        if (name === 'G') keyLabel = 'G';
        if (name === 'G#') keyLabel = 'Y';
        if (name === 'A') keyLabel = 'H';
        if (name === 'A#') keyLabel = 'U';
        if (name === 'B') keyLabel = 'J';
      } else if (oct === 1) {
        if (name === 'C') keyLabel = 'K';
        if (name === 'C#') keyLabel = 'O';
        if (name === 'D') keyLabel = 'L';
        if (name === 'D#') keyLabel = 'P';
        if (name === 'E') keyLabel = ';';
      }
      keys.push({
        note: `${name}${curOctave}`,
        isBlack,
        keyLabel,
        midi: (curOctave + 1) * 12 + idx
      });
    });
  }
  // Add final high C
  keys.push({
    note: `C${octaveOffset + 2}`,
    isBlack: false,
    keyLabel: '',
    midi: (octaveOffset + 3) * 12
  });

  const handleKeyClick = (note: string) => {
    if (arpEnabled) {
      if (heldNotesRef.current.includes(note)) {
        heldNotesRef.current = heldNotesRef.current.filter(n => n !== note);
      } else {
        heldNotesRef.current.push(note);
      }
    } else {
      triggerNote(note);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4">
      {/* Keyboard Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 mb-3">
        {/* Octave Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
            Octava
          </span>
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setOctaveOffset(prev => Math.max(1, prev - 1))}
              disabled={octaveOffset <= 1}
              className="p-1 hover:text-white disabled:opacity-30 transition-colors"
              title="Octava abajo (Tecla Z)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-bold font-mono text-amber-400">
              C{octaveOffset} - C{octaveOffset + 2}
            </span>
            <button
              onClick={() => setOctaveOffset(prev => Math.min(6, prev + 1))}
              disabled={octaveOffset >= 6}
              className="p-1 hover:text-white disabled:opacity-30 transition-colors"
              title="Octava arriba (Tecla X)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Atajos: [Z] [-Oct] [X] [+Oct]
          </span>
        </div>

        {/* Arpeggiator Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setArpEnabled(!arpEnabled);
              if (arpEnabled) heldNotesRef.current = [];
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              arpEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${arpEnabled ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>Arpegiador Retro</span>
          </button>

          {arpEnabled && (
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setArpMode('up')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                  arpMode === 'up' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Up
              </button>
              <button
                onClick={() => setArpMode('down')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                  arpMode === 'down' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Down
              </button>
              <button
                onClick={() => setArpMode('fast60hz')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                  arpMode === 'fast60hz' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
                title="60Hz Frame Arp clásico de NES y Game Boy"
              >
                60Hz Chiptune
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Piano Keys Board */}
      <div className="relative flex justify-center items-start overflow-x-auto py-1 select-none retro-scroll">
        <div className="relative inline-flex h-36">
          {keys.map((k) => {
            const isActive = activeNotes.has(k.note);

            if (!k.isBlack) {
              return (
                <button
                  key={k.note}
                  onClick={() => handleKeyClick(k.note)}
                  className={`relative w-10 sm:w-11 h-36 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-r border-b border-l border-neutral-300 rounded-b-md flex flex-col justify-end items-center pb-2 transition-transform duration-75 active:scale-y-[0.98] ${
                    isActive ? '!bg-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]' : ''
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {k.keyLabel && (
                    <span className="text-[10px] font-mono text-neutral-400 mb-0.5">
                      {k.keyLabel}
                    </span>
                  )}
                  <span className="text-[11px] font-bold font-mono text-neutral-800">
                    {k.note}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={k.note}
                onClick={() => handleKeyClick(k.note)}
                className={`absolute z-10 w-6 sm:w-7 h-24 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-950 rounded-b-md flex flex-col justify-end items-center pb-2 shadow-md transition-transform duration-75 active:scale-y-[0.98] ${
                  isActive ? '!bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]' : ''
                }`}
                style={{
                  // Position black keys between natural white keys
                  left: getBlackKeyLeftOffset(k.note, octaveOffset),
                  touchAction: 'manipulation'
                }}
              >
                {k.keyLabel && (
                  <span className="text-[9px] font-mono text-neutral-400 mb-0.5">
                    {k.keyLabel}
                  </span>
                )}
                <span className="text-[9px] font-bold font-mono text-neutral-300">
                  {k.note.replace('#', '♯')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Calculate left position in rem/px for black keys
function getBlackKeyLeftOffset(note: string, baseOctave: number): string {
  const whiteKeyWidthPx = 44; // 11 * 4px for sm:w-11
  const match = note.match(/^([A-G]#)(\d+)$/);
  if (!match) return '0px';

  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  const octDiff = octave - baseOctave;

  // Offsets in white key units within octave
  let pos = 0;
  if (noteName === 'C#') pos = 0.72;
  else if (noteName === 'D#') pos = 1.76;
  else if (noteName === 'F#') pos = 3.72;
  else if (noteName === 'G#') pos = 4.74;
  else if (noteName === 'A#') pos = 5.76;

  const totalWhiteKeys = octDiff * 7 + pos;
  return `${totalWhiteKeys * whiteKeyWidthPx}px`;
}
