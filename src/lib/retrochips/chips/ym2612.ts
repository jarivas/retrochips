/**
 * RetroChips.js - Yamaha YM2612 (OPN2) FM Synthesis Emulation
 * 
 * Hardware Specs:
 * - 6 FM channels (stereo panning)
 * - 4 Operators per channel with 8 FM Algorithms
 * - Operator controls: Frequency Multiplier (MUL), Total Level (TL), AR, DR, SL, RR, Detune
 * - Feedback loop on Operator 1 (signature gritty Sega Genesis bass & brass)
 * - Ch6 DAC mode for 8-bit PCM samples
 */

import { audioEngine, noteToFreq } from '../audioContext';
import { ChannelState } from '../types';

export interface FMOperatorConfig {
  mul: number; // 0.5 to 15
  tl: number;  // 0 to 1 (0 = loudest/max modulation, 1 = silent)
  ar: number;  // attack time in sec
  dr: number;  // decay time in sec
  sl: number;  // sustain level 0 to 1
  rr: number;  // release time in sec
  detune: number; // cents
}

export class YM2612 {
  private ctx: AudioContext;
  private chipGain: GainNode;

  // Global YM2612 parameters
  public state = {
    algorithm: 4, // 0 to 7 (Algorithm 4 and 7 are legendary in Genesis games)
    feedback: 5,  // 0 to 7 (Feedback on Op1)
    lfo: { enabled: false, freq: 4.5, depth: 0.1 },
    dacMode: false,
    operators: [
      // Op 1 (Modulator)
      { mul: 1.0, tl: 0.2, ar: 0.01, dr: 0.25, sl: 0.4, rr: 0.2, detune: 0 },
      // Op 2
      { mul: 2.0, tl: 0.35, ar: 0.02, dr: 0.3, sl: 0.3, rr: 0.15, detune: 2 },
      // Op 3
      { mul: 1.0, tl: 0.25, ar: 0.01, dr: 0.2, sl: 0.5, rr: 0.2, detune: -2 },
      // Op 4 (Carrier)
      { mul: 1.0, tl: 0.0, ar: 0.005, dr: 0.4, sl: 0.6, rr: 0.25, detune: 0 },
    ] as FMOperatorConfig[],
    ch6DAC: { volume: 0.9, muted: false }
  };

  public activities = { ch1: 0, ch2: 0, ch3: 0, ch4: 0, ch5: 0, dac: 0 };

  constructor() {
    this.ctx = audioEngine.getContext();
    this.chipGain = this.ctx.createGain();
    this.chipGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.chipGain.connect(audioEngine.getMasterGain());
  }

