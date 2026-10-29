/**
 * RetroChips.js - Game Boy Sharp LR35902 APU Emulation
 * 
 * Hardware Specs:
 * - Ch1: Pulse with Frequency Sweep & Volume Envelope
 * - Ch2: Pulse with Volume Envelope
 * - Ch3: Wave RAM (32x4-bit user programmable sample buffer - signature DMG flutes & basses)
 * - Ch4: Noise generator with 7-bit (metallic) or 15-bit (white) LFSR polynomial
 */

import { audioEngine, noteToFreq } from '../audioContext';
import { ChannelState } from '../types';

export class GameBoyAPU {
  private ctx: AudioContext;
  private chipGain: GainNode;

  // Wave RAM Patterns (32 4-bit nibbles, values 0-15)
  public static WAVE_PATTERNS: Record<string, number[]> = {
    zeldaFlute: [0, 2, 4, 6, 8, 10, 12, 14, 15, 14, 12, 10, 8, 6, 4, 2, 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0],
    dmgBass: [0, 0, 1, 2, 4, 7, 11, 14, 15, 15, 14, 11, 7, 4, 2, 1, 0, 0, 0, 0, 1, 2, 3, 5, 8, 12, 15, 12, 8, 5, 2, 0],
    mellowSine: [8, 9, 11, 12, 14, 15, 15, 15, 14, 12, 11, 9, 8, 6, 4, 3, 1, 0, 0, 0, 1, 3, 4, 6, 8, 9, 11, 12, 14, 15, 14, 12],
    steppedSaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  };

  public state = {
    ch1: { duty: 0.5, volume: 0.8, sweepTime: 0.05, sweepShift: 2, sweepDir: 'down' as 'up' | 'down', muted: false },
    ch2: { duty: 0.25, volume: 0.8, envStep: 0.2, muted: false },
    ch3: { wavePattern: 'zeldaFlute', volume: 0.85, muted: false },
    ch4: { mode: '15bit' as '7bit' | '15bit', volume: 0.7, muted: false }
  };

  public activities = { ch1: 0, ch2: 0, ch3: 0, ch4: 0 };
  private cachedWaveBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.ctx = audioEngine.getContext();
    this.chipGain = this.ctx.createGain();
    this.chipGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.chipGain.connect(audioEngine.getMasterGain());

