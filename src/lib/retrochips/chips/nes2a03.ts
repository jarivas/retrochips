/**
 * RetroChips.js - NES Ricoh 2A03 APU Emulation
 * 
 * Hardware Specs:
 * - 2 Pulse channels (Duty cycles: 12.5%, 25%, 50%, 75%, hardware pitch sweep)
 * - 1 Triangle channel (16-step staircase 4-bit DAC, buzzy bass)
 * - 1 Noise channel (15-bit LFSR white noise or 9-bit metallic loop mode)
 * - 1 DPCM channel (Delta Modulation Channel for 1-bit / 7-bit samples)
 */

import { audioEngine, noteToFreq } from '../audioContext';
import { ChannelState } from '../types';

export class NES2A03 {
  private ctx: AudioContext;
  private chipGain: GainNode;

  // Channel Nodes
  private p1Osc: OscillatorNode | null = null;
  private p1Gain: GainNode | null = null;

  private p2Osc: OscillatorNode | null = null;
  private p2Gain: GainNode | null = null;

  private triOsc: OscillatorNode | null = null;
  private triGain: GainNode | null = null;

  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  // Precomputed PeriodicWaves for exact pulse duty cycles
  private pulseWaves: Map<number, PeriodicWave> = new Map();
  private triangleWave: PeriodicWave | null = null;

  // Channel States & Settings
  public state = {
    p1: { duty: 0.5, volume: 0.8, sweep: 0, muted: false, pan: 0 },
    p2: { duty: 0.25, volume: 0.8, muted: false, pan: 0 },
    tri: { volume: 0.85, muted: false, pan: 0 },
    noise: { mode: '15bit' as '15bit' | '9bit', period: 8, volume: 0.7, muted: false, pan: 0 },
    dpcm: { volume: 0.8, muted: false, pan: 0 }
  };

  // Activity tracking for visual indicators
  public activities = { p1: 0, p2: 0, tri: 0, noise: 0, dpcm: 0 };

  constructor() {
    this.ctx = audioEngine.getContext();
    this.chipGain = this.ctx.createGain();
    this.chipGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.chipGain.connect(audioEngine.getMasterGain());

    this.initWaveforms();
  }

  private initWaveforms() {
    // Generate authentic duty cycle periodic waves: 12.5%, 25%, 50%, 75%
    [0.125, 0.25, 0.5, 0.75].forEach(duty => {
      const nHarmonics = 64;
      const real = new Float32Array(nHarmonics);
      const imag = new Float32Array(nHarmonics);

      for (let n = 1; n < nHarmonics; n++) {
        // Fourier series of pulse wave with duty D
        // imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
        const factor = (2 / (n * Math.PI));
        imag[n] = factor * Math.sin(n * Math.PI * duty);
        real[n] = factor * (1 - Math.cos(n * Math.PI * duty));
      }

      this.pulseWaves.set(duty, this.ctx.createPeriodicWave(real, imag));
    });

    // 16-step quantized staircase triangle wave (NES 4-bit DAC)
    const n = 64;
    const realTri = new Float32Array(n);
    const imagTri = new Float32Array(n);
    for (let k = 1; k < n; k += 2) {
      // Triangle harmonics fall off by 1 / k^2 with slight staircase distortion
      const sign = (k % 4 === 1) ? 1 : -1;
      imagTri[k] = (8 / (Math.PI * Math.PI * k * k)) * sign;
    }
    // Add tiny high-order stepped harmonics characteristic of the 16-step NES DAC
    for (let k = 15; k < n; k += 16) {
      imagTri[k] += 0.05 / k;
    }
    this.triangleWave = this.ctx.createPeriodicWave(realTri, imagTri);
  }

