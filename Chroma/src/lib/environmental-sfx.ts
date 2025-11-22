/**
 * Environmental Sound Effects - Automatic nature/weather sounds
 * Procedural audio generation for rain, birds, wind, etc.
 * Zero credit cost, Web Audio API only
 */

export type WeatherEffect = 'rain' | 'storm' | 'wind' | 'fog' | 'snow' | 'clear';
export type TimeEffect = 'dawn' | 'day' | 'dusk' | 'night';
export type NatureEffect = 'birds' | 'crickets' | 'city' | 'water' | 'fire';

class EnvironmentalSFXEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeEffects: Map<string, { oscillators: OscillatorNode[], gains: GainNode[] }> = new Map();
  private masterVolume: number = 0.25;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  // Resume audio context (required by browsers)
  private async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // RAIN EFFECT - Continuous white noise with filtering
  async playRain(intensity: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('rain');

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate rain noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * intensity;
    }

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // High-pass filter for rain sound
    filter.type = 'highpass';
    filter.frequency.value = 2000 + (intensity * 2000);
    gain.gain.value = intensity * 0.3;

    source.start();

    // Store for cleanup
    this.activeEffects.set('rain', {
      oscillators: [(source as any)],
      gains: [gain]
    });

    console.log('[EnvironmentalSFX] 🌧️ Rain started, intensity:', intensity);
  }

  // BIRDS CHIRPING - Random frequency bursts
  async playBirds(density: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('birds');

    const chirpInterval = setInterval(() => {
      if (!this.audioContext || !this.masterGain) {
        clearInterval(chirpInterval);
        return;
      }

      // Random chirp with some probability
      if (Math.random() > 1 - density) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        // Random bird-like frequencies
        const baseFreq = 1500 + Math.random() * 1500;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05 * density, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    }, 800);

    // Store interval reference
    (this as any).birdInterval = chirpInterval;

    console.log('[EnvironmentalSFX] 🐦 Birds started, density:', density);
  }

  // WIND HOWLING - Low frequency oscillation
  async playWind(intensity: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('wind');

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Create multiple wind layers
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();

      // Wind base frequency
      osc.type = 'sine';
      osc.frequency.value = 80 + (i * 40);

      // LFO for wind gusts
      lfo.frequency.value = 0.2 + (Math.random() * 0.3);
      lfoGain.gain.value = 20 + (intensity * 30);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.value = (intensity * 0.15) / (i + 1);

      osc.start();
      lfo.start();

      oscillators.push(osc);
      gains.push(gain);
    }

    this.activeEffects.set('wind', { oscillators, gains });

    console.log('[EnvironmentalSFX] 💨 Wind started, intensity:', intensity);
  }

  // CRICKETS - Night ambience
  async playCrickets(density: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('crickets');

    const chirpInterval = setInterval(() => {
      if (!this.audioContext || !this.masterGain) {
        clearInterval(chirpInterval);
        return;
      }

      if (Math.random() > 1 - density) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        // Cricket frequency range
        const freq = 3500 + Math.random() * 1000;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03 * density, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
      }
    }, 600);

    (this as any).cricketInterval = chirpInterval;

    console.log('[EnvironmentalSFX] 🦗 Crickets started, density:', density);
  }

  // CITY AMBIENCE - Urban background hum
  async playCityAmbience(intensity: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('city');

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Low frequency city rumble
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 60 + (i * 20);
      
      gain.gain.value = (intensity * 0.08) / (i + 1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();

      oscillators.push(osc);
      gains.push(gain);
    }

    this.activeEffects.set('city', { oscillators, gains });

    console.log('[EnvironmentalSFX] 🏙️ City ambience started, intensity:', intensity);
  }

  // WATER FLOWING - Lake/river sounds
  async playWater(intensity: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('water');

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate water-like noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * intensity * 0.5;
    }

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Band-pass for water sound
    filter.type = 'bandpass';
    filter.frequency.value = 800 + (intensity * 400);
    filter.Q.value = 1;
    gain.gain.value = intensity * 0.25;

    source.start();

    this.activeEffects.set('water', {
      oscillators: [(source as any)],
      gains: [gain]
    });

    console.log('[EnvironmentalSFX] 🌊 Water sounds started, intensity:', intensity);
  }

  // FIRE CRACKLING - Campfire/fireplace
  async playFire(intensity: number = 0.5): Promise<void> {
    await this.resume();
    if (!this.audioContext || !this.masterGain) return;

    this.stopEffect('fire');

    const crackleInterval = setInterval(() => {
      if (!this.audioContext || !this.masterGain) {
        clearInterval(crackleInterval);
        return;
      }

      if (Math.random() > 0.6) {
        const now = this.audioContext.currentTime;
        
        // White noise burst for crackle
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * intensity;
        }

        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 2000;
        filter.Q.value = 2;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05 * intensity, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        source.start(now);
      }
    }, 300);

    (this as any).fireInterval = crackleInterval;

    console.log('[EnvironmentalSFX] 🔥 Fire crackling started, intensity:', intensity);
  }

  // Auto-play appropriate sounds based on environment
  async autoPlayForEnvironment(
    weather: WeatherEffect,
    time: TimeEffect,
    locationType: 'urban' | 'nature' | 'indoor' | 'club'
  ): Promise<void> {
    // Stop all current effects
    this.stopAll();

    console.log('[EnvironmentalSFX] 🎬 Auto-playing for:', { weather, time, locationType });

    // Weather sounds (highest priority)
    switch (weather) {
      case 'rain':
        await this.playRain(0.6);
        break;
      case 'storm':
        await this.playRain(0.9);
        await this.playWind(0.7);
        break;
      case 'wind':
        await this.playWind(0.5);
        break;
      case 'snow':
        await this.playWind(0.3);
        break;
    }

    // Time-based ambient sounds
    switch (time) {
      case 'dawn':
        await this.playBirds(0.6);
        break;
      case 'day':
        await this.playBirds(0.4);
        break;
      case 'night':
        if (locationType === 'nature') {
          await this.playCrickets(0.5);
        }
        break;
    }

    // Location-based ambient sounds
    switch (locationType) {
      case 'urban':
        await this.playCityAmbience(0.4);
        break;
      case 'nature':
        await this.playWater(0.3);
        break;
    }
  }

  // Stop specific effect
  stopEffect(effectName: string): void {
    const effect = this.activeEffects.get(effectName);
    if (effect) {
      effect.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.activeEffects.delete(effectName);
    }

    // Clear intervals
    if (effectName === 'birds' && (this as any).birdInterval) {
      clearInterval((this as any).birdInterval);
      (this as any).birdInterval = null;
    }
    if (effectName === 'crickets' && (this as any).cricketInterval) {
      clearInterval((this as any).cricketInterval);
      (this as any).cricketInterval = null;
    }
    if (effectName === 'fire' && (this as any).fireInterval) {
      clearInterval((this as any).fireInterval);
      (this as any).fireInterval = null;
    }

    console.log('[EnvironmentalSFX] ⏹️ Stopped:', effectName);
  }

  // Stop all effects
  stopAll(): void {
    this.activeEffects.forEach((_, key) => this.stopEffect(key));
    console.log('[EnvironmentalSFX] ⏹️ All effects stopped');
  }

  // Set master volume
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  // Cleanup
  dispose(): void {
    this.stopAll();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const environmentalSFX = new EnvironmentalSFXEngine();
