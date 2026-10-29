/**
 * ChannelRegistersPanel.tsx - Interactive Hardware Register & Channel Workbench
 */

import React from 'react';
import { ChipId, ChannelState } from '../lib/retrochips';
import { NES2A03 } from '../lib/retrochips/chips/nes2a03';
import { GameBoyAPU } from '../lib/retrochips/chips/gameboy';
import { YM2612 } from '../lib/retrochips/chips/ym2612';
import { SNES_SDSP } from '../lib/retrochips/chips/snes_sdsp';
import { SID6581 } from '../lib/retrochips/chips/sid6581';
import { Sliders, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

interface ChannelRegistersPanelProps {
  chipId: ChipId;
  nesInstance: NES2A03;
  gbInstance: GameBoyAPU;
  ymInstance: YM2612;
  snesInstance: SNES_SDSP;
  sidInstance: SID6581;
  channelStates: ChannelState[];
  onParamChange: () => void;
  accentColor?: string;
}

export const ChannelRegistersPanel: React.FC<ChannelRegistersPanelProps> = ({
  chipId,
  nesInstance,
  gbInstance,
  ymInstance,
  snesInstance,
  sidInstance,
  channelStates,
  onParamChange,
  accentColor = '#f59e0b'
}) => {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider font-mono">
            Registros Hardware & Control de Canales
          </h3>
        </div>
        <span className="text-xs text-neutral-500 font-mono">
          Emulación precisa a nivel de oscilador
        </span>
      </div>

      {/* --- Specific Chip Control Modules --- */}

      {/* 1. SEGA GENESIS YM2612 FM CONTROLS */}
      {chipId === 'ym2612' && (
        <div className="space-y-4">
          {/* Algorithm & Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Algoritmo FM (0-7)
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Algoritmo {ymInstance.state.algorithm}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((alg) => (
                  <button
                    key={alg}
                    onClick={() => {
                      ymInstance.setAlgorithm(alg);
                      onParamChange();
                    }}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-all ${
                      ymInstance.state.algorithm === alg
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {alg}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5">
                {ymInstance.state.algorithm === 4 && 'Alg 4: (Op1→Op2) + (Op3→Op4) — El icónico bajo funk de Sonic y Streets of Rage.'}
                {ymInstance.state.algorithm === 7 && 'Alg 7: 4 Operadores en paralelo — Órganos y campanas aditivas.'}
                {ymInstance.state.algorithm === 0 && 'Alg 0: Cascada en serie Op1→Op2→Op3→Op4 — Máxima distorsión y armónicos.'}
                {![0, 4, 7].includes(ymInstance.state.algorithm) && `Algoritmo ${ymInstance.state.algorithm} de enrutamiento FM de 4 operadores.`}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Retroalimentación Op1 (Feedback 0-7)
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Nivel {ymInstance.state.feedback}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={ymInstance.state.feedback}
                onChange={(e) => {
                  ymInstance.setFeedback(parseInt(e.target.value, 10));
                  onParamChange();
                }}
                className="w-full h-2 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>0 (Sin FB)</span>
                <span>3 (Cálido)</span>
                <span>7 (Agresivo Genesis)</span>
              </div>
            </div>
          </div>

          {/* 4 Operators Workbench */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ymInstance.state.operators.map((op, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-neutral-200">
                    Operador {idx + 1} {idx === 0 ? '(Mod + FB)' : idx === 3 ? '(Carrier)' : ''}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    MUL: {op.mul}x
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Multiplicador (MUL)</span>
                      <span className="font-mono text-amber-400">{op.mul}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15"
                      step="0.5"
                      value={op.mul}
                      onChange={(e) => {
                        op.mul = parseFloat(e.target.value);
                        onParamChange();
                      }}
                      className="w-full h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Atenuación (TL)</span>
                      <span className="font-mono text-amber-400">{Math.round(op.tl * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={op.tl}
                      onChange={(e) => {
                        op.tl = parseFloat(e.target.value);
                        onParamChange();
                      }}
                      className="w-full h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Ataque (AR)</span>
                      <span className="font-mono">{Math.round(op.ar * 1000)}ms</span>
                    </div>
                    <input
                      type="range"
                      min="0.002"
                      max="0.5"
                      step="0.01"
                      value={op.ar}
                      onChange={(e) => {
                        op.ar = parseFloat(e.target.value);
                        onParamChange();
                      }}
                      className="w-full h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NES RICOH 2A03 CONTROLS */}
      {chipId === 'nes2a03' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pulse 1 Controls */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-neutral-200">
              Pulso 1 (Ciclo de Trabajo)
            </h4>
            <div className="grid grid-cols-4 gap-1">
              {[0.125, 0.25, 0.5, 0.75].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    nesInstance.state.p1.duty = d;
                    onParamChange();
                  }}
                  className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                    nesInstance.state.p1.duty === d
                      ? 'bg-red-500 text-white border-red-400 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {d * 100}%
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span>Hardware Pitch Sweep</span>
                <span className="font-mono text-red-400">{nesInstance.state.p1.sweep} semitonos</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={nesInstance.state.p1.sweep}
                onChange={(e) => {
                  nesInstance.state.p1.sweep = parseInt(e.target.value, 10);
                  onParamChange();
                }}
                className="w-full h-1.5 bg-neutral-800 accent-red-400 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Pulse 2 Controls */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-neutral-200">
              Pulso 2 (Ciclo de Trabajo)
            </h4>
            <div className="grid grid-cols-4 gap-1">
              {[0.125, 0.25, 0.5, 0.75].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    nesInstance.state.p2.duty = d;
                    onParamChange();
                  }}
                  className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                    nesInstance.state.p2.duty === d
                      ? 'bg-red-500 text-white border-red-400 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {d * 100}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 pt-2">
              El canal Pulso 2 proporciona contrapuntos y armonías junto a Pulso 1.
            </p>
          </div>

          {/* Noise LFSR Controls */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-neutral-200">
              Canal de Ruido (LFSR)
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  nesInstance.state.noise.mode = '15bit';
                  onParamChange();
                }}
                className={`flex-1 py-1 text-xs font-medium rounded border ${
                  nesInstance.state.noise.mode === '15bit'
                    ? 'bg-red-500 text-white border-red-400 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                15-bit (Blanco)
              </button>
              <button
                onClick={() => {
                  nesInstance.state.noise.mode = '9bit';
                  onParamChange();
                }}
                className={`flex-1 py-1 text-xs font-medium rounded border ${
                  nesInstance.state.noise.mode === '9bit'
                    ? 'bg-red-500 text-white border-red-400 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                9-bit (Metálico)
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              Modo 9-bit activa el bucle corto metálico característico para sonidos de chispas o explosiones.
            </p>
          </div>
        </div>
      )}

      {/* 3. GAME BOY SHARP LR35902 CONTROLS */}
      {chipId === 'gameboy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Wave RAM */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-emerald-400">
              Canal 3: Wave RAM (32 Muestras 4-bit)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(GameBoyAPU.WAVE_PATTERNS).map((patternKey) => (
                <button
                  key={patternKey}
                  onClick={() => {
                    gbInstance.state.ch3.wavePattern = patternKey;
                    onParamChange();
                  }}
                  className={`py-1.5 px-2 text-xs font-mono text-left rounded border transition-colors ${
                    gbInstance.state.ch3.wavePattern === patternKey
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {patternKey === 'zeldaFlute' && 'Flauta Zelda'}
                  {patternKey === 'dmgBass' && 'Bajo DMG 4-bit'}
                  {patternKey === 'mellowSine' && 'Seno Suave'}
                  {patternKey === 'steppedSaw' && 'Sierra Escalonada'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              La Wave RAM es el arma secreta de la Game Boy para sintetizar formas de onda arbitrarias.
            </p>
          </div>

          {/* Sweep & Noise */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-emerald-400">
              Canal 1 Hardware Sweep & Ch 4 Noise
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Dirección de Barrido Ch1:</span>
                <button
                  onClick={() => {
                    gbInstance.state.ch1.sweepDir = gbInstance.state.ch1.sweepDir === 'up' ? 'down' : 'up';
                    onParamChange();
                  }}
                  className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-emerald-400 text-xs rounded uppercase font-mono"
                >
                  {gbInstance.state.ch1.sweepDir}
                </button>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Modo de Ruido Ch4:</span>
                <button
                  onClick={() => {
                    gbInstance.state.ch4.mode = gbInstance.state.ch4.mode === '15bit' ? '7bit' : '15bit';
                    onParamChange();
                  }}
                  className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-emerald-400 text-xs rounded uppercase font-mono"
                >
                  {gbInstance.state.ch4.mode}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUPER NINTENDO SPC700 / S-DSP CONTROLS */}
      {chipId === 'snes_sdsp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instrument Sample Selector */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-purple-400">
              Instrumento de Muestra (Interpolación Gaussiana)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'strings', label: 'Cuerdas Etéreas' },
                { id: 'brass', label: 'Metales RPG' },
                { id: 'slapBass', label: 'Bajo Funk Slap' },
                { id: 'flute', label: 'Flauta Mana' },
                { id: 'choir', label: 'Coro Espacial' },
              ].map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    snesInstance.setInstrument(inst.id);
                    onParamChange();
                  }}
                  className={`py-1.5 px-2 text-xs text-left rounded border transition-colors ${
                    snesInstance.state.selectedInstrument === inst.id
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              El S-DSP procesa todas las muestras a través de su circuito analógico de interpolación gaussiana de 4 puntos.
            </p>
          </div>

          {/* Hardware Echo Reverb & FIR Filter */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold font-mono text-purple-400">
                SNES Hardware Echo Reverb & Filtro FIR
              </h4>
              <button
                onClick={() => {
                  snesInstance.setEcho(
                    !snesInstance.state.echo.enabled,
                    snesInstance.state.echo.delayTime,
                    snesInstance.state.echo.feedback,
                    snesInstance.state.echo.wetLevel
                  );
                  onParamChange();
                }}
                className={`px-2 py-0.5 text-xs font-mono rounded ${
                  snesInstance.state.echo.enabled
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {snesInstance.state.echo.enabled ? 'ECO ACTIVO' : 'ECO APAGADO'}
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-0.5">
                  <span>Tiempo de Retardo (Delay Time)</span>
                  <span className="font-mono text-purple-300">{Math.round(snesInstance.state.echo.delayTime * 1000)}ms</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.4"
                  step="0.01"
                  value={snesInstance.state.echo.delayTime}
                  onChange={(e) => {
                    snesInstance.setEcho(
                      snesInstance.state.echo.enabled,
                      parseFloat(e.target.value),
                      snesInstance.state.echo.feedback,
                      snesInstance.state.echo.wetLevel
                    );
                    onParamChange();
                  }}
                  className="w-full h-1.5 bg-neutral-800 accent-purple-400 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-0.5">
                  <span>Realimentación de Eco (Feedback)</span>
                  <span className="font-mono text-purple-300">{Math.round(snesInstance.state.echo.feedback * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.85"
                  step="0.05"
                  value={snesInstance.state.echo.feedback}
                  onChange={(e) => {
                    snesInstance.setEcho(
                      snesInstance.state.echo.enabled,
                      snesInstance.state.echo.delayTime,
                      parseFloat(e.target.value),
                      snesInstance.state.echo.wetLevel
                    );
                    onParamChange();
                  }}
                  className="w-full h-1.5 bg-neutral-800 accent-purple-400 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMMODORE 64 SID 6581 CONTROLS */}
      {chipId === 'sid6581' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Waveforms & PWM */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400">
              Forma de Onda SID & Modulación de Pulso (PWM)
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {(['sawtooth', 'triangle', 'pulse', 'noise'] as const).map((wf) => (
                <button
                  key={wf}
                  onClick={() => {
                    sidInstance.state.waveform = wf;
                    onParamChange();
                  }}
                  className={`py-1 text-xs font-mono rounded border capitalize transition-colors ${
                    sidInstance.state.waveform === wf
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {wf}
                </button>
              ))}
            </div>

            {sidInstance.state.waveform === 'pulse' && (
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <div className="flex justify-between text-[11px] text-neutral-400 mb-0.5">
                  <span>Velocidad PWM (LFO)</span>
                  <span className="font-mono text-amber-400">{sidInstance.state.pwmSpeed} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="10"
                  step="0.2"
                  value={sidInstance.state.pwmSpeed}
                  onChange={(e) => {
                    sidInstance.state.pwmSpeed = parseFloat(e.target.value);
                    onParamChange();
                  }}
                  className="w-full h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* SID Multi-mode Filter */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400">
              Filtro Analógico Multimodo 12dB (State-Variable)
            </h4>
            <div className="flex gap-2">
              {(['lowpass', 'bandpass', 'highpass'] as const).map((fMode) => (
                <button
                  key={fMode}
                  onClick={() => {
                    sidInstance.setFilter(fMode, sidInstance.state.filter.cutoff, sidInstance.state.filter.resonance);
                    onParamChange();
                  }}
                  className={`flex-1 py-1 text-xs font-mono rounded border uppercase ${
                    sidInstance.state.filter.mode === fMode
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {fMode}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-0.5">
                  <span>Frecuencia de Corte (Cutoff)</span>
                  <span className="font-mono text-amber-400">{sidInstance.state.filter.cutoff} Hz</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="8000"
                  step="50"
                  value={sidInstance.state.filter.cutoff}
                  onChange={(e) => {
                    sidInstance.setFilter(sidInstance.state.filter.mode, parseFloat(e.target.value), sidInstance.state.filter.resonance);
                    onParamChange();
                  }}
                  className="w-full h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-0.5">
                  <span>Resonancia (Q)</span>
                  <span className="font-mono text-amber-400">{sidInstance.state.filter.resonance}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={sidInstance.state.filter.resonance}
                  onChange={(e) => {
                    sidInstance.setFilter(sidInstance.state.filter.mode, sidInstance.state.filter.cutoff, parseFloat(e.target.value));
                    onParamChange();
                  }}
                  className="w-full h-1.5 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Meters & Status Bar */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80">
        <h4 className="text-xs font-semibold text-neutral-400 mb-2 font-mono uppercase tracking-wider">
          Canales Activos & Indicadores VU
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {channelStates.map((ch) => (
            <div
              key={ch.id}
              className="p-2 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center justify-between"
            >
              <div className="truncate pr-2">
                <p className="text-xs font-mono font-medium text-neutral-300 truncate">
                  {ch.name}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  {Object.entries(ch.params).map(([k, v]) => `${k}:${v}`).join(' ')}
                </p>
              </div>

              {/* Dynamic VU Meter */}
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-100 ${
                    (ch.activityLevel || 0) > 0.1
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110'
                      : 'bg-neutral-800'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
