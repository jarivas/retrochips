/**
 * OscilloscopeCanvas.js - Real-time Phosphor CRT Audio Visualizer
 */

import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../lib/retrochips';
import { Activity, BarChart3, Waves } from 'lucide-react';

interface OscilloscopeCanvasProps {
  accentColor?: string;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({ accentColor = '#10b981' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'wave' | 'fft'>('wave');
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const timeData = new Uint8Array(2048);
    const freqData = new Uint8Array(1024);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      // Dark CRT phosphor background with slight trail fade
      ctx.fillStyle = 'rgba(10, 10, 12, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Horizontal grid
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Vertical grid
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Center reference line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (mode === 'wave') {
        audioEngine.getTimeDomainData(timeData);

        // Find zero-crossing for oscilloscope trigger stabilization
        let triggerIndex = 0;
        for (let i = 0; i < 512; i++) {
          if (timeData[i] < 128 && timeData[i + 1] >= 128) {
            triggerIndex = i;
            break;
          }
        }

        // Phosphor glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = accentColor;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();

        const sliceWidth = width / (1024);
        let x = 0;

        for (let i = 0; i < 1024; i++) {
          const sampleIndex = triggerIndex + i;
          const v = (sampleIndex < timeData.length ? timeData[sampleIndex] : 128) / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      } else {
        // FFT Frequency spectrum
        audioEngine.getFrequencyData(freqData);

        const barCount = 64;
        const barWidth = (width / barCount) - 1.5;

        ctx.shadowBlur = 4;
        ctx.shadowColor = accentColor;

        for (let i = 0; i < barCount; i++) {
          // Logarithmic/exponential index sampling for musical frequency distribution
          const index = Math.floor(Math.pow(i / barCount, 2) * (freqData.length / 2));
          const val = freqData[index] || 0;
          const barHeight = (val / 255) * (height - 12);

          const x = i * (barWidth + 1.5);
          const y = height - barHeight;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mode, accentColor]);

  return (
    <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-inner">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
            Hardware Oscilloscope CRT
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
          <button
            onClick={() => setMode('wave')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'wave'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Forma de Onda</span>
          </button>
          <button
            onClick={() => setMode('fft')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'fft'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Espectro FFT</span>
          </button>
        </div>
      </div>

      <div className="relative w-full h-36 bg-black rounded-lg overflow-hidden border border-neutral-900">
        <canvas
          ref={canvasRef}
          width={720}
          height={144}
          className="w-full h-full block"
        />

        {/* Phosphor glass overlay glare */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>
    </div>
  );
};
