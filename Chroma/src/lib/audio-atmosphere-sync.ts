/**
 * Audio-Atmosphere Sync Engine
 * Dynamically adjusts background music volume based on atmospheric intensity
 * (temperature, weather, power activations, location type)
 */

import type { EnvironmentState } from './chroma-types';
import type { LocationPreset } from './chroma-locations';
import { NephilimPower } from './parallel-worlds';
import { audioEngine } from './audio-engine';

export interface AtmosphereIntensity {
  temperature: number; // 0-1 (cold to hot)
  weather: number; // 0-1 (calm to extreme)
  power: number; // 0-1 (no power to full power)
  location: number; // 0-1 (calm to chaotic)
  overall: number; // 0-1 combined intensity
}

/**
 * Calculate temperature intensity (0-1 scale)
 * Cold and hot both increase intensity
 */
export function calculateTemperatureIntensity(temperature: string): number {
  const tempMatch = temperature.match(/(-?\d+)/);
  if (!tempMatch) return 0.5;
  
  const temp = parseInt(tempMatch[0]);
  
  // Convert to 0-1 scale where extremes = high intensity
  // Comfortable range (60-75°F) = low intensity (0.3-0.4)
  // Cold (<40°F) or Hot (>90°F) = high intensity (0.7-1.0)
  
  if (temp < 20) return 0.95; // Extreme cold
  if (temp < 40) return 0.75; // Cold
  if (temp < 60) return 0.5; // Cool
  if (temp < 75) return 0.3; // Comfortable
  if (temp < 90) return 0.5; // Warm
  if (temp < 100) return 0.75; // Hot
  return 0.95; // Extreme heat
}

/**
 * Calculate weather intensity (0-1 scale)
 */
export function calculateWeatherIntensity(weather: string): number {
  const lowerWeather = weather.toLowerCase();
  
  if (lowerWeather.includes('storm') || lowerWeather.includes('blizzard') || lowerWeather.includes('hurricane')) {
    return 1.0; // Extreme weather
  }
  if (lowerWeather.includes('rain') || lowerWeather.includes('thunder') || lowerWeather.includes('snow')) {
    return 0.7; // Active weather
  }
  if (lowerWeather.includes('wind') || lowerWeather.includes('fog') || lowerWeather.includes('mist')) {
    return 0.5; // Moderate weather
  }
  if (lowerWeather.includes('cloud') || lowerWeather.includes('overcast')) {
    return 0.3; // Mild weather
  }
  if (lowerWeather.includes('clear') || lowerWeather.includes('sunny')) {
    return 0.2; // Calm weather
  }
  
  return 0.4; // Default moderate
}

/**
 * Calculate power activation intensity (0-1 scale)
 */
export function calculatePowerIntensity(
  power: NephilimPower | null,
  intensityLevel: 'low' | 'medium' | 'high' = 'medium'
): number {
  if (!power) return 0;
  
  const levelMap = { low: 0.5, medium: 0.75, high: 1.0 };
  let baseIntensity = levelMap[intensityLevel];
  
  // Conqueror's Haki and similar overwhelming powers = maximum intensity
  if (power.power_name.toLowerCase().includes('haki') || 
      power.power_name.toLowerCase().includes('conqueror')) {
    baseIntensity = 1.0;
  }
  
  // Différance and Le Fait Social = high intensity
  if (power.power_name === 'Différance' || power.power_name === 'Le Fait Social') {
    baseIntensity = Math.min(baseIntensity * 1.2, 1.0);
  }
  
  return baseIntensity;
}

/**
 * Calculate location type intensity (0-1 scale)
 */
export function calculateLocationIntensity(location: LocationPreset): number {
  const type = location.type;
  
  if (type === 'indoor') return 0.4; // Enclosed, calmer
  if (type === 'outdoor') return 0.5; // Open, variable
  if (type === 'urban') return 0.6; // Urban chaos
  if (type === 'transport') return 0.6; // Transport chaos
  if (type === 'parallel_world') return 0.7; // Parallel world intensity
  
  // Special locations
  if (location.id === 'mementos') return 0.95; // Distorted reality
  if (location.id === 'velvet_room') return 0.3; // Ethereal calm
  if (location.id.includes('wano')) return 0.4; // Peaceful oriental
  if (location.id.includes('chicago_club')) return 0.9; // Club intensity
  
  return 0.5; // Default moderate
}

/**
 * Calculate overall atmosphere intensity
 */
