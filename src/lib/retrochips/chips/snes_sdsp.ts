/**
 * RetroChips.js - Sony SPC700 / S-DSP Emulation (Super Nintendo / Super Famicom)
 * 
 * Hardware Specs:
 * - 8 independent stereo ADPCM/BRR sample voices
 * - 4-point Gaussian interpolation filter emulation (warm, softened high-end)
 * - 16-bit stereo DSP with ADSR and Gain envelope
 * - Hardware Echo Buffer with 8-tap programmable FIR filter emulation (signature DKC & RPG reverb)
 */

import { audioEngine, noteToFreq } from '../audioContext';
import { ChannelState } from '../types';

export class SNES_SDSP {
  private ctx: AudioContext;
  private chipGain: GainNode;

  // Echo Delay & FIR filter nodes
  private echoInput: GainNode;
  private echoDelay: DelayNode;
  private echoFeedback: GainNode;
  private echoFilter: BiquadFilterNode;
  private echoDry: GainNode;
  private echoWet: GainNode;

  // Gaussian-style lowpass master filter
  private gaussianFilter: BiquadFilterNode;

  // Instrument Wavetables
  private instrumentBuffers: Map<string, AudioBuffer> = new Map();

  public state = {
    selectedInstrument: 'strings', // 'strings' | 'brass' | 'slapBass' | 'flute' | 'choir' | 'harp'
    echo: {
      enabled: true,
      delayTime: 0.18, // 180ms delay
      feedback: 0.45,  // 45% feedback
      wetLevel: 0.38,
      firFilterFreq: 2800 // FIR cutoff
    },
    gaussianInterpolation: true,
    adsr: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.7,
      release: 0.35
    }
  };

  public activities = { v1: 0, v2: 0, v3: 0, echo: 0 };

  constructor() {
    this.ctx = audioEngine.getContext();
    this.chipGain = this.ctx.createGain();
    this.chipGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Setup Gaussian Interpolation filter (warm roll-off at ~9.5 kHz)
    this.gaussianFilter = this.ctx.createBiquadFilter();
    this.gaussianFilter.type = 'lowpass';
    this.gaussianFilter.frequency.setValueAtTime(9500, this.ctx.currentTime);
    this.gaussianFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Setup Hardware Echo Reverb unit
    this.echoInput = this.ctx.createGain();
    this.echoDelay = this.ctx.createDelay(1.0);
    this.echoDelay.delayTime.setValueAtTime(this.state.echo.delayTime, this.ctx.currentTime);

    this.echoFeedback = this.ctx.createGain();
    this.echoFeedback.gain.setValueAtTime(this.state.echo.feedback, this.ctx.currentTime);

    // 8-tap FIR filter emulation: damped low-pass with slight high frequency decay
    this.echoFilter = this.ctx.createBiquadFilter();
    this.echoFilter.type = 'lowpass';
    this.echoFilter.frequency.setValueAtTime(this.state.echo.firFilterFreq, this.ctx.currentTime);

    this.echoDry = this.ctx.createGain();
    this.echoWet = this.ctx.createGain();
    this.echoDry.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.echoWet.gain.setValueAtTime(this.state.echo.wetLevel, this.ctx.currentTime);

    // Loop: echoInput -> echoDelay -> echoFilter -> echoFeedback -> echoDelay
    this.echoInput.connect(this.echoDry);
    this.echoInput.connect(this.echoDelay);
    this.echoDelay.connect(this.echoFilter);
    this.echoFilter.connect(this.echoFeedback);
    this.echoFeedback.connect(this.echoDelay);
    this.echoFilter.connect(this.echoWet);

    this.echoDry.connect(this.gaussianFilter);
    this.echoWet.connect(this.gaussianFilter);
    this.gaussianFilter.connect(this.chipGain);
    this.chipGain.connect(audioEngine.getMasterGain());

    this.initSampleBuffers();
  }

  private initSampleBuffers() {
    const sampleRate = this.ctx.sampleRate;
    // Base frequency for generated root sample: C4 (261.63 Hz)
    const rootFreq = 261.63;
    const duration = 1.0;
    const length = Math.floor(sampleRate * duration);

    // 1. Ethereal Strings (Rich lush bowed sawtooth harmonics with BRR warmth)
    const stringsBuf = this.ctx.createBuffer(1, length, sampleRate);
    const sData = stringsBuf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let val = 0;
      for (let h = 1; h <= 12; h++) {
        const amp = (1 / h) * Math.sin(2 * Math.PI * (rootFreq * h) * t);
        val += amp * 0.45;
      }
      sData[i] = val * 0.7;
    }
    this.instrumentBuffers.set('strings', stringsBuf);

    // 2. Orchestral Brass (Punchy fanfare with vibrant 2nd and 3rd harmonics)
    const brassBuf = this.ctx.createBuffer(1, length, sampleRate);
    const bData = brassBuf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const f = rootFreq;
      const val = Math.sin(2 * Math.PI * f * t) * 0.6 +
                  Math.sin(2 * Math.PI * (f * 2) * t) * 0.4 +
                  Math.sin(2 * Math.PI * (f * 3) * t) * 0.3 +
                  Math.sin(2 * Math.PI * (f * 4) * t) * 0.15;
      bData[i] = val * 0.7;
    }
    this.instrumentBuffers.set('brass', brassBuf);

    // 3. Slap Bass (Chunky funk thumb slap with rapid high-frequency pluck transient)
    const bassBuf = this.ctx.createBuffer(1, length, sampleRate);
    const bsData = bassBuf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 8);
      const slapSnap = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 50) * 0.4;
      const body = (Math.sin(2 * Math.PI * (rootFreq / 2) * t) + 0.5 * Math.sin(2 * Math.PI * rootFreq * t)) * decay;
      bsData[i] = (body + slapSnap) * 0.8;
    }
    this.instrumentBuffers.set('slapBass', bassBuf);

    // 4. Pan Flute (Iconic Zelda / Secret of Mana breathy pastoral whistle)
    const fluteBuf = this.ctx.createBuffer(1, length, sampleRate);
    const fData = fluteBuf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const pureTone = Math.sin(2 * Math.PI * rootFreq * t);
      const breath = (Math.random() * 2 - 1) * 0.12;
      const octave = Math.sin(2 * Math.PI * (rootFreq * 2) * t) * 0.2;
      fData[i] = (pureTone + octave + breath) * 0.65;
    }
    this.instrumentBuffers.set('flute', fluteBuf);

    // 5. Choir / Ambient Pad
    const choirBuf = this.ctx.createBuffer(1, length, sampleRate);
    const cData = choirBuf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const formants = Math.sin(2 * Math.PI * rootFreq * t) * 0.5 +
                       Math.sin(2 * Math.PI * (rootFreq * 3) * t) * 0.3 +
                       Math.sin(2 * Math.PI * (rootFreq * 5) * t) * 0.2;
      cData[i] = formants * 0.65;
    }
    this.instrumentBuffers.set('choir', choirBuf);
  }

  public setEcho(enabled: boolean, delayTime = 0.18, feedback = 0.45, wet = 0.38) {
    this.state.echo.enabled = enabled;
    this.state.echo.delayTime = delayTime;
    this.state.echo.feedback = feedback;
    this.state.echo.wetLevel = wet;

    const t = this.ctx.currentTime;
    this.echoDelay.delayTime.setTargetAtTime(delayTime, t, 0.05);
    this.echoFeedback.gain.setTargetAtTime(enabled ? feedback : 0, t, 0.05);
    this.echoWet.gain.setTargetAtTime(enabled ? wet : 0, t, 0.05);
  }

  public setInstrument(inst: string) {
    if (this.instrumentBuffers.has(inst)) {
      this.state.selectedInstrument = inst;
    }
  }

  /**
   * Play an authentic SNES S-DSP sample voice through ADSR and Echo Reverb
   */
  public playVoice(freq: number | string, duration = 0.6, velocity = 0.85) {
    const f = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f) || f <= 0) return;

    const t = this.ctx.currentTime;
    const buffer = this.instrumentBuffers.get(this.state.selectedInstrument) || 
                   this.instrumentBuffers.get('strings')!;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Root frequency is C4 (261.63)
    const rate = f / 261.63;
    src.playbackRate.setValueAtTime(rate, t);

    // ADSR Envelope
    const gain = this.ctx.createGain();
    const adsr = this.state.adsr;
    const attackEnd = t + adsr.attack;
    const decayEnd = attackEnd + adsr.decay;
    const sustainVol = adsr.sustain * velocity * 0.8;
    const releaseEnd = t + duration + adsr.release;

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.8, attackEnd);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainVol), decayEnd);
    gain.gain.setValueAtTime(Math.max(0.001, sustainVol), t + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

    src.connect(gain);
    gain.connect(this.echoInput);

    src.start(t);
    src.stop(releaseEnd);

    this.triggerActivity('v1');
  }

  public playNote(freq: number | string, duration = 0.6, velocity = 0.85) {
    this.playVoice(freq, duration, velocity);
  }

  private triggerActivity(ch: 'v1' | 'v2' | 'v3' | 'echo') {
    this.activities[ch] = 1.0;
    setTimeout(() => {
      this.activities[ch] = 0;
    }, 250);
  }

  public getChannelStates(): ChannelState[] {
    return [
      {
        id: 'voice1',
        name: 'S-DSP Voices (8 Stereo Channels)',
        type: 'sample',
        muted: false,
        solo: false,
        volume: 0.85,
        pan: 0,
        activityLevel: this.activities.v1,
        params: { instrument: this.state.selectedInstrument, interpolation: '4-point Gaussian' }
      },
      {
        id: 'adsr',
        name: 'Envelope Generator (ADSR)',
        type: 'sample',
        muted: false,
        solo: false,
        volume: this.state.adsr.sustain,
        pan: 0,
        activityLevel: this.activities.v1,
        params: { A: `${Math.round(this.state.adsr.attack * 1000)}ms`, D: `${Math.round(this.state.adsr.decay * 1000)}ms`, S: `${Math.round(this.state.adsr.sustain * 100)}%`, R: `${Math.round(this.state.adsr.release * 1000)}ms` }
      },
      {
        id: 'echo',
        name: 'SNES Hardware Echo + 8-Tap FIR',
        type: 'sample',
        muted: !this.state.echo.enabled,
        solo: false,
        volume: this.state.echo.wetLevel,
        pan: 0,
        activityLevel: this.activities.echo,
        params: { delay: `${Math.round(this.state.echo.delayTime * 1000)}ms`, feedback: `${Math.round(this.state.echo.feedback * 100)}%` }
      }
    ];
  }
}
