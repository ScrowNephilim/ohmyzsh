/**
 * France-Specific Formatting Utilities
 * Celsius temperatures, CET/CEST times, European date formats
 */

import type { LocationPreset } from './chroma-locations';

/**
 * Check if location is in France/Europe
 */
export function isFranceLocation(location: LocationPreset): boolean {
  const frenchIds = [
    'hauts_de_seine',
    'paris_cafe',
    'paris_seine',
    'paris_concorde',
    'eygalieres',
    'eygalieres_house',
    'rer_train'
  ];
  
  return frenchIds.includes(location.id);
}

/**
 * Format temperature for France (Celsius)
 */
export function formatTempCelsius(tempFahrenheit: string): string {
  const fahrenheit = parseFloat(tempFahrenheit.match(/(-?\d+)/)?.[0] || '50');
  const celsius = Math.round((fahrenheit - 32) * 5 / 9);
  return `${celsius}°C`;
}

/**
 * Format temperature for USA (Fahrenheit)
 */
export function formatTempFahrenheit(tempFahrenheit: string): string {
  const fahrenheit = parseFloat(tempFahrenheit.match(/(-?\d+)/)?.[0] || '50');
  return `${fahrenheit}°F`;
}

/**
 * Format time for France (24-hour CET/CEST)
 */
export function formatTimeFrance(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Paris'
  };
  
  const timeStr = now.toLocaleTimeString('fr-FR', options);
  
  // Determine if DST (CEST) or standard time (CET)
  const janOffset = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const julOffset = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  const isDST = Math.max(janOffset, julOffset) !== now.getTimezoneOffset();
  
  const timezone = isDST ? 'CEST' : 'CET';
  
  return `${timeStr} ${timezone}`;
}

/**
 * Format time for USA (12-hour CST/CDT)
 */
export function formatTimeUSA(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Chicago'
  };
  
  const timeStr = now.toLocaleTimeString('en-US', options);
  return `${timeStr} CST`;
}

/**
 * Format environment context with location-aware formatting
 */
export function formatEnvironmentContext(
  location: LocationPreset,
  temperature: string,
  weather: string,
  lighting: string
): string {
  const isFrance = isFranceLocation(location);
  
  const timeStr = isFrance ? formatTimeFrance() : formatTimeUSA();
  const tempStr = isFrance ? formatTempCelsius(temperature) : formatTempFahrenheit(temperature);
  
  return `${timeStr} • ${tempStr} • ${weather} • ${lighting}`;
}

/**
 * Get current time in France (for environment initialization)
 */
export function getCurrentFranceTime(): string {
  const now = new Date();
  const hour = now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Europe/Paris' });
  const minute = now.toLocaleString('en-US', { minute: '2-digit', timeZone: 'Europe/Paris' });
  
  const hourNum = parseInt(hour);
  
  if (hourNum >= 5 && hourNum < 7) return 'dawn';
  if (hourNum >= 7 && hourNum < 12) return 'morning';
  if (hourNum >= 12 && hourNum < 17) return 'afternoon';
  if (hourNum >= 17 && hourNum < 20) return 'evening';
  if (hourNum >= 20 && hourNum < 22) return 'late evening';
  return 'night';
}

/**
 * Get current lighting description based on France time
 */
export function getCurrentFranceLighting(): string {
  const now = new Date();
  const hour = parseInt(now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Europe/Paris' }));
  
  let lighting = 'night'; // fallback
  
  if (hour >= 0 && hour < 5) lighting = 'deep night, stars visible, one lit window (right side of house)';
  else if (hour >= 5 && hour < 6) lighting = 'pre-dawn, sky lightening in east, house lights fading';
  else if (hour >= 6 && hour < 7) lighting = 'dawn breaking, soft orange glow on horizon, birds beginning to chirp';
  else if (hour >= 7 && hour < 8) lighting = 'dawn transitioning, pre-sunrise glow, birds active';
  else if (hour >= 8 && hour < 9) lighting = 'early morning light, golden hour beginning, sun rising';
  else if (hour >= 9 && hour < 17) lighting = 'full daylight, Provence sun bright';
  else if (hour >= 17 && hour < 19) lighting = 'golden hour, long shadows from Alpilles mountains';
  else if (hour >= 19 && hour < 20) lighting = 'dusk, sky fading to purple';
  else if (hour >= 20 && hour < 21) lighting = 'twilight, house lights turning on';
  else if (hour >= 21 && hour < 24) lighting = 'evening, multiple house lights on, stars emerging';
  
  console.log('[France Formatting] ☀️ Lighting:', { hour, lighting });
  
  return lighting;
}

/**
 * Get weather for Eygalières (Provence) by time of year
 */
export function getEygalieresWeather(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  
  // November weather in Provence
  if (month === 10) { // November
    return Math.random() > 0.7 ? 'light drizzle, clouds' : 'clear, cool night';
  }
  
  // Winter (Dec-Feb)
  if (month >= 11 || month <= 1) {
    return Math.random() > 0.6 ? 'overcast, occasional rain' : 'clear, cold';
  }
  
  // Spring (Mar-May)
  if (month >= 2 && month <= 4) {
    return 'clear, mild, lavender blooming';
  }
  
  // Summer (Jun-Aug)
  if (month >= 5 && month <= 7) {
    return 'clear, hot, cicadas loud';
  }
  
  // Fall (Sep-Oct)
  return 'clear, cooling, golden light';
}

/**
 * Get current temperature in France (placeholder - would use weather API in production)
 * PHASE 4 FIX: Returns Celsius format for France locations
 */
export function getCurrentFranceTemp(): string {
  // Provence average temps (placeholder until weather API integrated)
  const now = new Date();
  const month = now.getMonth(); // 0-11
  
  // Average Provence temperatures by month (in Celsius)
  const avgTemps = [
    10, // Jan
    11, // Feb
    14, // Mar
    16, // Apr
    20, // May
    24, // Jun
    27, // Jul
    27, // Aug
    24, // Sep
    19, // Oct
    14, // Nov
    11  // Dec
  ];
  
  const tempCelsius = avgTemps[month];
  console.log('[France Formatting] 🌡️ Temperature:', { month, tempCelsius, formatted: `${tempCelsius}°C` });
  
  return `${tempCelsius}°C`;
}

/**
 * Get current hour in France (0-23) for real-time background generation
 */
export function getCurrentFranceHour(): number {
  const now = new Date();
  const hour = parseInt(now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Europe/Paris' }));
  return hour;
}

/**
 * Check if it's nighttime in France (for background generation)
 */
export function isNighttimeFrance(): boolean {
  const hour = getCurrentFranceHour();
  return hour >= 20 || hour < 6; // 8 PM - 6 AM is nighttime
}
