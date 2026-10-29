/**
 * RetroChips.js - MOS Technology 6581 / 8580 SID Emulation (Commodore 64)
 * 
 * Hardware Specs:
 * - 3 independent tone voices
 * - 4 waveforms: Sawtooth, Triangle, Pulse with PWM, Noise
 * - Oscillator Hard Sync and Ring Modulation
 * - 12dB/octave Multi-Mode State-Variable Analog Filter:
 *   Low-Pass, Band-Pass, High-Pass, Notch with Resonance (Q)
 */

import { audioEngine, noteToFreq } from '../audioContext';
import { ChannelState } from '../types';

export class SID6581 {
  private ctx: AudioContext;
  private chipGain: GainNode;

  // SID Multi-mode Filter
  private sidFilter: BiquadFilterNode;
  private filterDry: GainNode;
  private filterWet: GainNode;

  public state = {
    waveform: 'sawtooth' as 'sawtooth' | 'triangle' | 'pulse' | 'noise',
    pulseWidth: 0.5, // 0.05 to 0.95 for PWM
    pwmSpeed: 2.0,   // Hz
    pwmDepth: 0.35,
    filter: {
      enabled: true,
      mode: 'lowpass' as 'lowpass' | 'highpass' | 'bandpass',
      cutoff: 2400, // 30 to 12000 Hz
      resonance: 5.5, // Q factor
      routeVoice1: true,
      routeVoice2: true,
      routeVoice3: true
    },
    ringMod: false,
    sync: false,
    voices: [
      { volume: 0.8, detune: 0, octave: 0 },
      { volume: 0.7, detune: 7, octave: 0 },
      { volume: 0.6, detune: -5, octave: -1 }
    ]
  };

  public activities = { v1: 0, v2: 0, v3: 0, filter: 0 };

  constructor() {
    this.ctx = audioEngine.getContext();
    this.chipGain = this.ctx.createGain();
    this.chipGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    // Setup 12dB/octave multi-mode filter
    this.sidFilter = this.ctx.createBiquadFilter();
    this.sidFilter.type = this.state.filter.mode;
    this.sidFilter.frequency.setValueAtTime(this.state.filter.cutoff, this.ctx.currentTime);
    this.sidFilter.Q.setValueAtTime(this.state.filter.resonance, this.ctx.currentTime);

    this.filterDry = this.ctx.createGain();
    this.filterWet = this.ctx.createGain();
    this.filterDry.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.filterWet.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.sidFilter.connect(this.filterWet);
    this.filterWet.connect(this.chipGain);
    this.filterDry.connect(this.chipGain);
    this.chipGain.connect(audioEngine.getMasterGain());
  }

  public setFilter(mode: 'lowpass' | 'highpass' | 'bandpass', cutoff: number, resonance: number) {
    this.state.filter.mode = mode;
    this.state.filter.cutoff = cutoff;
    this.state.filter.resonance = resonance;

    const t = this.ctx.currentTime;
    this.sidFilter.type = mode;
    this.sidFilter.frequency.setTargetAtTime(cutoff, t, 0.02);
    this.sidFilter.Q.setTargetAtTime(resonance, t, 0.02);
  }

