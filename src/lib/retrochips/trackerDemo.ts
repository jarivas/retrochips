/**
 * RetroChips.js - Pre-composed multi-channel demo tracks
 */

import { TrackerPattern } from './types';

export const DEMO_TRACKS: TrackerPattern[] = [
  // 1. Sega Genesis FM (YM2612)
  {
    name: 'Emerald Coast 16-Bit Groove',
    chipId: 'ym2612',
    tempo: 132,
    speed: 6,
    rows: 16,
    channels: [
      {
        channelId: 'ym_lead',
        channelName: 'Ch 1 (FM Lead)',
        steps: [
          { note: 'G4', duration: 0.2, velocity: 0.9 },
          { note: null },
          { note: 'A#4', duration: 0.2, velocity: 0.85 },
          { note: 'C5', duration: 0.3, velocity: 0.9 },
          { note: null },
          { note: 'D5', duration: 0.25, velocity: 0.9 },
          { note: 'C5', duration: 0.2, velocity: 0.85 },
          { note: 'A#4', duration: 0.2, velocity: 0.8 },
          { note: 'G4', duration: 0.35, velocity: 0.9 },
          { note: null },
          { note: 'F4', duration: 0.2, velocity: 0.8 },
          { note: 'F#4', duration: 0.2, velocity: 0.85 },
          { note: 'G4', duration: 0.4, velocity: 0.95 },
          { note: null },
          { note: 'D4', duration: 0.2, velocity: 0.8 },
          { note: null }
        ]
      },
      {
        channelId: 'ym_bass',
        channelName: 'Ch 2 (Slap Bass)',
        steps: [
          { note: 'G2', duration: 0.15, velocity: 0.95 },
          { note: 'G2', duration: 0.15, velocity: 0.8 },
          { note: null },
          { note: 'A#2', duration: 0.15, velocity: 0.85 },
          { note: 'C3', duration: 0.2, velocity: 0.9 },
          { note: null },
          { note: 'G2', duration: 0.15, velocity: 0.8 },
          { note: 'F2', duration: 0.15, velocity: 0.75 },
          { note: 'G2', duration: 0.15, velocity: 0.95 },
          { note: null },
          { note: 'D3', duration: 0.15, velocity: 0.85 },
          { note: 'C3', duration: 0.15, velocity: 0.8 },
          { note: 'A#2', duration: 0.2, velocity: 0.85 },
          { note: null },
          { note: 'D2', duration: 0.15, velocity: 0.9 },
          { note: 'F2', duration: 0.15, velocity: 0.8 }
        ]
      },
      {
        channelId: 'ym_dac',
        channelName: 'Ch 6 (DAC Drums)',
        steps: [
          { note: 'C3', fx: 'kick' },
          { note: null },
          { note: 'G3', fx: 'cymbal' },
          { note: null },
          { note: 'D3', fx: 'snare' },
          { note: null },
          { note: 'G3', fx: 'cymbal' },
          { note: 'C3', fx: 'kick' },
          { note: 'C3', fx: 'kick' },
          { note: null },
          { note: 'G3', fx: 'cymbal' },
          { note: null },
          { note: 'D3', fx: 'snare' },
          { note: null },
          { note: 'E3', fx: 'tom' },
          { note: 'G3', fx: 'cymbal' }
        ]
      }
    ]
  },

  // 2. NES Ricoh 2A03 (NES Castle / Dungeon)
  {
    name: '8-Bit Castle Infiltration',
    chipId: 'nes2a03',
    tempo: 140,
    speed: 6,
    rows: 16,
    channels: [
      {
        channelId: 'p1',
        channelName: 'Pulse 1 (Melody)',
        steps: [
          { note: 'E4', duration: 0.18, velocity: 0.9 },
          { note: 'E4', duration: 0.18, velocity: 0.8 },
          { note: null },
          { note: 'E4', duration: 0.18, velocity: 0.85 },
          { note: null },
          { note: 'C4', duration: 0.18, velocity: 0.85 },
          { note: 'E4', duration: 0.25, velocity: 0.9 },
          { note: null },
          { note: 'G4', duration: 0.35, velocity: 0.95 },
          { note: null },
          { note: null },
          { note: null },
          { note: 'G3', duration: 0.35, velocity: 0.9 },
          { note: null },
          { note: null },
          { note: null }
        ]
      },
      {
        channelId: 'tri',
        channelName: 'Triangle (Bass)',
        steps: [
          { note: 'C3', duration: 0.15, velocity: 0.9 },
          { note: 'C3', duration: 0.15, velocity: 0.8 },
          { note: 'G2', duration: 0.15, velocity: 0.85 },
          { note: 'C3', duration: 0.15, velocity: 0.9 },
          { note: 'A2', duration: 0.15, velocity: 0.85 },
          { note: 'A2', duration: 0.15, velocity: 0.8 },
          { note: 'E2', duration: 0.15, velocity: 0.8 },
          { note: 'A2', duration: 0.15, velocity: 0.85 },
          { note: 'F2', duration: 0.15, velocity: 0.9 },
          { note: 'F2', duration: 0.15, velocity: 0.8 },
          { note: 'C2', duration: 0.15, velocity: 0.8 },
          { note: 'F2', duration: 0.15, velocity: 0.85 },
          { note: 'G2', duration: 0.15, velocity: 0.9 },
          { note: 'G2', duration: 0.15, velocity: 0.85 },
          { note: 'B2', duration: 0.15, velocity: 0.85 },
          { note: 'D3', duration: 0.15, velocity: 0.9 }
        ]
      },
      {
        channelId: 'noise',
        channelName: 'Noise (LFSR)',
        steps: [
          { note: null, fx: 'hihat' },
          { note: null },
          { note: null, fx: 'snare' },
          { note: null },
          { note: null, fx: 'hihat' },
          { note: null, fx: 'hihat' },
          { note: null, fx: 'snare' },
          { note: null },
          { note: null, fx: 'hihat' },
          { note: null },
          { note: null, fx: 'snare' },
          { note: null },
          { note: null, fx: 'hihat' },
          { note: null, fx: 'hihat' },
          { note: null, fx: 'snare' },
          { note: null, fx: 'snare' }
        ]
      }
    ]
  },

  // 3. SNES SPC700 (Atmospheric Echo Reverb)
  {
    name: 'Aquatic Forest of Mystery',
    chipId: 'snes_sdsp',
    tempo: 96,
    speed: 6,
    rows: 16,
    channels: [
      {
        channelId: 'snes_strings',
        channelName: 'Strings & Echo',
        steps: [
          { note: 'A4', duration: 0.8, velocity: 0.85 },
          { note: null },
          { note: 'C5', duration: 0.7, velocity: 0.85 },
          { note: null },
          { note: 'E5', duration: 0.9, velocity: 0.9 },
          { note: null },
          { note: 'D5', duration: 0.6, velocity: 0.8 },
          { note: null },
          { note: 'C5', duration: 0.75, velocity: 0.85 },
          { note: null },
          { note: 'B4', duration: 0.7, velocity: 0.8 },
          { note: null },
          { note: 'A4', duration: 1.1, velocity: 0.9 },
          { note: null },
          { note: null },
          { note: null }
        ]
      },
      {
        channelId: 'snes_bass',
        channelName: 'Slap Bass',
        steps: [
          { note: 'A2', duration: 0.25, velocity: 0.9 },
          { note: null },
          { note: 'A2', duration: 0.2, velocity: 0.8 },
          { note: null },
          { note: 'C3', duration: 0.3, velocity: 0.85 },
          { note: null },
          { note: 'D3', duration: 0.3, velocity: 0.85 },
          { note: null },
          { note: 'F2', duration: 0.35, velocity: 0.9 },
          { note: null },
          { note: 'G2', duration: 0.3, velocity: 0.85 },
          { note: null },
          { note: 'A2', duration: 0.4, velocity: 0.95 },
          { note: null },
          { note: 'E2', duration: 0.25, velocity: 0.8 },
          { note: null }
        ]
      }
    ]
  },

  // 4. Game Boy APU (Pokemon / Zelda Style)
  {
    name: 'Pallet Town Morning Walk',
    chipId: 'gameboy',
    tempo: 120,
    speed: 6,
    rows: 16,
    channels: [
      {
        channelId: 'gb_flute',
        channelName: 'Ch 3 (Wave Flute)',
        steps: [
          { note: 'G4', duration: 0.25, velocity: 0.9 },
          { note: 'A4', duration: 0.25, velocity: 0.85 },
          { note: 'B4', duration: 0.3, velocity: 0.9 },
          { note: 'D5', duration: 0.35, velocity: 0.95 },
          { note: 'B4', duration: 0.25, velocity: 0.85 },
          { note: null },
          { note: 'A4', duration: 0.25, velocity: 0.8 },
          { note: 'G4', duration: 0.4, velocity: 0.9 },
          { note: 'E4', duration: 0.3, velocity: 0.85 },
          { note: null },
          { note: 'D4', duration: 0.25, velocity: 0.8 },
          { note: 'E4', duration: 0.25, velocity: 0.85 },
          { note: 'G4', duration: 0.5, velocity: 0.95 },
          { note: null },
          { note: null },
          { note: null }
        ]
      },
      {
        channelId: 'gb_pulse',
        channelName: 'Ch 1 (Pulse Accompaniment)',
        steps: [
          { note: 'G3', duration: 0.18, velocity: 0.75 },
          { note: 'D3', duration: 0.18, velocity: 0.7 },
          { note: 'G3', duration: 0.18, velocity: 0.75 },
          { note: 'B3', duration: 0.18, velocity: 0.75 },
          { note: 'G3', duration: 0.18, velocity: 0.75 },
          { note: 'D3', duration: 0.18, velocity: 0.7 },
          { note: 'G3', duration: 0.18, velocity: 0.75 },
          { note: 'B3', duration: 0.18, velocity: 0.75 },
          { note: 'C3', duration: 0.18, velocity: 0.75 },
          { note: 'G3', duration: 0.18, velocity: 0.7 },
          { note: 'C4', duration: 0.18, velocity: 0.75 },
          { note: 'E4', duration: 0.18, velocity: 0.75 },
          { note: 'D3', duration: 0.18, velocity: 0.8 },
          { note: 'A3', duration: 0.18, velocity: 0.75 },
          { note: 'D4', duration: 0.18, velocity: 0.8 },
          { note: 'F#4', duration: 0.18, velocity: 0.8 }
        ]
      }
    ]
  },

  // 5. Commodore 64 SID 6581 (Rob Hubbard / Turrican Style)
  {
    name: 'Turrican SID Cyberpunk Arp',
    chipId: 'sid6581',
    tempo: 136,
    speed: 6,
    rows: 16,
    channels: [
      {
        channelId: 'sid_lead',
        channelName: 'SID Voice 1 (PWM Saw Lead)',
        steps: [
          { note: 'C4', duration: 0.2, velocity: 0.9 },
          { note: 'D#4', duration: 0.2, velocity: 0.85 },
          { note: 'G4', duration: 0.2, velocity: 0.9 },
          { note: 'A#4', duration: 0.25, velocity: 0.95 },
          { note: 'G4', duration: 0.2, velocity: 0.85 },
          { note: 'D#4', duration: 0.2, velocity: 0.85 },
          { note: 'F4', duration: 0.25, velocity: 0.9 },
          { note: 'D#4', duration: 0.2, velocity: 0.8 },
          { note: 'C4', duration: 0.35, velocity: 0.95 },
          { note: null },
          { note: 'A#3', duration: 0.2, velocity: 0.85 },
          { note: 'C4', duration: 0.3, velocity: 0.9 },
          { note: 'G3', duration: 0.25, velocity: 0.85 },
          { note: null },
          { note: 'A#3', duration: 0.2, velocity: 0.8 },
          { note: 'B3', duration: 0.2, velocity: 0.85 }
        ]
      }
    ]
  }
];
