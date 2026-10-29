/**
 * RetroChips.js - Web Audio Engine Core & Utilities
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Analyser for real-time oscilloscope & spectrum
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.65;

      // Connect masterGain -> analyser -> destination
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Prepare recording destination
      if (this.ctx.createMediaStreamDestination) {
        this.mediaStreamDest = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.mediaStreamDest);
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getContext(): AudioContext {
    return this.init();
  }

  public getMasterGain(): GainNode {
    this.init();
    return this.masterGain!;
  }

  public getAnalyser(): AnalyserNode {
    this.init();
    return this.analyser!;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      const safe = Math.max(0, Math.min(1.2, val));
      this.masterGain.gain.setTargetAtTime(safe, this.ctx.currentTime, 0.02);
    }
  }

  public getMasterVolume(): number {
    return this.masterGain ? this.masterGain.gain.value : 0.7;
  }

  // Real-time oscilloscope data
  public getTimeDomainData(outputArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(outputArray as any);
    }
  }

  // Real-time frequency spectrum data
  public getFrequencyData(outputArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(outputArray as any);
    }
  }

  // Recording functionality
  public startRecording(): boolean {
    if (!this.mediaStreamDest || this.isRecording) return false;
    try {
      this.recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '';
      
      this.mediaRecorder = mimeType 
        ? new MediaRecorder(this.mediaStreamDest.stream, { mimeType })
        : new MediaRecorder(this.mediaStreamDest.stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.start(50);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Error starting audio recorder:', err);
      return false;
    }
  }

  public async stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isRecording) return null;
    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        // Convert to WAV buffer for true lossless 16-bit PCM retro audio
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.getContext().decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch {
          resolve(blob);
        }
      };
      this.mediaRecorder!.stop();
    });
  }

  public get recordingActive(): boolean {
    return this.isRecording;
  }
}

export const audioEngine = new AudioEngine();

// --- Musical Note Helpers ---
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function noteToMidi(noteStr: string): number {
  const match = noteStr.match(/^([A-G][#b]?)(-?\d+)$/i);
  if (!match) return 60; // C4 default
  let name = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);

  // Normalize flats to sharps
  const flatMap: Record<string, string> = {
    'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#'
  };
  if (flatMap[name]) name = flatMap[name];

  const noteIndex = NOTE_NAMES.indexOf(name);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteToFreq(noteStr: string): number {
  return midiToFreq(noteToMidi(noteStr));
}

export function freqToNote(freq: number): string {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = (midi % 12 + 12) % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

// Convert AudioBuffer to standard 16-bit PCM RIFF WAV format
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferLength = 44 + length;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write interleaved PCM audio samples
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channels[channel][i];
      // Clamp to -1 to +1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