export function calculateAtmosphereIntensity(
  envState: EnvironmentState,
  location: LocationPreset,
  activePower: NephilimPower | null = null,
  powerIntensityLevel: 'low' | 'medium' | 'high' = 'medium'
): AtmosphereIntensity {
  const temp = calculateTemperatureIntensity(envState.temperature);
  const weather = calculateWeatherIntensity(envState.weather);
  const power = calculatePowerIntensity(activePower, powerIntensityLevel);
  const loc = calculateLocationIntensity(location);
  
  // Overall intensity: weighted average with power taking priority
  // Power activations temporarily boost intensity significantly
  const weights = {
    temperature: 0.25,
    weather: 0.25,
    location: 0.3,
    power: 0.2 // Base weight, but multiplied when active
  };
  
  let overall = 
    temp * weights.temperature +
    weather * weights.weather +
    loc * weights.location +
    power * weights.power;
  
  // Boost overall intensity when power is active
  if (power > 0) {
    overall = Math.min(overall + (power * 0.3), 1.0);
  }
  
  return {
    temperature: temp,
    weather: weather,
    power: power,
    location: loc,
    overall: Math.min(overall, 1.0)
  };
}

/**
 * Convert intensity to volume (0-1 scale)
 * Higher intensity = lower volume (so atmospheric text is more visible/readable)
 * Power activations temporarily duck the music
 */
export function intensityToVolume(
  intensity: AtmosphereIntensity,
  baseVolume: number = 0.7
): number {
  const { overall, power } = intensity;
  
  // Inverse relationship: high intensity = lower volume
  // Range: 0.2 (high intensity) to baseVolume (low intensity)
  let targetVolume = baseVolume - (overall * (baseVolume - 0.2));
  
  // Power activations further reduce volume temporarily
  if (power > 0) {
    targetVolume = targetVolume * (1 - (power * 0.5)); // Up to 50% reduction
  }
  
  return Math.max(0.1, Math.min(targetVolume, 1.0)); // Clamp 0.1-1.0
}

/**
 * Sync audio engine volume with atmosphere intensity
 */
export function syncAudioWithAtmosphere(
  envState: EnvironmentState,
  location: LocationPreset,
  baseVolume: number = 0.7,
  activePower: NephilimPower | null = null,
  powerIntensityLevel: 'low' | 'medium' | 'high' = 'medium'
): void {
  const intensity = calculateAtmosphereIntensity(envState, location, activePower, powerIntensityLevel);
  const targetVolume = intensityToVolume(intensity, baseVolume);
  
  // Apply volume to audio engine via spatial effect
  // This will smoothly transition the volume
  if (audioEngine && audioEngine['gainNode']) {
    const gainNode = audioEngine['gainNode'];
    const audioContext = audioEngine['audioContext'];
    
    if (gainNode && audioContext) {
      const now = audioContext.currentTime;
      const transitionTime = activePower ? 0.3 : 1.0; // Faster for power activations
      
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(targetVolume, now + transitionTime);
    }
  }
  
  console.log('🎵 Audio-Atmosphere Sync:', {
    intensity: intensity.overall.toFixed(2),
    volume: targetVolume.toFixed(2),
    temp: intensity.temperature.toFixed(2),
    weather: intensity.weather.toFixed(2),
    location: intensity.location.toFixed(2),
    power: intensity.power.toFixed(2)
  });
}

/**
 * Power activation temporary volume duck
 * Reduces volume significantly for 3-5 seconds, then restores
 */
export function duckVolumeForPowerActivation(
  currentVolume: number,
  power: NephilimPower,
  intensityLevel: 'low' | 'medium' | 'high' = 'medium'
): void {
  const audioContext = audioEngine['audioContext'];
  const gainNode = audioEngine['gainNode'];
  
  if (!audioContext || !gainNode) return;
  
  const now = audioContext.currentTime;
  const duckAmount = intensityLevel === 'high' ? 0.8 : intensityLevel === 'medium' ? 0.6 : 0.4;
  const duckedVolume = currentVolume * (1 - duckAmount); // Reduce by 40-80%
  const duckDuration = intensityLevel === 'high' ? 5 : intensityLevel === 'medium' ? 4 : 3;
  
  // Duck down quickly
  gainNode.gain.setValueAtTime(currentVolume, now);
  gainNode.gain.linearRampToValueAtTime(duckedVolume, now + 0.2);
  
  // Hold at ducked volume
  gainNode.gain.setValueAtTime(duckedVolume, now + 0.2);
  
  // Restore gradually
  gainNode.gain.linearRampToValueAtTime(currentVolume, now + duckDuration);
  
  console.log(`🔇 Power activation volume duck: ${(currentVolume * 100).toFixed(0)}% → ${(duckedVolume * 100).toFixed(0)}% for ${duckDuration}s`);
}

/**
 * Get atmospheric intensity description for UI
 */
export function getIntensityDescription(intensity: number): string {
  if (intensity >= 0.9) return 'EXTREME';
  if (intensity >= 0.7) return 'HIGH';
  if (intensity >= 0.5) return 'MODERATE';
  if (intensity >= 0.3) return 'LOW';
  return 'MINIMAL';
}

/**
 * Get volume level description for UI
 */
export function getVolumeDescription(volume: number): string {
  if (volume >= 0.8) return 'Full';
  if (volume >= 0.6) return 'High';
  if (volume >= 0.4) return 'Medium';
  if (volume >= 0.2) return 'Low';
  return 'Very Low';
}
