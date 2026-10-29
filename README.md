# RetroChips.js 🕹️ 🔊

> **Biblioteca JavaScript y suite de sintetizadores Web Audio para emular chips de sonido de consolas y ordenadores clásicos hasta finales de los 90 (1977-1999).**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-emerald.svg)](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Audio%20Dependencies-Zero-purple.svg)]()

---

## 📖 Descripción

**RetroChips.js** es un motor de síntesis de audio y emulación matemática de los chips de sonido más icónicos de la era de 8-bit, 16-bit y 32-bit. Ejecutado 100% en el navegador utilizando la Web Audio API nativa sin necesidad de emuladores WASM pesados ni archivos ROM externos.

Ideal para:
- Desarrollo de videojuegos web (Phaser, Three.js, Canvas, Godot Web).
- Creación de música chiptune, sintetizadores virtuales y trackers.
- Efectos de sonido (SFX) retro con exportación directa a archivos `.wav` de 16 bits sin pérdida.
- Preservación y estudio interactivo de la historia de la síntesis sonora en videojuegos.

---

## 👾 Chips de Sonido Emulados

| Chip | Consola / Sistema | Año | Arquitectura & Características |
| :--- | :--- | :---: | :--- |
| **Yamaha YM2612 (OPN2)** | Sega Genesis / Mega Drive | 1988 | Síntesis FM de 4 operadores, 8 algoritmos, retroalimentación en Op1, DAC 8-bit PCM. |
| **Ricoh 2A03 APU** | Nintendo NES / Famicom | 1983 | 2 canales Pulso (ciclos de trabajo 12.5%, 25%, 50%, 75%), 1 Triangular escalonada (DAC 4-bit), 1 Ruido LFSR (15/9-bit), DPCM. |
| **Sharp LR35902 APU** | Game Boy (DMG-01) | 1989 | 2 Pulso con barrido hardware, 1 **Wave RAM** (32 muestras 4-bit programables), Ruido polinomial 7/15-bit. |
| **Sony SPC700 / S-DSP** | Super Nintendo (SNES) | 1990 | 8 voces de muestras BRR interpoladas con filtro gaussiano de 4 puntos y reverberación por hardware (**Echo Buffer + Filtro FIR 8 tomas**). |
| **MOS Technology 6581 SID**| Commodore 64 | 1982 | 3 voces (Saw, Tri, Pulse con modulación PWM por LFO, Ruido 23-bit) y filtro analógico multimodo 12dB (LP/BP/HP/Resonancia). |
| **TI SN76489 DCSG** | Sega Master System / Genesis PSG | 1980 | 3 canales de onda cuadrada pura (divisores de 10-bit), atenuador de 4-bit y generador de ruido blanco/periódico. |
| **Sony SPU** | Sony PlayStation 1 | 1994 | 24 voces ADPCM a 44.1 kHz con motor de reverberación por hardware (Room, Studio, Hall, Space Echo). |

---

## 🚀 Inicio Rápido en JavaScript / TypeScript

### 1. Inicialización básica

```typescript
import { NES2A03, YM2612, SNES_SDSP, SID6581 } from './lib/retrochips';

// --- NES 2A03 ---
const nes = new NES2A03();
// Configurar ciclo de trabajo al 50%
nes.state.p1.duty = 0.5;
nes.playPulse1('C4', 0.4); // Toca Do4 durante 0.4 segundos
nes.playTriangle('C3', 0.5); // Bajo triangular zumbante

// --- Sega Genesis FM (YM2612) ---
const genesis = new YM2612();
genesis.setAlgorithm(4); // Algoritmo 4 clásico de Sonic Slap Bass
genesis.setFeedback(6);  // Gritty feedback
genesis.playFMVoice('A2', 0.35);
genesis.playDACSample('segaKick'); // Disparo de bombo DAC 8-bit

// --- Super Nintendo S-DSP ---
const snes = new SNES_SDSP();
snes.setEcho(true, 0.18, 0.45, 0.4); // Activa el eco SNES (180ms delay, 45% feedback)
snes.setInstrument('strings');       // Cuerdas con filtro gaussiano
snes.playVoice('E4', 0.8);
```

---

## 🎛️ Características de la Aplicación Web

- **Osciloscopio CRT de fósforo a 60 FPS**: Modo forma de onda con estabilización por cruce por cero y analizador FFT de espectro en tiempo real.
- **Teclado Musical & Arpegiador**: Mapeado al teclado de la computadora (`A-S-D-F-G-H-J-K`), soporte táctil, cambio de octava y arpegiador clásico a 60Hz.
- **Secuenciador Tracker**: Reproducción multicanal sincronizada de temas clásicos como *Green Hill FM*, *Castlevania Dungeon*, *Aquatic Forest Reverb* o *Pallet Town*.
- **Generador de SFX**: Crea sonidos de *Salto*, *Láser*, *Moneda*, *Explosión*, *Power-up*, *Golpe*, *Fanfarria* y *Game Over* con exportación instantánea a `.wav`.
- **Grabador de Audio WAV**: Guarda cualquier ejecución sonora en archivos `.wav` PCM de 16 bits sin pérdida.

---

## 🛠️ Instalación y Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/retrochips.git

# Entrar al directorio
cd retrochips

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.