    this.initWaveTables();
  }

  private initWaveTables() {
    const sampleRate = this.ctx.sampleRate;
    Object.entries(GameBoyAPU.WAVE_PATTERNS).forEach(([key, nibbles]) => {
      // 32 samples per cycle
      const buffer = this.ctx.createBuffer(1, 32, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < 32; i++) {
        // Normalize 0-15 to -1.0 to 1.0
        data[i] = ((nibbles[i] / 7.5) - 1.0) * 0.9;
      }
      this.cachedWaveBuffers.set(key, buffer);
    });
  }

  /**
   * Play Channel 1: Pulse with sweep & envelope
   */
  public playCh1(freq: number | string, duration = 0.35, velocity = 0.8) {
    if (this.state.ch1.muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(f, t);

    // GB Hardware pitch sweep
    if (this.state.ch1.sweepShift > 0 && this.state.ch1.sweepTime > 0) {
      const multiplier = this.state.ch1.sweepDir === 'up' ? 1.25 : 0.75;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, f * multiplier),
        t + this.state.ch1.sweepTime
      );
    }

    const vol = this.state.ch1.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.chipGain);

    osc.start(t);
    osc.stop(t + duration);

    this.triggerActivity('ch1');
  }

  /**
   * Play Channel 2: Pulse with envelope
   */
  public playCh2(freq: number | string, duration = 0.3, velocity = 0.8) {
    if (this.state.ch2.muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(f, t);

    const vol = this.state.ch2.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.chipGain);

    osc.start(t);
    osc.stop(t + duration);

    this.triggerActivity('ch2');
  }

  /**
   * Play Channel 3: Wave RAM (signature Game Boy flutes, organs, bass)
   */
  public playCh3(freq: number | string, duration = 0.45, velocity = 0.9) {
    if (this.state.ch3.muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    const buffer = this.cachedWaveBuffers.get(this.state.ch3.wavePattern) || 
                   this.cachedWaveBuffers.get('zeldaFlute')!;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Pitch playback: buffer has 32 samples per cycle
    // frequency f = (playbackRate * sampleRate) / 32
    src.playbackRate.setValueAtTime((f * 32) / this.ctx.sampleRate, t);

    const gain = this.ctx.createGain();
    const vol = this.state.ch3.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.setValueAtTime(vol * 0.9, t + duration * 0.8);
    gain.gain.linearRampToValueAtTime(0.001, t + duration);

    src.connect(gain);
    gain.connect(this.chipGain);

    src.start(t);
    src.stop(t + duration);

    this.triggerActivity('ch3');
  }

  /**
   * Play Channel 4: Game Boy Noise (Crisp 7-bit or 15-bit LFSR)
   */
  public playCh4(duration = 0.2, is7Bit = false, velocity = 0.75) {
    if (this.state.ch4.muted) return;
    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.min(duration, 0.8));
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const mode7 = is7Bit || this.state.ch4.mode === '7bit';
    let lfsr = 0x7FFF;

    for (let i = 0; i < length; i++) {
      // Game Boy LFSR update
      const bit0 = lfsr & 1;
      const bit1 = (lfsr >> 1) & 1;
      const xor = bit0 ^ bit1;
      lfsr = (lfsr >> 1) | (xor << 14);
      if (mode7) {
        // In 7-bit mode, bit 6 is also replaced with XOR output
        lfsr = (lfsr & ~(1 << 6)) | (xor << 6);
      }
      data[i] = ((lfsr & 1) ? 1 : -1) * 0.7;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.state.ch4.volume * velocity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(gain);
    gain.connect(this.chipGain);

    src.start(t);
    src.stop(t + duration);

    this.triggerActivity('ch4');
  }

  public playNote(freq: number | string, duration = 0.35, velocity = 0.8) {
    this.playCh1(freq, duration, velocity);
  }

  private triggerActivity(ch: 'ch1' | 'ch2' | 'ch3' | 'ch4') {
    this.activities[ch] = 1.0;
    setTimeout(() => {
      this.activities[ch] = 0;
    }, 200);
  }

  public getChannelStates(): ChannelState[] {
    return [
      {
        id: 'ch1',
        name: 'Ch 1 (Pulse + Sweep)',
        type: 'pulse',
        muted: this.state.ch1.muted,
        solo: false,
        volume: this.state.ch1.volume,
        pan: 0,
        activityLevel: this.activities.ch1,
        params: { sweepTime: `${this.state.ch1.sweepTime * 1000}ms`, dir: this.state.ch1.sweepDir }
      },
      {
        id: 'ch2',
        name: 'Ch 2 (Pulse)',
        type: 'pulse',
        muted: this.state.ch2.muted,
        solo: false,
        volume: this.state.ch2.volume,
        pan: 0,
        activityLevel: this.activities.ch2,
        params: { duty: '50% / Envelope' }
      },
      {
        id: 'ch3',
        name: 'Ch 3 (Wave RAM 32x4-bit)',
        type: 'wavetable',
        muted: this.state.ch3.muted,
        solo: false,
        volume: this.state.ch3.volume,
        pan: 0,
        activityLevel: this.activities.ch3,
        params: { pattern: this.state.ch3.wavePattern }
      },
      {
        id: 'ch4',
        name: 'Ch 4 (Poly Noise)',
        type: 'noise',
        muted: this.state.ch4.muted,
        solo: false,
        volume: this.state.ch4.volume,
        pan: 0,
        activityLevel: this.activities.ch4,
        params: { mode: this.state.ch4.mode }
      }
    ];
  }
}