  /**
   * Play SID Voice with authentic waveforms, PWM, and filter routing
   */
  public playVoice(freq: number | string, duration = 0.45, velocity = 0.85) {
    const f0 = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f0) || f0 <= 0) return;

    const t = this.ctx.currentTime;
    const wf = this.state.waveform;

    if (wf === 'noise') {
      this.playSIDNoise(duration, velocity);
      return;
    }

    // Voice 1 & 2 for rich chorus/detune or ring modulation
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    osc1.type = wf === 'pulse' ? 'square' : wf;
    osc2.type = wf === 'pulse' ? 'square' : wf;

    osc1.frequency.setValueAtTime(f0, t);
    osc2.frequency.setValueAtTime(f0 * 1.006, t); // Authentic SID multi-voice phase chorus

    // Pulse Width Modulation (PWM) simulation for pulse wave
    if (wf === 'pulse') {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(this.state.pwmSpeed, t);
      lfoGain.gain.setValueAtTime(this.state.pwmDepth * 15, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.detune);
      lfo.start(t);
      lfo.stop(t + duration);
    }

    // ADSR Envelope
    const vol = this.state.voices[0].volume * velocity;
    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain1.gain.exponentialRampToValueAtTime(vol * 0.7, t + 0.15);
    gain1.gain.setValueAtTime(vol * 0.7, t + duration * 0.8);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + duration);

    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.linearRampToValueAtTime(vol * 0.6, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + duration);

    // Route to SID Filter or Dry
    osc1.connect(gain1);
    osc2.connect(gain2);

    if (this.state.filter.enabled) {
      gain1.connect(this.sidFilter);
      gain2.connect(this.sidFilter);
      this.triggerActivity('filter');
    } else {
      gain1.connect(this.filterDry);
      gain2.connect(this.filterDry);
    }

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);

    this.triggerActivity('v1');
    this.triggerActivity('v2');
  }

  /**
   * Play SID 23-bit Pseudo-Random Noise generator
   */
  public playSIDNoise(duration = 0.3, velocity = 0.8) {
    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // SID 23-bit LFSR polynomial (bits 22 and 17)
    let reg = 0x7FFFFF;
    for (let i = 0; i < length; i++) {
      const bit22 = (reg >> 22) & 1;
      const bit17 = (reg >> 17) & 1;
      const feedback = bit22 ^ bit17;
      reg = ((reg << 1) | feedback) & 0x7FFFFF;
      // Output 4-bit DAC from selected bits
      const out = ((reg >> 20) & 1) ? 0.8 : -0.8;
      data[i] = out;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(gain);
    if (this.state.filter.enabled) {
      gain.connect(this.sidFilter);
    } else {
      gain.connect(this.filterDry);
    }

    src.start(t);
    src.stop(t + duration);
    this.triggerActivity('v3');
  }

  public playNote(freq: number | string, duration = 0.45, velocity = 0.85) {
    this.playVoice(freq, duration, velocity);
  }

  private triggerActivity(ch: 'v1' | 'v2' | 'v3' | 'filter') {
    this.activities[ch] = 1.0;
    setTimeout(() => {
      this.activities[ch] = 0;
    }, 200);
  }

  public getChannelStates(): ChannelState[] {
    return [
      {
        id: 'sid_v1',
        name: 'Voice 1 (Oscillator 1)',
        type: 'pwm',
        muted: false,
        solo: false,
        volume: this.state.voices[0].volume,
        pan: 0,
        activityLevel: this.activities.v1,
        params: { waveform: this.state.waveform, pwm: `${Math.round(this.state.pulseWidth * 100)}%` }
      },
      {
        id: 'sid_v2',
        name: 'Voice 2 (Oscillator 2)',
        type: 'pwm',
        muted: false,
        solo: false,
        volume: this.state.voices[1].volume,
        pan: 0,
        activityLevel: this.activities.v2,
        params: { detune: `+${this.state.voices[1].detune} cents` }
      },
      {
        id: 'sid_v3',
        name: 'Voice 3 / LFSR Noise',
        type: 'noise',
        muted: false,
        solo: false,
        volume: this.state.voices[2].volume,
        pan: 0,
        activityLevel: this.activities.v3,
        params: { lfsr: '23-bit SID' }
      },
      {
        id: 'sid_flt',
        name: '12dB Multi-Mode Filter',
        type: 'sample',
        muted: !this.state.filter.enabled,
        solo: false,
        volume: 0.9,
        pan: 0,
        activityLevel: this.activities.filter,
        params: { mode: this.state.filter.mode, cutoff: `${this.state.filter.cutoff} Hz`, Q: this.state.filter.resonance }
      }
    ];
  }
}
