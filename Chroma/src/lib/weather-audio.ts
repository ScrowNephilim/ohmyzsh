/**
 * Weather Audio Loop System
 * Plays continuous ambient weather sounds (rain, wind, thunder, etc.)
 * Uses external audio URLs for authentic weather ambience
 */

import type { WeatherEffect } from './environmental-sfx';

interface WeatherAudioConfig {
  url: string;
  volume: number;
  description: string;
  loop: boolean;
}

const WEATHER_AUDIO_URLS: Record<WeatherEffect, WeatherAudioConfig | null> = {
  rain: {
    url: 'https://tuna.voicemod.net/sound/a29bf7f9-e056-4e93-9de6-3485190a5da3',
    volume: 0.4,
    description: 'Continuous rain ambience',
    loop: true
  },
  storm: {
    url: 'https://tuna.voicemod.net/sound/9ed22588-a406-455a-a7a4-7178937778d2',
    volume: 0.5,
    description: 'Thunder and heavy rain',
    loop: true
  },
  wind: {
    url: 'https://tuna.voicemod.net/sound/a29bf7f9-e056-4e93-9de6-3485190a5da3', // Placeholder
    volume: 0.3,
    description: 'Wind howling',
    loop: true
  },
  snow: null, // Use Web Audio API instead
  fog: null,  // Use Web Audio API instead
  clear: null // No weather audio for clear
};

let currentWeatherAudio: HTMLAudioElement | null = null;
let currentWeatherType: WeatherEffect | null = null;

/**
 * Play weather audio loop
 */
export function playWeatherLoop(weather: WeatherEffect, volume: number = 0.4): void {
  // If same weather already playing, don't restart
  if (currentWeatherType === weather && currentWeatherAudio && !currentWeatherAudio.paused) {
    console.log(`[Weather Audio] Already playing ${weather}`);
    return;
  }
  
  // Stop any existing weather audio
  stopWeatherLoop();
  
  const config = WEATHER_AUDIO_URLS[weather];
  
  if (!config) {
    console.log(`[Weather Audio] No audio for weather: ${weather}`);
    return;
  }
  
  try {
    const audio = new Audio(config.url);
    audio.volume = volume * config.volume; // Multiply by config volume for balance
    audio.loop = config.loop;
    
    audio.play().then(() => {
      console.log(`[Weather Audio] 🌧️ Playing ${weather} loop: ${config.description}`);
    }).catch(error => {
      console.log(`[Weather Audio] ⚠️ Could not play ${weather}:`, error.message);
    });
    
    currentWeatherAudio = audio;
    currentWeatherType = weather;
  } catch (error: any) {
    console.log(`[Weather Audio] ⚠️ Error creating audio for ${weather}:`, error.message);
  }
}

/**
 * Stop weather audio loop
 */
export function stopWeatherLoop(): void {
  if (currentWeatherAudio) {
    currentWeatherAudio.pause();
    currentWeatherAudio.currentTime = 0;
    currentWeatherAudio = null;
    currentWeatherType = null;
    console.log('[Weather Audio] 🔇 Stopped weather loop');
  }
}

/**
 * Update weather loop volume
 */
export function setWeatherVolume(volume: number): void {
  if (currentWeatherAudio) {
    const config = currentWeatherType ? WEATHER_AUDIO_URLS[currentWeatherType] : null;
    if (config) {
      currentWeatherAudio.volume = volume * config.volume;
      console.log(`[Weather Audio] 🔊 Volume set to ${Math.round(volume * 100)}%`);
    }
  }
}

/**
 * Get current weather audio status
 */
export function getWeatherAudioStatus(): { playing: boolean; weather: WeatherEffect | null } {
  return {
    playing: currentWeatherAudio !== null && !currentWeatherAudio.paused,
    weather: currentWeatherType
  };
}

/**
 * Cleanup weather audio on page exit
 */
export function cleanupWeatherAudio(): void {
  stopWeatherLoop();
  console.log('[Weather Audio] 🧹 Cleanup complete');
}
