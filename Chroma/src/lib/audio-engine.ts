/**
 * Audio Engine - Handles immersive audio for Chroma environments
 * Includes Spotify API, YouTube embeds, ElevenLabs TTS, spatial audio effects
 */

interface AudioConfig {
  type: 'spotify' | 'youtube' | 'tts' | 'ambient';
  url?: string;
  volume?: number; // 0.0 to 1.0
  spatialEffect?: 'close' | 'distance' | 'club' | 'outdoor' | 'indoor';
  fade?: boolean;
}

interface SpatialEffects {
  lowpass?: number; // Hz cutoff for muffled/distant sound
  reverb?: number; // 0-1 for echo/space
  volume?: number; // 0-1 base volume multiplier
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.lowpassFilter = this.audioContext.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      
      // Connect nodes: source → lowpass → gain → destination
      this.lowpassFilter.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  // Get spatial audio parameters based on effect type
  private getSpatialEffects(effect: string): SpatialEffects {
    switch (effect) {
      case 'distance':
        return { lowpass: 800, reverb: 0.4, volume: 0.3 }; // Muffled, far away
      case 'club':
        return { lowpass: 400, reverb: 0.7, volume: 0.6 }; // Heavy bass, echoey
      case 'outdoor':
        return { lowpass: 2000, reverb: 0.2, volume: 0.5 }; // Clear but ambient
      case 'indoor':
        return { lowpass: 1500, reverb: 0.3, volume: 0.7 }; // Slight reverb
      case 'close':
      default:
        return { lowpass: 20000, reverb: 0.1, volume: 0.8 }; // Clear, direct
    }
  }

  // Apply spatial effects to audio
  applySpatialEffect(effect: string) {
    if (!this.audioContext || !this.gainNode || !this.lowpassFilter) return;

    const effects = this.getSpatialEffects(effect);
    
    // Smooth parameter transitions
    const now = this.audioContext.currentTime;
    
    if (effects.lowpass) {
      this.lowpassFilter.frequency.setValueAtTime(this.lowpassFilter.frequency.value, now);
      this.lowpassFilter.frequency.exponentialRampToValueAtTime(effects.lowpass, now + 0.5);
    }
    
    if (effects.volume !== undefined) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(effects.volume, now + 0.5);
    }
  }

  // Play audio from URL with spatial effects
  async playAudio(url: string, spatialEffect: string = 'close'): Promise<void> {
    if (!this.audioContext) return;

    // Stop current audio if playing
    this.stopAudio();

    const audio = new Audio(url);
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    
    const source = this.audioContext.createMediaElementSource(audio);
    source.connect(this.lowpassFilter!);
    
    this.currentAudio = audio;
    this.applySpatialEffect(spatialEffect);
    
    await audio.play();
  }

  // Stop current audio with fade
  stopAudio(fadeDuration: number = 1.0) {
    if (!this.currentAudio || !this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + fadeDuration);

    setTimeout(() => {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
    }, fadeDuration * 1000);
  }

  // Get Spotify embed URL from track/playlist link
  getSpotifyEmbedUrl(spotifyUrl: string): string {
    // Convert spotify:track:ID or https://open.spotify.com/track/ID to embed URL
    let trackId = spotifyUrl;
    
    if (spotifyUrl.includes('spotify.com')) {
      const match = spotifyUrl.match(/\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
      if (match) {
        const type = match[1];
        trackId = match[2];
        return `https://open.spotify.com/embed/${type}/${trackId}?utm_source=generator`;
      }
    }
    
    return spotifyUrl;
  }

  // Get YouTube embed URL
  getYouTubeEmbedUrl(youtubeUrl: string): string {
    let videoId = youtubeUrl;
    
    if (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')) {
      const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (match) {
        videoId = match[1];
      }
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&controls=0`;
  }

  // Generate ElevenLabs TTS audio
  async generateTTS(text: string, voiceId: string, apiKey: string): Promise<Blob> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Play TTS audio with spatial effects
  async playTTS(text: string, voiceId: string, apiKey: string, spatialEffect: string = 'close'): Promise<void> {
    try {
      const audioBlob = await this.generateTTS(text, voiceId, apiKey);
      const audioUrl = URL.createObjectURL(audioBlob);
      await this.playAudio(audioUrl, spatialEffect);
      
      // Clean up object URL after audio ends
      if (this.currentAudio) {
        this.currentAudio.onended = () => URL.revokeObjectURL(audioUrl);
      }
    } catch (error) {
      console.error('TTS playback error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      throw error;
    }
  }

  // Cleanup
  dispose() {
    this.stopAudio(0);
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();

// ElevenLabs voice presets (commonly used voices)
export const VOICE_PRESETS = {
  // Ana's French voice - tomboy, gravelly, warm
  ANA_FRENCH: 'EXAVITQu4vr4xnSDxMaL', // Sarah - natural, warm, versatile
  
  // Other useful voices
  RACHEL_CALM: '21m00Tcm4TlvDq8ikWAM', // Rachel - calm, professional
  BELLA_SOFT: 'EXAVITQu4vr4xnSDxMaL', // Bella - soft, young
  ANTONI_DEEP: 'ErXwobaYiN019PkySvjV', // Antoni - deep male
  JOSH_CASUAL: 'TxGEqnHWrfWFTfGW9XjX', // Josh - casual male
};
