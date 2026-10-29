/**
 * RetroChips.js - Vintage Sound Effect (SFX) Synthesizer
 */

import { audioEngine } from './audioContext';
import { NES2A03 } from './chips/nes2a03';
import { GameBoyAPU } from './chips/gameboy';
import { YM2612 } from './chips/ym2612';
import { ChipId } from './types';

export type SFXType = 'jump' | 'laser' | 'explosion' | 'coin' | 'powerup' | 'hit' | 'victory' | 'gameover';

export class RetroSFXGenerator {
  public static playSFX(type: SFXType, chipId: ChipId = 'nes2a03', instances?: {
    nes?: NES2A03;
    gb?: GameBoyAPU;
    ym?: YM2612;
  }) {
    const ctx = audioEngine.getContext();
    const t = ctx.currentTime;
    const master = audioEngine.getMasterGain();

    switch (type) {
      case 'jump': {
        // Classic upward pitch bend (e.g. Mario Jump)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = chipId === 'gameboy' ? 'square' : 'square';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(620, t + 0.16);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.linearRampToValueAtTime(0.7, t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }

      case 'laser': {
        // Fast downward zapping laser
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);

        gain.gain.setValueAtTime(0.75, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'coin': {
        // Two-tone bright chime (B4 -> E5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.setValueAtTime(0.7, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }

      case 'powerup': {
        // Ascending rapid 4-note arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const step = 0.06;
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t + idx * step);

          gain.gain.setValueAtTime(0.65, t + idx * step);
          gain.gain.exponentialRampToValueAtTime(0.001, t + (idx + 1) * step + (idx === 3 ? 0.25 : 0.02));

          osc.connect(gain);
          gain.connect(master);
          osc.start(t + idx * step);
          osc.stop(t + (idx + 1) * step + 0.3);
        });
        break;
      }

      case 'explosion': {
        // Authentic LFSR noise rumble + low pitch drop
        const sampleRate = ctx.sampleRate;
        const length = Math.floor(sampleRate * 0.45);
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        let shift = 0x7FFF;
        for (let i = 0; i < length; i++) {
          const feedback = (shift & 1) ^ ((shift >> 1) & 1);
          shift = (shift >> 1) | (feedback << 14);
          data[i] = ((shift & 1) ? 1 : -1) * 0.8;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(60, t + 0.45);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        noise.start(t);
        noise.stop(t + 0.45);
        break;
      }

      case 'hit': {
        // Quick harsh punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      case 'victory': {
        // Classic fanfare: C4, G4, C5, E5
        const fanNotes = [261.63, 392.00, 523.25, 659.25];
        fanNotes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const nt = t + i * 0.12;
          const dur = i === 3 ? 0.6 : 0.11;
          osc.frequency.setValueAtTime(f, nt);
          gain.gain.setValueAtTime(0.7, nt);
          gain.gain.exponentialRampToValueAtTime(0.001, nt + dur);

          osc.connect(gain);
          gain.connect(master);
          osc.start(nt);
          osc.stop(nt + dur);
        });
        break;
      }

      case 'gameover': {
        // Descending mournful slide (D4 -> C#4 -> C4 -> B3)
        const notes = [293.66, 277.18, 261.63, 246.94];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const nt = t + i * 0.22;
          const dur = i === 3 ? 0.7 : 0.2;
          osc.frequency.setValueAtTime(f, nt);
          gain.gain.setValueAtTime(0.8, nt);
          gain.gain.exponentialRampToValueAtTime(0.001, nt + dur);

          osc.connect(gain);
          gain.connect(master);
          osc.start(nt);
          osc.stop(nt + dur);
        });
        break;
      }
    }
  }
}