  public setMasterGain(val: number) {
    this.chipGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, val)), this.ctx.currentTime, 0.01);
  }

  /**
   * Set one of the 8 classic Yamaha FM algorithms (0-7):
   * Alg 0: Op1 -> Op2 -> Op3 -> Op4 (Pure Cascade)
   * Alg 1: (Op1 + Op2) -> Op3 -> Op4
   * Alg 2: (Op1 -> Op2) + (Op3) -> Op4
   * Alg 3: (Op1 -> Op2 -> Op3) + Op4
   * Alg 4: (Op1 -> Op2) + (Op3 -> Op4) (Iconic Genesis Bass & Strings)
   * Alg 5: Op1 -> (Op2 + Op3 + Op4)
   * Alg 6: (Op1 -> Op2) + Op3 + Op4
   * Alg 7: Op1 + Op2 + Op3 + Op4 (4 Parallel Additive Carriers - Organs, Bells)
   */
  public setAlgorithm(alg: number) {
    this.state.algorithm = Math.max(0, Math.min(7, Math.floor(alg)));
  }

  public setFeedback(fb: number) {
    this.state.feedback = Math.max(0, Math.min(7, Math.floor(fb)));
  }

  /**
   * Play an authentic 4-operator FM synthesized voice
   */
  public playFMVoice(freq: number | string, duration = 0.5, velocity = 0.85) {
    const f0 = typeof freq === 'string' ? noteToFreq(freq) : freq;
    if (isNaN(f0) || f0 <= 0) return;

    const t = this.ctx.currentTime;
    const ops = this.state.operators;

    // Create 4 audio oscillators and gain envelopes
    const oscNodes: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const cfg = ops[i];

      // Frequency = baseFreq * MUL + detune
      const opFreq = f0 * (cfg.mul === 0 ? 0.5 : cfg.mul);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(opFreq, t);
      osc.detune.setValueAtTime(cfg.detune, t);

      // ADSR Envelope calculation
      const peakAmp = Math.pow(10, -cfg.tl * 2); // Logarithmic attenuation from Total Level
      const attackEnd = t + Math.max(0.002, cfg.ar);
      const decayEnd = attackEnd + Math.max(0.01, cfg.dr);
      const sustainAmp = peakAmp * cfg.sl;
      const releaseEnd = t + duration + Math.max(0.01, cfg.rr);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(peakAmp * velocity, attackEnd);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustainAmp * velocity), decayEnd);
      gain.gain.setValueAtTime(Math.max(0.0001, sustainAmp * velocity), t + duration);
      gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      osc.connect(gain);
      oscNodes.push(osc);
      gainNodes.push(gain);
    }

    // Modulation depth scaling: in FM, index = modulation Amp * freq * depthFactor
    const modScale = f0 * 2.5;

    // Modulator scaling gains
    const modGainNodes: GainNode[] = gainNodes.map(g => {
      const mGain = this.ctx.createGain();
      mGain.gain.setValueAtTime(modScale, t);
      g.connect(mGain);
      return mGain;
    });

    // Master voice output node
    const voiceOutput = this.ctx.createGain();
    voiceOutput.gain.setValueAtTime(0.4, t);

    // Wire up the 8 FM Algorithms
    const alg = this.state.algorithm;
    switch (alg) {
      case 0: // Op1 -> Op2 -> Op3 -> Op4
        modGainNodes[0].connect(oscNodes[1].frequency);
        modGainNodes[1].connect(oscNodes[2].frequency);
        modGainNodes[2].connect(oscNodes[3].frequency);
        gainNodes[3].connect(voiceOutput);
        break;

      case 1: // (Op1 + Op2) -> Op3 -> Op4
        modGainNodes[0].connect(oscNodes[2].frequency);
        modGainNodes[1].connect(oscNodes[2].frequency);
        modGainNodes[2].connect(oscNodes[3].frequency);
        gainNodes[3].connect(voiceOutput);
        break;

      case 2: // (Op1 -> Op2) + Op3 -> Op4
        modGainNodes[0].connect(oscNodes[1].frequency);
        modGainNodes[1].connect(oscNodes[3].frequency);
        modGainNodes[2].connect(oscNodes[3].frequency);
        gainNodes[3].connect(voiceOutput);
        break;

      case 3: // (Op1 -> Op2 -> Op3) + Op4 (Two Carriers: Op3 & Op4)
        modGainNodes[0].connect(oscNodes[1].frequency);
        modGainNodes[1].connect(oscNodes[2].frequency);
        gainNodes[2].connect(voiceOutput);
        gainNodes[3].connect(voiceOutput);
        break;

      case 4: // (Op1 -> Op2) + (Op3 -> Op4) (Standard 2x2 FM: Sonic bass / bells)
        modGainNodes[0].connect(oscNodes[1].frequency);
        gainNodes[1].connect(voiceOutput);
        modGainNodes[2].connect(oscNodes[3].frequency);
        gainNodes[3].connect(voiceOutput);
        break;

      case 5: // Op1 -> (Op2, Op3, Op4) (1 Modulator, 3 Carriers)
        modGainNodes[0].connect(oscNodes[1].frequency);
        modGainNodes[0].connect(oscNodes[2].frequency);
        modGainNodes[0].connect(oscNodes[3].frequency);
        gainNodes[1].connect(voiceOutput);
        gainNodes[2].connect(voiceOutput);
        gainNodes[3].connect(voiceOutput);
        break;

      case 6: // (Op1 -> Op2) + Op3 + Op4 (3 Carriers)
        modGainNodes[0].connect(oscNodes[1].frequency);
        gainNodes[1].connect(voiceOutput);
        gainNodes[2].connect(voiceOutput);
        gainNodes[3].connect(voiceOutput);
        break;

      case 7: // Op1 + Op2 + Op3 + Op4 (4 Additive Carriers: Organs, Synth Pads)
      default:
        gainNodes[0].connect(voiceOutput);
        gainNodes[1].connect(voiceOutput);
        gainNodes[2].connect(voiceOutput);
        gainNodes[3].connect(voiceOutput);
        break;
    }

    // Feedback emulation on Op 1 (adds gritty phase harmonics)
    if (this.state.feedback > 0) {
      const fbGain = this.ctx.createGain();
      fbGain.gain.setValueAtTime(this.state.feedback * 120, t);
      gainNodes[0].connect(fbGain);
      fbGain.connect(oscNodes[0].frequency);
    }

    voiceOutput.connect(this.chipGain);

    const stopTime = t + duration + Math.max(...ops.map(o => o.rr)) + 0.1;
    oscNodes.forEach(osc => {
      osc.start(t);
      osc.stop(stopTime);
    });

    this.triggerActivity('ch1');
  }

  /**
   * Play Sega Genesis PCM Drum / Voice sample (Ch6 DAC)
   */
  public playDACSample(sampleType: 'segaKick' | 'segaSnare' | 'segaCymbal' | 'segaTom' = 'segaKick') {
    const t = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const duration = sampleType === 'segaCymbal' ? 0.35 : 0.22;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // 8-bit quantized crunchy DAC emulation
    for (let i = 0; i < length; i++) {
      const p = i / length;
      let raw = 0;
      if (sampleType === 'segaKick') {
        const sweepFreq = 160 * Math.exp(-p * 18);
        raw = Math.sin(2 * Math.PI * sweepFreq * (i / sampleRate)) * Math.exp(-p * 8);
      } else if (sampleType === 'segaSnare') {
        const tone = Math.sin(2 * Math.PI * 180 * (i / sampleRate)) * 0.4;
        const noise = (Math.random() * 2 - 1) * 0.8;
        raw = (tone + noise) * Math.exp(-p * 12);
      } else if (sampleType === 'segaTom') {
        const sweepFreq = 220 * Math.exp(-p * 10);
        raw = Math.sin(2 * Math.PI * sweepFreq * (i / sampleRate)) * Math.exp(-p * 7);
      } else {
        // Cymbal
        raw = (Math.random() * 2 - 1) * Math.exp(-p * 8);
      }

      // Quantize to 8-bit (256 discrete levels) with slight DAC saturation
      const step8 = Math.floor((raw + 1.0) * 127.5);
      const clamped = Math.max(0, Math.min(255, step8));
      data[i] = ((clamped / 127.5) - 1.0) * 0.85;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.state.ch6DAC.volume, t);

    src.connect(gain);
    gain.connect(this.chipGain);

    src.start(t);
    this.triggerActivity('dac');
  }

  public playNote(freq: number | string, duration = 0.4, velocity = 0.85) {
    this.playFMVoice(freq, duration, velocity);
  }

  private triggerActivity(ch: 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'dac') {
    this.activities[ch] = 1.0;
    setTimeout(() => {
      this.activities[ch] = 0;
    }, 200);
  }

  public getChannelStates(): ChannelState[] {
    return [
      {
        id: 'fm_ch1',
        name: 'FM Voice 1-5 (4-Op)',
        type: 'fm',
        muted: false,
        solo: false,
        volume: 0.8,
        pan: 0,
        activityLevel: this.activities.ch1,
        params: { algorithm: `Alg ${this.state.algorithm}`, feedback: `FB ${this.state.feedback}` }
      },
      {
        id: 'op1',
        name: 'Operator 1 (Modulator + FB)',
        type: 'fm',
        muted: false,
        solo: false,
        volume: 1 - this.state.operators[0].tl,
        pan: 0,
        activityLevel: this.activities.ch1,
        params: { mul: `${this.state.operators[0].mul}x`, tl: `${Math.round(this.state.operators[0].tl * 100)}%` }
      },
      {
        id: 'op2',
        name: 'Operator 2',
        type: 'fm',
        muted: false,
        solo: false,
        volume: 1 - this.state.operators[1].tl,
        pan: 0,
        activityLevel: this.activities.ch1,
        params: { mul: `${this.state.operators[1].mul}x`, tl: `${Math.round(this.state.operators[1].tl * 100)}%` }
      },
      {
        id: 'op3',
        name: 'Operator 3',
        type: 'fm',
        muted: false,
        solo: false,
        volume: 1 - this.state.operators[2].tl,
        pan: 0,
        activityLevel: this.activities.ch1,
        params: { mul: `${this.state.operators[2].mul}x`, tl: `${Math.round(this.state.operators[2].tl * 100)}%` }
      },
      {
        id: 'op4',
        name: 'Operator 4 (Carrier)',
        type: 'fm',
        muted: false,
        solo: false,
        volume: 1 - this.state.operators[3].tl,
        pan: 0,
        activityLevel: this.activities.ch1,
        params: { mul: `${this.state.operators[3].mul}x`, tl: `${Math.round(this.state.operators[3].tl * 100)}%` }
      },
      {
        id: 'dac',
        name: 'Ch 6 (8-Bit DAC PCM)',
        type: 'sample',
        muted: this.state.ch6DAC.muted,
        solo: false,
        volume: this.state.ch6DAC.volume,
        pan: 0,
        activityLevel: this.activities.dac,
        params: { format: '8-bit signed PCM' }
      }
    ];
  }
}
