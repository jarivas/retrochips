/**
 * RetroChips.js - Curated Vintage Presets Bank
 */

import { RetroPreset } from './types';

export const RETRO_PRESETS: RetroPreset[] = [
  // --- Sega Genesis / Mega Drive (YM2612) ---
  {
    id: 'ym_slap_bass',
    name: 'Sega Slap Bass',
    chipId: 'ym2612',
    category: 'Bass',
    description: 'El clásico bajo metálico y percusivo de Sonic the Hedgehog y Streets of Rage 2.',
    inspiredBy: 'Sonic The Hedgehog & Streets of Rage',
    settings: {
      algorithm: 4,
      feedback: 6,
      operators: [
        { mul: 1.0, tl: 0.15, ar: 0.005, dr: 0.18, sl: 0.2, rr: 0.15, detune: 0 },
        { mul: 2.0, tl: 0.25, ar: 0.01, dr: 0.22, sl: 0.3, rr: 0.1, detune: 2 },
        { mul: 1.0, tl: 0.2, ar: 0.005, dr: 0.15, sl: 0.4, rr: 0.15, detune: -2 },
        { mul: 1.0, tl: 0.0, ar: 0.005, dr: 0.35, sl: 0.5, rr: 0.2, detune: 0 },
      ]
    }
  },
  {
    id: 'ym_heavy_lead',
    name: 'Mega Drive Power Lead',
    chipId: 'ym2612',
    category: 'Lead',
    description: 'Sintetizador solista penetrante con alto feedback y cascada FM.',
    inspiredBy: 'Shinobi III / Thunder Force IV',
    settings: {
      algorithm: 2,
      feedback: 7,
      operators: [
        { mul: 2.0, tl: 0.1, ar: 0.01, dr: 0.3, sl: 0.7, rr: 0.25, detune: 4 },
        { mul: 1.0, tl: 0.15, ar: 0.01, dr: 0.25, sl: 0.6, rr: 0.2, detune: 0 },
        { mul: 3.0, tl: 0.2, ar: 0.02, dr: 0.3, sl: 0.5, rr: 0.25, detune: -3 },
        { mul: 1.0, tl: 0.0, ar: 0.01, dr: 0.4, sl: 0.8, rr: 0.3, detune: 0 },
      ]
    }
  },
  {
    id: 'ym_fm_bell',
    name: 'Streets of Rage FM Bell',
    chipId: 'ym2612',
    category: 'Keys',
    description: 'Campana digital cristalina generada mediante 4 operadores aditivos (Algoritmo 7).',
    inspiredBy: 'Yuzo Koshiro - Streets of Rage',
    settings: {
      algorithm: 7,
      feedback: 2,
      operators: [
        { mul: 1.0, tl: 0.0, ar: 0.005, dr: 0.6, sl: 0.1, rr: 0.4, detune: 0 },
        { mul: 3.5, tl: 0.15, ar: 0.005, dr: 0.4, sl: 0.05, rr: 0.3, detune: 3 },
        { mul: 5.0, tl: 0.3, ar: 0.005, dr: 0.3, sl: 0.0, rr: 0.2, detune: -2 },
        { mul: 7.0, tl: 0.45, ar: 0.005, dr: 0.2, sl: 0.0, rr: 0.15, detune: 5 },
      ]
    }
  },

  // --- NES (Ricoh 2A03) ---
  {
    id: 'nes_mario_pulse',
    name: 'Overworld 50% Pulse',
    chipId: 'nes2a03',
    category: 'Lead',
    description: 'Onda cuadrada pura al 50% de ciclo de trabajo con decaimiento rápido.',
    inspiredBy: 'Super Mario Bros. - Koji Kondo',
    settings: {
      channel: 'p1',
      duty: 0.5,
      volume: 0.85,
      sweep: 0
    }
  },
  {
    id: 'nes_megaman_lead',
    name: 'Mega Buster 25% Pulse',
    chipId: 'nes2a03',
    category: 'Lead',
    description: 'Pulso brillante y cortante al 25% de ancho de pulso, estándar de Capcom en los 80.',
    inspiredBy: 'Mega Man 2 - Takashi Tateishi',
    settings: {
      channel: 'p1',
      duty: 0.25,
      volume: 0.85,
      sweep: 0
    }
  },
  {
    id: 'nes_tri_bass',
    name: 'Castlevania 4-bit Triangle Bass',
    chipId: 'nes2a03',
    category: 'Bass',
    description: 'Onda triangular escalonada de 16 niveles del 2A03 sin atenuación de volumen.',
    inspiredBy: 'Castlevania - Kinuyo Yamashita',
    settings: {
      channel: 'tri',
      volume: 0.9
    }
  },
  {
    id: 'nes_metallic_noise',
    name: '9-bit Metallic LFSR Hit',
    chipId: 'nes2a03',
    category: 'Percussion',
    description: 'Modo de bucle corto de 9 bits del registro de desplazamiento de ruido NES.',
    inspiredBy: 'DuckTales / Ninja Gaiden',
    settings: {
      channel: 'noise',
      mode: '9bit',
      period: 5
    }
  },

  // --- Game Boy (Sharp LR35902) ---
  {
    id: 'gb_zelda_flute',
    name: 'Link’s Awakening Wave Flute',
    chipId: 'gameboy',
    category: 'Lead',
    description: 'Canal 3 Wave RAM con la tabla de ondas sintetizada suave de 32 nibbles.',
    inspiredBy: 'Zelda Link’s Awakening - Minako Hamano',
    settings: {
      channel: 'ch3',
      wavePattern: 'zeldaFlute',
      volume: 0.85
    }
  },
  {
    id: 'gb_pokemon_lead',
    name: 'Pokemon Battle 50% Sweep',
    chipId: 'gameboy',
    category: 'Lead',
    description: 'Canal 1 con barrido inicial de frecuencia para ataques y fanfarrias de batalla.',
    inspiredBy: 'Pokémon Red / Blue - Junichi Masuda',
    settings: {
      channel: 'ch1',
      duty: 0.5,
      sweepTime: 0.04,
      sweepShift: 2,
      sweepDir: 'down'
    }
  },
  {
    id: 'gb_dmg_bass',
    name: 'DMG Lo-Fi Bass RAM',
    chipId: 'gameboy',
    category: 'Bass',
    description: 'Bajo analógico-digital programado en la memoria RAM de onda de la Game Boy clásica.',
    inspiredBy: 'Super Mario Land - Hirokazu Tanaka',
    settings: {
      channel: 'ch3',
      wavePattern: 'dmgBass',
      volume: 0.9
    }
  },

  // --- Super Nintendo (SPC700 / S-DSP) ---
  {
    id: 'snes_cavern_pad',
    name: 'DKC Aquatic Cavern Echo',
    chipId: 'snes_sdsp',
    category: 'Pad',
    description: 'Cuerdas etéreas procesadas por el buffer de eco de 180ms y filtro FIR de 8 tomas.',
    inspiredBy: 'Donkey Kong Country - David Wise (Aquatic Ambiance)',
    settings: {
      selectedInstrument: 'strings',
      echo: { enabled: true, delayTime: 0.22, feedback: 0.55, wetLevel: 0.45, firFilterFreq: 2600 },
      adsr: { attack: 0.08, decay: 0.3, sustain: 0.8, release: 0.4 }
    }
  },
  {
    id: 'snes_fanfare_brass',
    name: '16-bit RPG Brass',
    chipId: 'snes_sdsp',
    category: 'Lead',
    description: 'Metales de muestra orquestal con filtrado gaussiano de 4 puntos.',
    inspiredBy: 'Chrono Trigger & Final Fantasy VI',
    settings: {
      selectedInstrument: 'brass',
      echo: { enabled: true, delayTime: 0.12, feedback: 0.3, wetLevel: 0.25, firFilterFreq: 3200 },
      adsr: { attack: 0.02, decay: 0.15, sustain: 0.7, release: 0.25 }
    }
  },
  {
    id: 'snes_funk_slap',
    name: 'Super Slap Bass',
    chipId: 'snes_sdsp',
    category: 'Bass',
    description: 'Muestra de bajo percusivo con transitorio de pellizco y compresión BRR.',
    inspiredBy: 'Super Mario World - Koji Kondo',
    settings: {
      selectedInstrument: 'slapBass',
      echo: { enabled: false, delayTime: 0.1, feedback: 0.1, wetLevel: 0.0, firFilterFreq: 3000 },
      adsr: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.15 }
    }
  },

  // --- Commodore 64 (MOS 6581 SID) ---
  {
    id: 'sid_hubbard_arp',
    name: 'Rob Hubbard Arp Lead',
    chipId: 'sid6581',
    category: 'Arp',
    description: 'Diente de sierra filtrado con resonancia media y respuesta analógica rápida.',
    inspiredBy: 'Commando & Sanxion - Rob Hubbard',
    settings: {
      waveform: 'sawtooth',
      filter: { enabled: true, mode: 'lowpass', cutoff: 2800, resonance: 6.0 }
    }
  },
  {
    id: 'sid_pwm_pad',
    name: 'Turrican PWM Sweeper',
    chipId: 'sid6581',
    category: 'Pad',
    description: 'Onda de pulso con modulación de ancho (PWM) por LFO a 2.5 Hz y filtro pasobanda.',
    inspiredBy: 'Turrican II - Chris Hülsbeck',
    settings: {
      waveform: 'pulse',
      pulseWidth: 0.5,
      pwmSpeed: 2.5,
      pwmDepth: 0.4,
      filter: { enabled: true, mode: 'bandpass', cutoff: 1800, resonance: 4.5 }
    }
  },

  // --- Texas Instruments SN76489 (Sega Master System) ---
  {
    id: 'sms_alex_lead',
    name: 'Alex Kidd 10-bit Square',
    chipId: 'sn76489',
    category: 'Lead',
    description: 'Onda cuadrada cortante y limpia con atenuación escalonada de 4 bits.',
    inspiredBy: 'Alex Kidd in Miracle World',
    settings: {
      channel: 0,
      volume: 0.85
    }
  },

  // --- Sony SPU (PlayStation 1) ---
  {
    id: 'ps1_save_room',
    name: 'Resident Evil Save Room',
    chipId: 'sonyspu',
    category: 'Keys',
    description: 'Órgano atmosférico de muestra 44.1 kHz con reverberación Hall del SPU.',
    inspiredBy: 'Resident Evil (Save Room Theme) - Takashi Niigaki',
    settings: {
      presetTone: 'saveRoomOrgan',
      reverbMode: 'hall',
      reverbWet: 0.5
    }
  },
  {
    id: 'ps1_crystal_pad',
    name: 'Final Fantasy VII Prelude',
    chipId: 'sonyspu',
    category: 'Arp',
    description: 'Campana y arpegio de cristal con eco espacial característico de la PS1.',
    inspiredBy: 'Final Fantasy VII - Nobuo Uematsu',
    settings: {
      presetTone: 'crystalChime',
      reverbMode: 'spaceEcho',
      reverbWet: 0.45
    }
  }
];
