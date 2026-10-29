/**
 * RetroChips.js - Classic Console Sound Chip Synthesizer Library
 * 
 * Main entry point for the JavaScript audio library.
 */

export * from './types';
export * from './audioContext';
export * from './chips/nes2a03';
export * from './chips/gameboy';
export * from './chips/ym2612';
export * from './chips/snes_sdsp';
export * from './chips/sid6581';
export * from './chips/sn76489';
export * from './chips/sonyspu';
export * from './registry';
export * from './presets';
export * from './trackerDemo';
export * from './sfxGenerator';

import { ChipId } from './types';

/**
 * Helper to generate ready-to-run JavaScript / TypeScript code for any chip
 */
export function generateLibrarySnippet(chipId: ChipId, note = 'C4', options?: any): string {
  switch (chipId) {
    case 'nes2a03':
      return `// Emulación Ricoh 2A03 (NES / Famicom)
import { NES2A03 } from 'retrochips';

// 1. Instanciar el chip de sonido
const nes = new NES2A03();

// 2. Configurar registros del canal Pulso 1 (ciclo de trabajo 50%)
nes.state.p1.duty = 0.5; // 0.125, 0.25, 0.5, 0.75
nes.state.p1.volume = 0.8;

// 3. Tocar nota (nota o Hz, duración en s, velocidad 0-1)
nes.playPulse1('${note}', 0.35, 0.85);

// 4. Tocar bajo triangular escalonado de 4-bit (16 pasos DAC)
nes.playTriangle('C3', 0.5);

// 5. Tocar golpe de percusión con el generador de ruido LFSR (15-bit o 9-bit metálico)
nes.playNoise(8, false, 0.15);`;

    case 'ym2612':
      return `// Emulación Yamaha YM2612 OPN2 (Sega Genesis / Mega Drive)
import { YM2612 } from 'retrochips';

const genesis = new YM2612();

// Configurar algoritmo FM (0 a 7) y retroalimentación en Op1 (0 a 7)
genesis.setAlgorithm(4); // Algoritmo 4 (2x2 FM clásico de bajos y metales)
genesis.setFeedback(6);  // Gritty Sega Genesis feedback

// Configurar operadores FM (MUL, Total Level, AR, DR, SL, RR)
genesis.state.operators[0].mul = 1.0;
genesis.state.operators[1].mul = 2.0;

// Reproducir acorde o voz sintetizada FM
genesis.playFMVoice('${note}', 0.5, 0.9);

// Disparar muestra DAC de 8 bits en canal 6 (Sega Kick / Snare)
genesis.playDACSample('segaKick');`;

    case 'gameboy':
      return `// Emulación Sharp LR35902 APU (Game Boy DMG-01)
import { GameBoyAPU } from 'retrochips';

const gb = new GameBoyAPU();

// Canal 1: Pulso con barrido de frecuencia hardware
gb.state.ch1.sweepTime = 0.04;
gb.state.ch1.sweepShift = 2;
gb.playCh1('${note}', 0.35);

// Canal 3: Wave RAM (32 muestras de 4 bits programables para flautas/bajos)
gb.state.ch3.wavePattern = 'zeldaFlute';
gb.playCh3('${note}', 0.5);

// Canal 4: Ruido polinomial (LFSR de 7 o 15 bits para hi-hats/cajas)
gb.playCh4(0.12, true); // true = modo 7-bit metálico`;

    case 'snes_sdsp':
      return `// Emulación Sony SPC700 / S-DSP (Super Nintendo / SNES)
import { SNES_SDSP } from 'retrochips';

const snes = new SNES_SDSP();

// Activar reverberación por hardware (Buffer de eco + Filtro FIR de 8 tomas)
snes.setEcho(true, 0.18, 0.45, 0.4); // delay 180ms, 45% feedback, 40% wet

// Seleccionar instrumento de muestra interpolado con filtro Gaussiano
snes.setInstrument('strings'); // 'strings' | 'brass' | 'slapBass' | 'flute'
snes.playVoice('${note}', 0.8, 0.9);`;

    case 'sid6581':
      return `// Emulación MOS Technology 6581 SID (Commodore 64)
import { SID6581 } from 'retrochips';

const sid = new SID6581();

// Configurar oscilador con modulación por ancho de pulso (PWM)
sid.state.waveform = 'pulse'; // 'sawtooth' | 'triangle' | 'pulse' | 'noise'
sid.state.pulseWidth = 0.5;
sid.state.pwmSpeed = 2.5; // LFO de 2.5 Hz modulando el pulso

// Activar el filtro analógico multimodo de 12dB (Low-pass con resonancia Q)
sid.setFilter('lowpass', 2400, 6.0);
sid.playVoice('${note}', 0.6);`;

    case 'sn76489':
      return `// Emulación Texas Instruments SN76489 (Sega Master System / Genesis PSG)
import { SN76489 } from 'retrochips';

const psg = new SN76489();

// Canales de onda cuadrada pura con divisor de 10-bit y atenuación de 4-bit
psg.playTone(0, '${note}', 0.3);

// Canal de ruido periódico o ruido blanco
psg.playNoise(false, 0.2); // false = ruido blanco, true = tono periódico`;

    case 'sonyspu':
      return `// Emulación Sony SPU (PlayStation 1, 1994)
import { SonySPU } from 'retrochips';

const spu = new SonySPU();

// Configurar algoritmo de reverberación por hardware (Room, Studio, Hall, Space Echo)
spu.setReverbMode('hall');
spu.state.presetTone = 'crystalChime';
spu.playVoice('${note}', 0.8, 0.85);`;

    default:
      return `import { NES2A03 } from 'retrochips';\nconst synth = new NES2A03();\nsynth.playNote('C4');`;
  }
}
