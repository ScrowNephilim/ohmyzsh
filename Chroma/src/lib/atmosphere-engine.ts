/**
 * Atmosphere Engine - Dynamic UI/Typography System
 * Adapts text styling, colors, fonts based on environment temperature, location, and power activations
 */

import type { EnvironmentState } from './chroma-types';
import type { LocationPreset } from './chroma-locations';
import { NephilimPower } from './parallel-worlds';

export interface AtmosphereStyle {
  textColor: string; // CSS color for environment info
  fontSize: string; // CSS font-size
  fontFamily: string; // CSS font-family
  letterSpacing: string; // CSS letter-spacing
  textShadow: string; // CSS text-shadow
  fontWeight: string; // CSS font-weight
  opacity: number; // 0-1
  animation?: string; // CSS animation class
}

export interface PowerVisualization {
  textColor: string;
  fontSize: string;
  fontFamily: string;
  letterSpacing: string;
  textShadow: string;
  animation: string;
}

/**
 * Temperature to color/style mapping
 */
export function getTemperatureStyle(temperature: string): AtmosphereStyle {
  const tempMatch = temperature.match(/(-?\d+)/);
  const temp = tempMatch ? parseInt(tempMatch[0]) : 50;

  // Very cold (< 20°F) - Icy blue
  if (temp < 20) {
    return {
      textColor: 'hsl(200, 80%, 70%)',
      fontSize: '0.9rem',
      fontFamily: 'monospace, "Courier New"',
      letterSpacing: '0.05em',
      textShadow: '0 0 8px rgba(100, 200, 255, 0.6)',
      fontWeight: '300',
      opacity: 0.85,
      animation: 'shimmer-cold'
    };
  }
  
  // Cold (20-40°F) - Cool blue-gray
  if (temp < 40) {
    return {
      textColor: 'hsl(210, 60%, 65%)',
      fontSize: '0.9rem',
      fontFamily: 'monospace, "Courier New"',
      letterSpacing: '0.03em',
      textShadow: '0 0 6px rgba(120, 180, 220, 0.5)',
      fontWeight: '300',
      opacity: 0.8,
      animation: 'gentle-pulse'
    };
  }
  
  // Cool (40-60°F) - Neutral gray
  if (temp < 60) {
    return {
      textColor: 'hsl(0, 0%, 70%)',
      fontSize: '0.875rem',
      fontFamily: 'monospace, "Courier New"',
      letterSpacing: '0.02em',
      textShadow: '0 0 4px rgba(150, 150, 150, 0.4)',
      fontWeight: '400',
      opacity: 0.75,
      animation: 'none'
    };
  }
  
  // Warm (60-80°F) - Warm amber
  if (temp < 80) {
    return {
      textColor: 'hsl(40, 75%, 70%)',
      fontSize: '0.9rem',
      fontFamily: 'Georgia, serif',
      letterSpacing: '0.03em',
      textShadow: '0 0 6px rgba(255, 200, 100, 0.5)',
      fontWeight: '400',
      opacity: 0.8,
      animation: 'warm-glow'
    };
  }
  
  // Hot (80-100°F) - Orange-red
  if (temp < 100) {
    return {
      textColor: 'hsl(25, 85%, 65%)',
      fontSize: '1rem',
      fontFamily: '"Trebuchet MS", sans-serif',
      letterSpacing: '0.04em',
      textShadow: '0 0 10px rgba(255, 150, 50, 0.6)',
      fontWeight: '500',
      opacity: 0.9,
      animation: 'heat-shimmer'
    };
  }
  
  // Very hot (100+°F) - Intense red
  return {
    textColor: 'hsl(10, 90%, 60%)',
    fontSize: '1.1rem',
    fontFamily: '"Trebuchet MS", sans-serif',
    letterSpacing: '0.06em',
    textShadow: '0 0 15px rgba(255, 80, 40, 0.8), 0 0 30px rgba(255, 100, 50, 0.4)',
    fontWeight: '600',
    opacity: 1,
    animation: 'intense-heat'
  };
}

/**
 * Location-specific typography
 */
export function getLocationStyle(location: LocationPreset): Partial<AtmosphereStyle> {
  // Parallel World: Wano (oriental, calm)
  if (location.id === 'wano_streets') {
    return {
      fontFamily: '"Times New Roman", "Noto Serif JP", serif',
      letterSpacing: '0.15em',
      fontSize: '0.95rem',
      fontWeight: '300',
      textColor: 'hsl(30, 40%, 75%)'
    };
  }

  // Parallel World: Cairo (ancient, mysterious)
  if (location.id === 'cairo_streets') {
    return {
      fontFamily: '"Papyrus", "Book Antiqua", serif',
      letterSpacing: '0.08em',
      fontSize: '1rem',
      fontWeight: '400',
      textColor: 'hsl(40, 60%, 70%)'
    };
  }

  // Parallel World: Mementos (distorted, digital)
  if (location.id === 'mementos') {
    return {
      fontFamily: '"Courier New", monospace',
      letterSpacing: '0.1em',
      fontSize: '0.9rem',
      fontWeight: '700',
      textColor: 'hsl(0, 80%, 60%)',
      textShadow: '0 0 10px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)'
    };
  }

  // Velvet Room (ethereal, elegant)
  if (location.id === 'velvet_room') {
    return {
      fontFamily: '"Garamond", "Palatino Linotype", serif',
      letterSpacing: '0.12em',
      fontSize: '1rem',
      fontWeight: '300',
      textColor: 'hsl(220, 80%, 75%)',
      textShadow: '0 0 15px rgba(100, 150, 255, 0.8)'
    };
  }

  // Paris locations (refined, elegant)
  if (location.id.includes('paris')) {
    return {
      fontFamily: '"Garamond", serif',
      letterSpacing: '0.05em',
      fontSize: '0.9rem',
      fontWeight: '400',
      textColor: 'hsl(45, 50%, 70%)'
    };
  }

  // Chicago streets (gritty, urban)
  if (location.id.includes('chicago')) {
    return {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      letterSpacing: '0.02em',
      fontSize: '0.875rem',
      fontWeight: '500',
      textColor: 'hsl(142, 70%, 60%)'
    };
  }

  // Club (bold, pulsing)
  if (location.type === 'club') {
    return {
      fontFamily: 'Impact, "Arial Black", sans-serif',
      letterSpacing: '0.08em',
      fontSize: '1rem',
      fontWeight: '900',
      textColor: 'hsl(280, 90%, 65%)',
      animation: 'pulse-bass'
    };
  }

  // Default
  return {};
}