  public setMasterGain(val: number) {
    this.chipGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, val)), this.ctx.currentTime, 0.01);
  }

  /**
   * Play a note on Pulse 1 channel
   */
  public playPulse1(freq: number | string, duration = 0.3, velocity = 0.8) {
    if (this.state.p1.muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    if (this.p1Osc) {
      try { this.p1Osc.stop(t); } catch {}
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    const wave = this.pulseWaves.get(this.state.p1.duty) || this.pulseWaves.get(0.5)!;
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(f, t);

    // Hardware sweep emulation if configured
    if (this.state.p1.sweep !== 0) {
      const targetFreq = f * Math.pow(2, this.state.p1.sweep / 12);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq), t + duration * 0.7);
    }

    // NES Decay envelope: instant attack, linear/exponential decay
    const vol = this.state.p1.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.setValueAtTime(vol * 0.9, t + duration * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    if (panner) {
      panner.pan.value = this.state.p1.pan;
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.chipGain);
    } else {
      osc.connect(gain);
      gain.connect(this.chipGain);
    }

    osc.start(t);
    osc.stop(t + duration);

    this.p1Osc = osc;
    this.p1Gain = gain;
    this.triggerActivity('p1');
  }

  /**
   * Play a note on Pulse 2 channel
   */
  public playPulse2(freq: number | string, duration = 0.3, velocity = 0.8) {
    if (this.state.p2.muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    if (this.p2Osc) {
      try { this.p2Osc.stop(t); } catch {}
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const wave = this.pulseWaves.get(this.state.p2.duty) || this.pulseWaves.get(0.25)!;
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(f, t);

    const vol = this.state.p2.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.chipGain);

    osc.start(t);
    osc.stop(t + duration);

    this.p2Osc = osc;
    this.p2Gain = gain;
    this.triggerActivity('p2');
  }

  /**
   * Play a note on Triangle channel (NES bass/flute)
   */
  public playTriangle(freq: number | string, duration = 0.4, velocity = 0.9) {
    if (this.state.tri.muted) return;
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    if (this.triOsc) {
      try { this.triOsc.stop(t); } catch {}
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (this.triangleWave) {
      osc.setPeriodicWave(this.triangleWave);
    } else {
      osc.type = 'triangle';
    }
    osc.frequency.setValueAtTime(f, t);

    // NES triangle has no volume attenuation in hardware (full level gate)
    // with slight linear decay on note-off
    const vol = this.state.tri.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.setValueAtTime(vol, t + duration * 0.85);
    gain.gain.linearRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.chipGain);

    osc.start(t);
    osc.stop(t + duration);

    this.triOsc = osc;
    this.triGain = gain;
    this.triggerActivity('tri');
  }

  /**
   * Play authentic NES LFSR Noise (Snare, Hi-Hat, Explosion)
   */
  public playNoise(periodIndex = 8, isShortLoop = false, duration = 0.2, velocity = 0.7) {
    if (this.state.noise.muted) return;

    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * Math.min(duration, 1.0));
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // NES authentic LFSR algorithm: 15-bit or 9-bit mode
    let shiftReg = 1;
    const is9Bit = isShortLoop || this.state.noise.mode === '9bit';
    const tapBit = is9Bit ? 6 : 1; // 9-bit metallic loop mode vs 15-bit pseudo-white noise

    // Frequency divider mapping (16 periods in NES APU)
    const nesDivisors = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
    const divisor = nesDivisors[Math.max(0, Math.min(15, periodIndex))] || 128;
    const stepInterval = Math.max(1, Math.floor(divisor / 8));

    let sampleVal = 0;
    for (let i = 0; i < bufferSize; i++) {
      if (i % stepInterval === 0) {
        const feedback = (shiftReg & 1) ^ ((shiftReg >> tapBit) & 1);
        shiftReg = (shiftReg >> 1) | (feedback << 14);
        sampleVal = (shiftReg & 1) ? 1.0 : -1.0;
      }
      data[i] = sampleVal * 0.75;
    }

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = buffer;

    const gain = this.ctx.createGain();
    const vol = this.state.noise.volume * velocity;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseSrc.connect(gain);
    gain.connect(this.chipGain);

    noiseSrc.start(t);
    noiseSrc.stop(t + duration);

    this.noiseSource = noiseSrc;
    this.noiseGain = gain;
    this.triggerActivity('noise');
  }

  /**
   * Play DPCM Delta Sample (e.g. Kick, Tom, Slap)
   */
  public playDPCM(sampleType: 'kick' | 'snare' | 'tom' | 'slap' = 'kick', duration = 0.25) {
    if (this.state.dpcm.muted) return;
    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Delta modulation simulation (1-bit delta steps into 7-bit counter)
    let counter = 32;
    for (let i = 0; i < length; i++) {
      const phase = i / length;
      let target = 0;
      if (sampleType === 'kick') {
        const f = 140 * Math.exp(-phase * 15);
        target = Math.sin(2 * Math.PI * f * (i / sampleRate)) * (1 - phase);
      } else if (sampleType === 'tom') {
        const f = 200 * Math.exp(-phase * 8);
        target = Math.sin(2 * Math.PI * f * (i / sampleRate)) * (1 - phase);
      } else {
        target = (Math.random() * 2 - 1) * Math.exp(-phase * 20);
      }

      // Step up/down with 1-bit delta quantization
      const targetStep = Math.floor((target + 1) * 31);
      if (targetStep > counter) counter = Math.min(63, counter + 2);
      else if (targetStep < counter) counter = Math.max(0, counter - 2);

      data[i] = (counter - 32) / 32;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.state.dpcm.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(gain);
    gain.connect(this.chipGain);
    src.start(t);

    this.triggerActivity('dpcm');
  }

  /**
   * General note player mapping to primary melodic channels
   */
  public playNote(freq: number | string, duration = 0.35, velocity = 0.8) {
    this.playPulse1(freq, duration, velocity);
  }

  private triggerActivity(ch: 'p1' | 'p2' | 'tri' | 'noise' | 'dpcm') {
    this.activities[ch] = 1.0;
    setTimeout(() => {
      this.activities[ch] = 0;
    }, 200);
  }

  public getChannelStates(): ChannelState[] {
    return [
      {
        id: 'p1',
        name: 'Pulse 1',
        type: 'pulse',
        muted: this.state.p1.muted,
        solo: false,
        volume: this.state.p1.volume,
        pan: this.state.p1.pan,
        activityLevel: this.activities.p1,
        params: { duty: `${this.state.p1.duty * 100}%`, sweep: this.state.p1.sweep }
      },
      {
        id: 'p2',
        name: 'Pulse 2',
        type: 'pulse',
        muted: this.state.p2.muted,
        solo: false,
        volume: this.state.p2.volume,
        pan: this.state.p2.pan,
        activityLevel: this.activities.p2,
        params: { duty: `${this.state.p2.duty * 100}%` }
      },
      {
        id: 'tri',
        name: 'Triangle',
        type: 'triangle',
        muted: this.state.tri.muted,
        solo: false,
        volume: this.state.tri.volume,
        pan: this.state.tri.pan,
        activityLevel: this.activities.tri,
        params: { steps: '16-step 4-bit DAC' }
      },
      {
        id: 'noise',
        name: 'Noise (LFSR)',
        type: 'noise',
        muted: this.state.noise.muted,
        solo: false,
        volume: this.state.noise.volume,
        pan: this.state.noise.pan,
        activityLevel: this.activities.noise,
        params: { mode: this.state.noise.mode, period: this.state.noise.period }
      },
      {
        id: 'dpcm',
        name: 'DPCM (Sample)',
        type: 'sample',
        muted: this.state.dpcm.muted,
        solo: false,
        volume: this.state.dpcm.volume,
        pan: this.state.dpcm.pan,
        activityLevel: this.activities.dpcm,
        params: { rate: '33.14 kHz max' }
      }
    ];
  }
}
