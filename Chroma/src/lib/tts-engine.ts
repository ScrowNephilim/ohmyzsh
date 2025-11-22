/**
 * TTS Engine - ElevenLabs text-to-speech integration via Devv SDK
 * Handles voice synthesis for AI bystanders and multi-language Nephilim speech
 */

import { elevenlabs } from '@devvai/devv-code-backend';

export interface TTSOptions {
  text: string;
  voiceId?: string;
  language?: 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'pl' | 'hi' | 'ja' | 'zh' | 'ko';
  stability?: number; // 0-1, default 0.5
  similarityBoost?: number; // 0-1, default 0.75
  style?: number; // 0-1, default 0 (neutral)
}

export interface BystanderProfile {
  name: string;
  voiceId: string;
  language: string;
  personality: string; // Brief description for context
}

// ElevenLabs voice presets - optimized for character types
export const VOICE_PRESETS = {
  // Ana's French voice - tomboy, gravelly, warm, unhinged
  ANA_FRENCH: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, versatile (closest to description)
  
  // Bystanders - various character types
  BARTENDER_MALE: 'ErXwobaYiN019PkySvjV', // Antoni - deep, calm
  BARTENDER_FEMALE: 'EXAVITQu4vr4xnSDxMaL', // Sarah - natural, warm
  STUDENT_MALE: 'TxGEqnHWrfWFTfGW9XjX', // Josh - young, casual
  STUDENT_FEMALE: 'pNInz6obpgDQGcFmaJgB', // Bella - soft, young
  COP_MALE: 'VR6AewLTigWG4xSOukaG', // Arnold - authoritative
  COP_FEMALE: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - professional
  THUG_MALE: 'onwK4e9ZLuTAKqWW03F9', // Daniel - gritty
  DRUNK_MALE: 'N2lVS1w4EtoT3dr4eOWO', // Callum - rough
  SHOPKEEPER: 'pqHfZKP75CvOlQylNhV4', // Bill - friendly, older
  STRANGER_FEMALE: 'jsCqWAovK2LkecY7zXl4', // Freya - neutral, clear
  STRANGER_MALE: 'yoZ06aMxZJJ28mfd3POQ', // Sam - neutral male
  
  // Multilingual voices
  FRENCH_MALE: 'Yko7PKHZNXotIFUBG7I9', // Antoine - French
  FRENCH_FEMALE: 'zrHiDhphv9ZnVXBqCLjz', // Mimi - French
  SPANISH_MALE: 'GBv7mTt0atIp3Br8iCZE', // Thomas - multilingual
  SPANISH_FEMALE: 'jBpfuIE2acCO8z3wKNLl', // Gigi - multilingual
  CHINESE_FEMALE: 'XrExE9yKIg1WjnnlVkGX', // Matilda - multilingual
  JAPANESE_MALE: 'nPczCjzI2devNBz1zQrb', // Brian - multilingual
};

// Common bystander archetypes with voice profiles
export const BYSTANDER_ARCHETYPES: Record<string, BystanderProfile> = {
  bartender: {
    name: 'Bartender',
    voiceId: VOICE_PRESETS.BARTENDER_MALE,
    language: 'en',
    personality: 'Tired but friendly, seen it all, offers casual wisdom'
  },
  student: {
    name: 'Student',
    voiceId: VOICE_PRESETS.STUDENT_FEMALE,
    language: 'en',
    personality: 'Young, curious, slightly nervous, asks questions'
  },
  cop: {
    name: 'Officer',
    voiceId: VOICE_PRESETS.COP_MALE,
    language: 'en',
    personality: 'Authoritative, suspicious, follows protocol'
  },
  thug: {
    name: 'Thug',
    voiceId: VOICE_PRESETS.THUG_MALE,
    language: 'en',
    personality: 'Aggressive, territorial, uses street slang'
  },
  drunk: {
    name: 'Drunk',
    voiceId: VOICE_PRESETS.DRUNK_MALE,
    language: 'en',
    personality: 'Slurred speech, overly friendly or aggressive, rambling'
  },
  shopkeeper: {
    name: 'Shopkeeper',
    voiceId: VOICE_PRESETS.SHOPKEEPER,
    language: 'en',
    personality: 'Polite but rushed, business-focused, helpful'
  },
  stranger: {
    name: 'Stranger',
    voiceId: VOICE_PRESETS.STRANGER_FEMALE,
    language: 'en',
    personality: 'Neutral, brief responses, minding their own business'
  },
};