/**
 * Power activation typography (inspired by anime/manga)
 */
export function getPowerVisualization(power: NephilimPower, intensity: 'low' | 'medium' | 'high' = 'medium'): PowerVisualization {
  // Ripl(a)y's Différance - Reality warping, temporal loops
  if (power.power_name === 'Différance') {
    const sizes = { low: '1.2rem', medium: '1.5rem', high: '2rem' };
    const spacing = { low: '0.1em', medium: '0.15em', high: '0.2em' };
    
    return {
      textColor: 'hsl(280, 90%, 70%)',
      fontSize: sizes[intensity],
      fontFamily: '"Times New Roman", "Garamond", serif',
      letterSpacing: spacing[intensity],
      textShadow: '0 0 20px rgba(200, 100, 255, 0.9), 0 0 40px rgba(150, 50, 255, 0.6), 4px 4px 8px rgba(0, 0, 0, 0.8)',
      animation: 'glitch-reality'
    };
  }

  // Ana's Le Fait Social - Sociological force fields
  if (power.power_name === 'Le Fait Social') {
    const sizes = { low: '1.2rem', medium: '1.5rem', high: '2rem' };
    const spacing = { low: '0.08em', medium: '0.12em', high: '0.16em' };
    
    return {
      textColor: 'hsl(10, 95%, 65%)',
      fontSize: sizes[intensity],
      fontFamily: '"Helvetica Neue", "Arial Black", sans-serif',
      letterSpacing: spacing[intensity],
      textShadow: '0 0 20px rgba(255, 80, 50, 0.9), 0 0 40px rgba(255, 50, 30, 0.6), 3px 3px 6px rgba(0, 0, 0, 0.9)',
      animation: 'pressure-wave'
    };
  }

  // Conqueror's Haki (example for future powers)
  // Very strong powers get HUGE gothic/old english fonts in red
  if (power.power_name.toLowerCase().includes('haki') || power.power_name.toLowerCase().includes('conqueror')) {
    return {
      textColor: 'hsl(0, 100%, 50%)',
      fontSize: '2.5rem',
      fontFamily: '"Old English Text MT", "Blackletter", serif',
      letterSpacing: '0.25em',
      textShadow: '0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(200, 0, 0, 0.8), 5px 5px 10px rgba(0, 0, 0, 1)',
      animation: 'conqueror-pulse'
    };
  }

  // Default powerful effect
  return {
    textColor: 'hsl(50, 100%, 60%)',
    fontSize: '1.5rem',
    fontFamily: '"Arial Black", sans-serif',
    letterSpacing: '0.1em',
    textShadow: '0 0 15px rgba(255, 220, 100, 0.8), 0 0 30px rgba(255, 200, 50, 0.5)',
    animation: 'power-surge'
  };
}

/**
 * Combine environment state with location to generate full atmosphere
 */
export function generateAtmosphere(
  envState: EnvironmentState,
  location: LocationPreset
): AtmosphereStyle {
  const tempStyle = getTemperatureStyle(envState.temperature);
  const locationStyle = getLocationStyle(location);

  return {
    ...tempStyle,
    ...locationStyle
  };
}

/**
 * Weather effects on atmosphere
 */
export function getWeatherModifiers(weather: string): Partial<AtmosphereStyle> {
  const lowerWeather = weather.toLowerCase();

  if (lowerWeather.includes('rain') || lowerWeather.includes('storm')) {
    return {
      opacity: 0.7,
      textShadow: '0 0 5px rgba(100, 150, 200, 0.6)',
      animation: 'rain-flicker'
    };
  }

  if (lowerWeather.includes('fog') || lowerWeather.includes('mist')) {
    return {
      opacity: 0.6,
      textShadow: '0 0 10px rgba(180, 180, 200, 0.8)',
      animation: 'fog-drift'
    };
  }

  if (lowerWeather.includes('snow')) {
    return {
      textColor: 'hsl(200, 80%, 85%)',
      textShadow: '0 0 12px rgba(200, 220, 255, 0.8)',
      animation: 'snow-sparkle'
    };
  }

  if (lowerWeather.includes('clear') || lowerWeather.includes('sunny')) {
    return {
      opacity: 0.9,
      textShadow: '0 0 8px rgba(255, 240, 150, 0.6)'
    };
  }

  return {};
}

/**
 * Format environment text with atmospheric styling
 */
export function formatEnvironmentText(
  envState: EnvironmentState,
  location: LocationPreset
): string {
  const atmosphere = generateAtmosphere(envState, location);
  const weatherMods = getWeatherModifiers(envState.weather);
  
  return `${envState.time} • ${envState.temperature} • ${envState.weather} • ${envState.lighting}`;
}
