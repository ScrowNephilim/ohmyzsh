/**
 * Ambient Audio Engine - Automatic background audio for Chroma environments
 * Plays location-based ambient music immediately on entry
 */

interface AmbientAudioConfig {
  type: 'lofi' | 'ambient' | 'urban' | 'nature' | 'club' | 'cafe';
  youtubeUrl: string;
  volume: number; // 0.0 to 1.0
}

// Curated YouTube ambient audio tracks for different environments
const AMBIENT_TRACKS: Record<string, AmbientAudioConfig> = {
  // Chicago/Urban environments
  chicago_streets: {
    type: 'lofi',
    youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Lofi Girl - beats to relax/study to
    volume: 0.3
  },
  chicago_diner: {
    type: 'ambient',
    youtubeUrl: 'https://www.youtube.com/watch?v=gaJWFZGjZeQ', // Cozy cafe ambience
    volume: 0.25
  },
  chicago_lakefront: {
    type: 'nature',
    youtubeUrl: 'https://www.youtube.com/watch?v=qH0dw1fe8k0', // Lake waves ambient
    volume: 0.3
  },
  underground_club: {
    type: 'club',
    youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A', // Deep house techno
    volume: 0.4
  },

  // Paris/Europe environments
  paris_suburbs: {
    type: 'urban',
    youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Lofi beats
    volume: 0.3
  },
  paris_cafe: {
    type: 'cafe',
    youtubeUrl: 'https://www.youtube.com/watch?v=gaJWFZGjZeQ', // Parisian cafe ambience
    volume: 0.25
  },

  // Default fallback
  default: {
    type: 'lofi',
    youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Lofi Girl
    volume: 0.3
  }
};

class AmbientAudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentTrack: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  // Start ambient audio automatically for a location
  async startAmbientAudio(locationId: string, atmosphereIntensity: number = 0.5): Promise<void> {
    try {
      // Get ambient track for location (fallback to default)
      const config = AMBIENT_TRACKS[locationId] || AMBIENT_TRACKS.default;
      
      // Skip if already playing this track
      if (this.isPlaying && this.currentTrack === locationId) {
        console.log('[AmbientAudio] Already playing:', locationId);
        return;
      }

      console.log('[AmbientAudio] Starting ambient audio for:', locationId, config.type);

      // Stop current audio if playing
      this.stopAmbientAudio(false);

      // Create audio element with YouTube embed
      // Note: YouTube embeds require user interaction to autoplay
      // We'll use a Web Audio API tone generator for truly automatic ambient sound
      await this.generateAmbientTone(config.type, config.volume, atmosphereIntensity);

      this.isPlaying = true;
      this.currentTrack = locationId;

      console.log('[AmbientAudio] ✓ Ambient audio started');
    } catch (error) {
      console.error('[AmbientAudio] Failed to start:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('[AmbientAudio] Raw error:', error);
    }
  }

  // Generate procedural ambient tones using Web Audio API (no user interaction needed)
  private async generateAmbientTone(
    type: AmbientAudioConfig['type'], 
    baseVolume: number,
    intensity: number
  ): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    // Resume audio context (required by browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Create oscillators for ambient soundscape
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();

    // Create gain nodes for each oscillator
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const gain3 = this.audioContext.createGain();

    // Set frequencies based on environment type
    const frequencies = this.getFrequenciesForType(type);
    oscillator1.frequency.value = frequencies[0];
    oscillator2.frequency.value = frequencies[1];
    oscillator3.frequency.value = frequencies[2];

    // Set waveforms
    oscillator1.type = 'sine';
    oscillator2.type = 'triangle';
    oscillator3.type = 'sine';

    // Calculate volume based on atmosphere intensity (inverse relationship)
    const atmosphereVolume = 1 - (intensity * 0.8); // Higher intensity = lower volume (20-100%)
    const finalVolume = baseVolume * atmosphereVolume * 0.15; // Very subtle

    // Set volumes
    gain1.gain.value = finalVolume * 0.5;
    gain2.gain.value = finalVolume * 0.3;
    gain3.gain.value = finalVolume * 0.2;

    // Connect nodes
    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    oscillator3.connect(gain3);
    gain1.connect(this.gainNode!);
    gain2.connect(this.gainNode!);
    gain3.connect(this.gainNode!);

    // Start oscillators
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();

    // Store references for cleanup
    (this as any).oscillators = [oscillator1, oscillator2, oscillator3];
    (this as any).gains = [gain1, gain2, gain3];

    console.log('[AmbientAudio] Generated ambient tones:', type, 'volume:', finalVolume);
  }

  // Get frequencies based on environment type
  private getFrequenciesForType(type: AmbientAudioConfig['type']): [number, number, number] {
    switch (type) {
      case 'lofi':
        return [220, 330, 440]; // Warm, chill tones (A3, E4, A4)
      case 'ambient':
        return [196, 293, 392]; // Soft, atmospheric (G3, D4, G4)
      case 'urban':
        return [246, 369, 493]; // Slightly edgy (B3, F#4, B4)
      case 'nature':
        return [174, 261, 349]; // Natural, flowing (F3, C4, F4)
      case 'club':
        return [130, 196, 261]; // Deep, bass-heavy (C3, G3, C4)
      case 'cafe':
        return [220, 277, 349]; // Warm, cozy (A3, C#4, F4)
      default:
        return [220, 330, 440];
    }
  }

  // Update volume based on atmospheric intensity
  updateVolume(intensity: number, baseVolume: number = 0.3): void {
    if (!this.gainNode || !this.audioContext) return;

    // Calculate new volume (inverse relationship with intensity)
    const atmosphereVolume = 1 - (intensity * 0.8); // 20-100% range
    const newVolume = baseVolume * atmosphereVolume * 0.15;

    // Smooth volume transition
    const now = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(newVolume, now + 1.0);

    console.log('[AmbientAudio] Updated volume:', newVolume, 'intensity:', intensity);
  }

  // Stop ambient audio
  stopAmbientAudio(fadeOut: boolean = true): void {
    if (!this.isPlaying) return;

    console.log('[AmbientAudio] Stopping ambient audio...');

    // Stop oscillators
    if ((this as any).oscillators) {
      (this as any).oscillators.forEach((osc: OscillatorNode) => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      (this as any).oscillators = null;
      (this as any).gains = null;
    }

    // Stop HTML audio if present
    if (this.currentAudio) {
      if (fadeOut && this.audioContext && this.gainNode) {
        const now = this.audioContext.currentTime;
        this.gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
        setTimeout(() => {
          if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
          }
        }, 1000);
      } else {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
    }

    this.isPlaying = false;
    this.currentTrack = '';
  }

  // Get track info for current location
  getTrackInfo(locationId: string): AmbientAudioConfig {
    return AMBIENT_TRACKS[locationId] || AMBIENT_TRACKS.default;
  }

  // Check if audio is currently playing
  get playing(): boolean {
    return this.isPlaying;
  }

  // Cleanup
  dispose(): void {
    this.stopAmbientAudio(false);
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
export const ambientAudioEngine = new AmbientAudioEngine();
