/**
 * RetroChips.js - Classic Console Sound Chip Synthesizer Library
 * TypeScript definitions and chip metadata (1977-1999)
 */

export type ChipId = 
  | 'nes2a03' 
  | 'gameboy' 
  | 'ym2612' 
  | 'snes_sdsp' 
  | 'sid6581' 
  | 'sn76489' 
  | 'sonyspu';

export interface ChipMetadata {
  id: ChipId;
  name: string;
  hardwareName: string;
  manufacturer: string;
  year: number;
  generation: string;
  consoles: string[];
  architecture: string;
  channelsSummary: string;
  description: string;
  badgeColor: string;
  accentHex: string;
  notableGames: string[];
  specs: {
    channels: number;
    sampleRateOrClock: string;
    bitDepth: string;
    dacType: string;
    features: string[];
  };
}

export interface ChannelState {
  id: string;
  name: string;
  type: 'pulse' | 'triangle' | 'noise' | 'fm' | 'sample' | 'pwm' | 'wavetable';
  muted: boolean;
  solo: boolean;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  activeFreq?: number;
  activityLevel?: number; // 0 to 1 for visual VU meter
  params: Record<string, number | string | boolean>;
}

export interface RetroPreset {
  id: string;
  name: string;
  chipId: ChipId;
  category: 'Bass' | 'Lead' | 'Pad' | 'Arp' | 'SFX' | 'Percussion' | 'Keys';
  description: string;
  inspiredBy?: string;
  settings: Record<string, any>;
}

export interface StepNote {
  note: string | null; // e.g. "C4", "D#4", null for rest
  duration?: number;
  velocity?: number; // 0 to 1
  instrument?: number;
  fx?: string;
}

export interface TrackerPattern {
  name: string;
  chipId: ChipId;
  tempo: number; // BPM
  speed: number; // ticks per row (usually 6)
  rows: number; // usually 16 or 32
  channels: {
    channelId: string;
    channelName: string;
    steps: (StepNote | null)[];
  }[];
}
