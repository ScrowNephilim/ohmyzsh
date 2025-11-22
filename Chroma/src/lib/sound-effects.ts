/**
 * Sound Effects Engine - Immersive audio feedback for Chroma
 * Uses Web Audio API for zero-credit sound generation
 */

export interface SoundEffect {
  type: 'ambient' | 'power' | 'environment' | 'transition' | 'nephilim';
  intensity: number; // 0-1
  duration?: number; // milliseconds
}

class SoundEffectsEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.3;

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Power activation sounds - subtle whoosh/energy
  playPowerActivation(powerName: string, intensity: number = 0.5) {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Create oscillator for energy build-up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Different frequencies for different powers
    const baseFreq = powerName.includes('Différance') ? 220 : 440;
    osc.frequency.setValueAtTime(baseFreq * 0.5, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.masterVolume * intensity * 0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Environment transition - gentle fade
  playEnvironmentTransition(transitionType: 'enter' | 'exit' | 'shift') {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    filter.type = 'lowpass';
    filter.frequency.value = 400;

    if (transitionType === 'enter') {
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.8);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (transitionType === 'exit') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
      gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.4);
      gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  // Nephilim appearance - subtle chime
  playNephilimAppearance(nephilimName: string) {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Different pitches for different Nephilims
    const frequencies = {
      'Ripl(a)y': [523.25, 659.25, 783.99], // C5, E5, G5 - thoughtful
      'Ana': [440, 554.37, 659.25], // A4, C#5, E5 - confident
    };

    const freq = frequencies[nephilimName as keyof typeof frequencies] || [440, 554.37, 659.25];

    // Play chord quickly
    freq.forEach((f, i) => {
      const oscChord = ctx.createOscillator();
      const gainChord = ctx.createGain();
      
      oscChord.connect(gainChord);
      gainChord.connect(ctx.destination);
      
      oscChord.frequency.value = f;
      gainChord.gain.setValueAtTime(0, now + i * 0.05);
      gainChord.gain.linearRampToValueAtTime(this.masterVolume * 0.15, now + i * 0.05 + 0.02);
      gainChord.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.4);
      
      oscChord.start(now + i * 0.05);
      oscChord.stop(now + i * 0.05 + 0.4);
    });
  }

  // Ambient background - very subtle texture
  playAmbientTexture(environmentType: 'street' | 'indoor' | 'club' | 'outdoor', duration: number = 3000) {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Create noise buffer for ambient texture
    const bufferSize = ctx.sampleRate * (duration / 1000);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate filtered noise based on environment
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Different filter settings per environment
    switch (environmentType) {
      case 'street':
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        break;
      case 'indoor':
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        break;
      case 'club':
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        break;
      case 'outdoor':
        filter.type = 'highpass';
        filter.frequency.value = 400;
        break;
    }

    gain.gain.setValueAtTime(this.masterVolume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    source.start(now);
    source.stop(now + duration / 1000);
  }

  // Message received - very subtle notification
  playMessageReceived() {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.masterVolume * 0.1, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Set master volume (0-1)
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Clean up resources
  dispose() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const soundEffects = new SoundEffectsEngine();
