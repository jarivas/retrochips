/**
 * RetroChips.js - Sound Chip Registry & Historical Hardware Specifications
 */

import { ChipId, ChipMetadata } from './types';

export const CHIP_REGISTRY: Record<ChipId, ChipMetadata> = {
  nes2a03: {
    id: 'nes2a03',
    name: 'Ricoh 2A03 APU',
    hardwareName: 'RP2A03 / RP2A07',
    manufacturer: 'Ricoh / Nintendo',
    year: 1983,
    generation: '3rd Gen (8-bit)',
    consoles: ['Nintendo Entertainment System (NES)', 'Famicom', 'Famicom Disk System'],
    architecture: 'PSG + Delta Modulation (APU)',
    channelsSummary: '2 Pulse (12.5/25/50/75% duty) + 1 Triangle (4-bit stepped) + 1 LFSR Noise + 1 DPCM',
    description: 'El corazón sonoro del NES. Famoso por sus dos canales de pulso con ciclos de trabajo variables, su bajo triangular zumbante sin atenuación y su generador de ruido metálico.',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
    accentHex: '#ef4444',
    notableGames: ['Super Mario Bros.', 'Mega Man 2', 'Castlevania', 'The Legend of Zelda', 'DuckTales'],
    specs: {
      channels: 5,
      sampleRateOrClock: '1.789773 MHz (NTSC) / 1.662607 MHz (PAL)',
      bitDepth: '4-bit DAC / 7-bit DPCM',
      dacType: 'Resistor ladder DAC',
      features: ['Hardware pitch sweep', '4 duty cycles', '15-bit & 9-bit LFSR noise', 'Delta PCM 1-bit']
    }
  },

  gameboy: {
    id: 'gameboy',
    name: 'Sharp LR35902 APU',
    hardwareName: 'DMG-CPU / LR35902 Sound Block',
    manufacturer: 'Sharp / Nintendo',
    year: 1989,
    generation: '4th Gen Handheld (8-bit)',
    consoles: ['Game Boy (DMG-01)', 'Game Boy Pocket', 'Super Game Boy'],
    architecture: 'Programmable Waveform PSG',
    channelsSummary: '2 Pulse + 1 Wave RAM (32×4-bit programable) + 1 Noise (7-bit / 15-bit)',
    description: 'El sonido portátil más influyente del mundo. Su canal Wave RAM permitía a compositores como Junichi Masuda y Koji Kondo programar flautas, sintetizadores y bajos cristalinos únicos.',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    accentHex: '#10b981',
    notableGames: ['Pokémon Red/Blue', 'The Legend of Zelda: Link’s Awakening', 'Tetris', 'Super Mario Land 2'],
    specs: {
      channels: 4,
      sampleRateOrClock: '4.194304 MHz master clock',
      bitDepth: '4-bit DAC stereo panning',
      dacType: 'PWM/Ladder stereo DAC',
      features: ['Wave RAM (32 samples 4-bit)', 'Hardware sweep en Ch1', 'Envelope decremental', 'Poly noise 7/15-bit']
    }
  },

  ym2612: {
    id: 'ym2612',
    name: 'Yamaha YM2612 (OPN2)',
    hardwareName: 'YM2612 / YM3438',
    manufacturer: 'Yamaha',
    year: 1988,
    generation: '4th Gen (16-bit)',
    consoles: ['Sega Genesis / Mega Drive', 'FM Towns', 'Sega Pico'],
    architecture: 'Síntesis FM (Frecuencia Modulada, 4 Operadores)',
    channelsSummary: '6 Canales FM estéreo (4 operadores por canal) + 8 Algoritmos + Ch6 Modo DAC 8-bit PCM',
    description: 'La leyenda de 16-bit de Sega. Maestro de bajos agresivos, metales brillantes y texturas de sintetizador gracias a la modulación de frecuencia y la retroalimentación en el operador 1.',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    accentHex: '#3b82f6',
    notableGames: ['Sonic the Hedgehog 2', 'Streets of Rage 2', 'Shinobi III', 'Earthworm Jim', 'Golden Axe'],
    specs: {
      channels: 6,
      sampleRateOrClock: '7.67 MHz (Genesis NTSC) / 53.26 kHz FM rate',
      bitDepth: '9-bit internal FM DAC (famoso Ladder effect)',
      dacType: 'Floating point DAC serial',
      features: ['8 algoritmos FM', 'Feedback en Op1 (0-7)', 'Ch6 convertible a 8-bit DAC', 'LFO de modulación']
    }
  },

  snes_sdsp: {
    id: 'snes_sdsp',
    name: 'Sony SPC700 / S-DSP',
    hardwareName: 'Sony SPC700 + S-DSP',
    manufacturer: 'Sony (diseñado por Ken Kutaragi)',
    year: 1990,
    generation: '4th Gen (16-bit)',
    consoles: ['Super Nintendo Entertainment System (SNES)', 'Super Famicom'],
    architecture: 'Sub-sistema DSP de Muestras ADPCM / BRR + Hardware Echo Reverb',
    channelsSummary: '8 Voces estéreo por muestras BRR + Filtro Gaussiano de 4 puntos + Buffer de Eco con filtro FIR de 8 tomas',
    description: 'La cumbre orquestal y cinematográfica de los 16-bit. Diseñado por Ken Kutaragi antes de crear PlayStation. Su reverberación por eco y filtro gaussiano crearon la atmósfera inolvidable de los RPGs.',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    accentHex: '#a855f7',
    notableGames: ['Donkey Kong Country', 'Chrono Trigger', 'Super Mario World', 'Final Fantasy VI', 'Super Metroid'],
    specs: {
      channels: 8,
      sampleRateOrClock: '32 kHz output rate, 64 KB audio RAM dedicada',
      bitDepth: '16-bit DSP interno / muestras comprimidas BRR 4-bit',
      dacType: 'Dual 16-bit stereo DAC (NEC µPD6376)',
      features: ['Filtro de interpolación gaussiana', 'Echo Reverb programable', 'Filtro FIR de 8 coeficientes', 'Modulación de tono (FM)']
    }
  },

  sid6581: {
    id: 'sid6581',
    name: 'MOS Technology 6581 SID',
    hardwareName: 'MOS 6581 / CSG 8580 SID',
    manufacturer: 'MOS Technology (Commodore)',
    year: 1982,
    generation: 'Computadoras 8-bit & Arcade',
    consoles: ['Commodore 64', 'Commodore 128', 'Elektor TV Games'],
    architecture: 'Sintetizador analógico híbrido sustractivo',
    channelsSummary: '3 Osciladores analógicos multimodo (Saw, Tri, Pulse con PWM, Noise) + Filtro analógico multimodo 12dB + Sync/RingMod',
    description: 'Diseñado por Bob Yannes (fundador de Ensoniq). Uno de los sintetizadores integrados más aclamados de la historia con filtro analógico conmutable y modulación por ancho de pulso (PWM).',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    accentHex: '#f59e0b',
    notableGames: ['Turrican II', 'Commando (Rob Hubbard)', 'The Last Ninja', 'Giana Sisters', 'Monty on the Run'],
    specs: {
      channels: 3,
      sampleRateOrClock: '0.985 MHz (PAL) / 1.023 MHz (NTSC)',
      bitDepth: 'Salida analógica continua (DAC no lineal)',
      dacType: 'Analógico sustractivo controlado por registros',
      features: ['Filtro multimodo State-Variable 12dB/oct (LP/BP/HP)', 'Hard Sync entre osciladores', 'Ring Modulation', 'PWM continuo']
    }
  },

  sn76489: {
    id: 'sn76489',
    name: 'Texas Instruments SN76489',
    hardwareName: 'SN76489 DCSG / NCR 7496',
    manufacturer: 'Texas Instruments',
    year: 1980,
    generation: '2nd / 3rd Gen (8-bit)',
    consoles: ['Sega Master System', 'Sega Game Gear', 'BBC Micro', 'ColecoVision', 'Sega Genesis (sub-chip PSG)'],
    architecture: 'Digital Complex Sound Generator (DCSG)',
    channelsSummary: '3 Canales de onda cuadrada (divisores de frecuencia de 10-bit) + 1 Canal de ruido blanco/periódico',
    description: 'El chip de sonido arcade definitivo de los primeros 80s y de la Master System. Sonido cortante, rápido y enérgico presente en clásicos como Alex Kidd y Wonder Boy.',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    accentHex: '#06b6d4',
    notableGames: ['Alex Kidd in Miracle World', 'Sonic the Hedgehog (SMS/GG)', 'Wonder Boy III', 'Space Harrier'],
    specs: {
      channels: 4,
      sampleRateOrClock: '3.579545 MHz (NTSC) / 4.0 MHz (PAL)',
      bitDepth: 'Atenuador de volumen de 4-bit (16 niveles)',
      dacType: 'Divisores de frecuencia digitales de 10-bit',
      features: ['3 generadores de tono cuadrados', 'Ruido periódico de 15 etapas', 'Ruido blanco pseudo-aleatorio', 'Sincronía de tono en Ch3']
    }
  },

  sonyspu: {
    id: 'sonyspu',
    name: 'Sony SPU (PlayStation 1)',
    hardwareName: 'Sony CXD2922Q / CXD2925Q SPU',
    manufacturer: 'Sony',
    year: 1994,
    generation: '5th Gen (32-bit)',
    consoles: ['Sony PlayStation 1 (PSX / PSOne)'],
    architecture: 'Procesador de sonido ADPCM con motor de reverberación por hardware',
    channelsSummary: '24 Voces ADPCM a 44.1 kHz estéreo + 9 Algoritmos de reverberación por hardware (Room, Hall, Space Echo)',
    description: 'El chip que marcó la transición a la era 32-bit a mediados de los 90. Permitía pistas con 24 voces simultáneas, envolventes lineales/exponenciales y el icónico eco oscuro de los survival horror.',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    accentHex: '#6366f1',
    notableGames: ['Resident Evil', 'Final Fantasy VII', 'Castlevania: Symphony of the Night', 'Metal Gear Solid', 'Silent Hill'],
    specs: {
      channels: 24,
      sampleRateOrClock: '44.1 kHz, 512 KB Sound RAM dedicada',
      bitDepth: '16-bit estéreo',
      dacType: '16-bit linear stereo DAC',
      features: ['24 voces independientes', 'Reverberación digital por hardware', 'Pitch modulation cruzada', 'Control de envolvente ADSR por voz']
    }
  }
};
