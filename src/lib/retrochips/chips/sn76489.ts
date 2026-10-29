/**
 * RetroChips.js - Texas Instruments SN76489 DCSG Emulation
 * (Sega Master System, Game Gear, BBC Micro, ColecoVision, Sega Genesis PSG)
 * 
 * Hardware Specs:
 * - 3 Square wave tone generators with 10-bit frequency dividers
 * - 4-bit attenuation per channel (15 levels + off, 2dB steps)
 * - 1 Noise generator: Periodic noise or White noise with 3 clock divisors or Tone 3 frequency lock
 */

import { audioEngine, noteToFreq } from '../audioContext';
import { ChannelState } from '../types';

export class SN76489 {
  private ctx: AudioContext;
  private chipGain: GainNode;

  public state = {
    tones: [
      { volume: 0.8, muted: false },
      { volume: 0.75, muted: false },
      { volume: 0.7, muted: false }
    ],
    noise: {
      type: 'white' as 'white' | 'periodic',
      rate: 'high' as 'high' | 'medium' | 'low' | 'tone3',
      volume: 0.7,
      muted: false
    }
  };

  public activities = { t0: 0, t1: 0, t2: 0, noise: 0 };

  constructor() {
    this.ctx = audioEngine.getContext();
    this.chipGain = this.ctx.createGain();
    this.chipGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.chipGain.connect(audioEngine.getMasterGain());
  }

  /**
   * Play on Tone channel 0, 1, or 2 (Pure punchy 8-bit square wave)
   */
  public playTone(channelIndex: 0 | 1 | 2, freq: number | string, duration = 0.3, velocity = 0.8) {
    if (this.state.tones[channelIndex].muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(f, t);

    // 4-bit stepped volume attenuation simulation
    const rawVol = this.state.tones[channelIndex].volume * velocity;
    const quantizedVol = Math.floor(rawVol * 15) / 15;

    gain.gain.setValueAtTime(quantizedVol, t);
    gain.gain.setValueAtTime(quantizedVol, t + duration * 0.8);
    gain.gain.linearRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.chipGain);

    osc.start(t);
    osc.stop(t + duration);

    const actKey = (`t${channelIndex}`) as 't0' | 't1' | 't2';
    this.activities[actKey] = 1.0;
    setTimeout(() => { this.activities[actKey] = 0; }, 200);
  }

  /**
   * Play SN76489 Noise Channel (White or Periodic buzz)
   */
  public playNoise(isPeriodic = false, duration = 0.25, velocity = 0.75) {
    if (this.state.noise.muted) return;
    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const periodic = isPeriodic || this.state.noise.type === 'periodic';
    // 16-bit shift register
    let shiftReg = 0x8000;
    const feedbackBit = periodic ? 0 : 1; // 0 for periodic (15 zeros + 1 one), 1 for white noise (LFSR)

    for (let i = 0; i < length; i++) {
      if (i % 6 === 0) {
        if (periodic) {
          const bit = shiftReg & 1;
          shiftReg = (shiftReg >> 1) | (bit << 15);
        } else {
          // White noise: bit0 ^ bit1
          const bit0 = shiftReg & 1;
          const bit1 = (shiftReg >> 1) & 1;
          const fb = bit0 ^ bit1;
          shiftReg = (shiftReg >> 1) | (fb << 15);
        }
      }
      data[i] = ((shiftReg & 1) ? 1.0 : -1.0) * 0.7;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.state.noise.volume * velocity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(gain);
    gain.connect(this.chipGain);

    src.start(t);
    src.stop(t + duration);

    this.activities.noise = 1.0;
    setTimeout(() => { this.activities.noise = 0; }, 200);
  }

  public playNote(freq: number | string, duration = 0.35, velocity = 0.8) {
    this.playTone(0, freq, duration, velocity);
  }

  public getChannelStates(): ChannelState[] {
    return [
      {
        id: 'sn_t0',
        name: 'Tone 1 (Square 10-bit)',
        type: 'pulse',
        muted: this.state.tones[0].muted,
        solo: false,
        volume: this.state.tones[0].volume,
        pan: 0,
        activityLevel: this.activities.t0,
        params: { divider: '10-bit counter' }
      },
      {
        id: 'sn_t1',
        name: 'Tone 2 (Square 10-bit)',
        type: 'pulse',
        muted: this.state.tones[1].muted,
        solo: false,
        volume: this.state.tones[1].volume,
        pan: 0,
        activityLevel: this.activities.t1,
        params: { divider: '10-bit counter' }
      },
      {
        id: 'sn_t2',
        name: 'Tone 3 (Square 10-bit)',
        type: 'pulse',
        muted: this.state.tones[2].muted,
        solo: false,
        volume: this.state.tones[2].volume,
        pan: 0,
        activityLevel: this.activities.t2,
        params: { divider: '10-bit / Noise sync' }
      },
      {
        id: 'sn_noise',
        name: 'Noise (16-bit shift)',
        type: 'noise',
        muted: this.state.noise.muted,
        solo: false,
        volume: this.state.noise.volume,
        pan: 0,
        activityLevel: this.activities.noise,
        params: { type: this.state.noise.type, rate: this.state.noise.rate }
      }
    ];
  }
}