export class TTSEngine {
  private audioCache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Generate speech from text using ElevenLabs via Devv SDK
   */
  async generateSpeech(options: TTSOptions): Promise<string> {
    const cacheKey = `${options.voiceId}-${options.text}`;
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const result = await elevenlabs.textToSpeech({
        text: options.text,
        voice_id: options.voiceId || VOICE_PRESETS.STRANGER_MALE,
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0,
      });

      // Cache the audio URL
      this.audioCache.set(cacheKey, result.audio_url);
      
      return result.audio_url;
    } catch (error: any) {
      console.error('TTS generation error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  /**
   * Play generated speech audio
   */
  async playSpeech(audioUrl: string, onEnd?: () => void): Promise<void> {
    // Stop current audio if playing
    this.stopSpeech();

    this.currentAudio = new Audio(audioUrl);
    this.currentAudio.volume = 0.8;
    
    if (onEnd) {
      this.currentAudio.onended = onEnd;
    }

    try {
      await this.currentAudio.play();
    } catch (error: any) {
      console.error('Audio playback error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
      throw error;
    }
  }

  /**
   * Generate and immediately play speech
   */
  async speak(options: TTSOptions, onEnd?: () => void): Promise<void> {
    const audioUrl = await this.generateSpeech(options);
    await this.playSpeech(audioUrl, onEnd);
  }

  /**
   * Stop current speech playback
   */
  stopSpeech(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Get appropriate voice ID based on character archetype and language
   */
  getVoiceForCharacter(archetype: string, language: string = 'en'): string {
    // Language-specific overrides
    if (language === 'fr') {
      return archetype === 'ana' 
        ? VOICE_PRESETS.ANA_FRENCH 
        : VOICE_PRESETS.FRENCH_FEMALE;
    }
    
    if (language === 'es') {
      return VOICE_PRESETS.SPANISH_FEMALE;
    }
    
    if (language === 'zh') {
      return VOICE_PRESETS.CHINESE_FEMALE;
    }
    
    if (language === 'ja') {
      return VOICE_PRESETS.JAPANESE_MALE;
    }

    // English character archetypes
    const profile = BYSTANDER_ARCHETYPES[archetype.toLowerCase()];
    return profile?.voiceId || VOICE_PRESETS.STRANGER_MALE;
  }

  /**
   * Generate bystander dialogue with appropriate voice
   */
  async generateBystanderSpeech(
    archetype: string,
    text: string,
    language: string = 'en'
  ): Promise<string> {
    const voiceId = this.getVoiceForCharacter(archetype, language);
    
    return await this.generateSpeech({
      text,
      voiceId,
      language: language as any,
      stability: 0.6, // Slightly more stable for clarity
      similarityBoost: 0.7,
    });
  }

  /**
   * Generate Ana's French speech (when she hasn't recognized another Nephilim)
   */
  async generateAnaSpeech(text: string): Promise<string> {
    return await this.generateSpeech({
      text,
      voiceId: VOICE_PRESETS.ANA_FRENCH,
      language: 'fr',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3, // Slightly more expressive for tomboy personality
    });
  }

  /**
   * Check if current audio is still playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Clear audio cache (useful for memory management)
   */
  clearCache(): void {
    this.audioCache.clear();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopSpeech();
    this.clearCache();
  }
}

// Singleton instance
export const ttsEngine = new TTSEngine();

// Helper function to determine if a Nephilim should speak vs type
export function shouldNephilimSpeak(
  nephilimName: string,
  hasRecognizedOtherNephilim: boolean,
  activeNephilims: number
): boolean {
  // Ripl(a)y never speaks, always types
  if (nephilimName === 'Ripl(a)y') {
    return false;
  }

  // If Nephilim has recognized another Nephilim, switch to text
  if (hasRecognizedOtherNephilim) {
    return false;
  }

  // Ana speaks French when alone or only with humans
  if (nephilimName === 'Ana') {
    return activeNephilims === 1; // Only Ana present
  }

  // Default: Nephilims speak their native language until recognition
  return true;
}

// Helper to format speech text for better TTS output
export function formatTextForSpeech(text: string): string {
  // Remove markdown formatting
  let cleaned = text.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*/g, '');
  cleaned = cleaned.replace(/_/g, '');
  
  // Add natural pauses
  cleaned = cleaned.replace(/\.\.\./g, '... '); // Ellipsis pause
  cleaned = cleaned.replace(/—/g, ', '); // Em dash to comma pause
  
  // Handle French text
  if (cleaned.match(/[àâäéèêëïîôùûüÿæœç]/i)) {
    // Keep French formatting as-is
    return cleaned;
  }
  
  return cleaned;
}
