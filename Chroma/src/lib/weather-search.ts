/**
 * Weather Search Engine - Real-Time Weather Data via Web Search
 * 15-minute cache to minimize API calls
 */

import { webSearch } from '@devvai/devv-code-backend';

export interface WeatherData {
  temperature: number; // Celsius
  condition: string; // "clear", "rain", "snow", "fog", "storm", "cloudy"
  sunrise: string; // "HH:MM" 24-hour format
  sunset: string; // "HH:MM" 24-hour format
  isDaytime: boolean;
  timestamp: number;
}

const weatherCache = new Map<string, WeatherData>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Get real-time weather for a location via web search
 */
export async function getRealtimeWeather(location: string): Promise<WeatherData | null> {
  try {
    // Check cache first
    const cached = weatherCache.get(location);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Weather Search] 📦 Using cached weather for ${location}`);
      return cached;
    }

    console.log(`[Weather Search] 🔍 Fetching weather for ${location}...`);

    // Search for current weather
    const weatherQuery = `${location} current weather temperature condition`;
    const weatherResult = await webSearch.search({ query: weatherQuery });

    // Search for sunrise/sunset times
    const sunQuery = `${location} sunrise sunset times today`;
    const sunResult = await webSearch.search({ query: sunQuery });

    // Parse weather data from search results
    const weatherText = weatherResult.data
      .map(r => `${r.title} ${r.description}`)
      .join(' ')
      .toLowerCase();

    const sunText = sunResult.data
      .map(r => `${r.title} ${r.description}`)
      .join(' ')
      .toLowerCase();

    // Extract temperature (look for °C or °F)
    const tempMatch = weatherText.match(/(-?\d+)\s*°?[cf]/i);
    let temperature = tempMatch ? parseInt(tempMatch[1]) : 15; // Default 15°C

    // Convert Fahrenheit to Celsius if needed
    if (weatherText.includes('°f') || weatherText.includes('fahrenheit')) {
      temperature = Math.round((temperature - 32) * 5 / 9);
    }

    // Extract weather condition
    let condition = 'clear';
    if (weatherText.includes('rain') || weatherText.includes('drizzle') || weatherText.includes('shower')) {
      condition = 'rain';
    } else if (weatherText.includes('storm') || weatherText.includes('thunder') || weatherText.includes('lightning')) {
      condition = 'storm';
    } else if (weatherText.includes('snow') || weatherText.includes('sleet') || weatherText.includes('flurr')) {
      condition = 'snow';
    } else if (weatherText.includes('fog') || weatherText.includes('mist') || weatherText.includes('haze')) {
      condition = 'fog';
    } else if (weatherText.includes('cloud') || weatherText.includes('overcast') || weatherText.includes('gray') || weatherText.includes('grey')) {
      condition = 'cloudy';
    }

    // Extract sunrise/sunset times (HH:MM format)
    const sunriseMatch = sunText.match(/sunrise[:\s]+(\d{1,2}):(\d{2})/i);
    const sunsetMatch = sunText.match(/sunset[:\s]+(\d{1,2}):(\d{2})/i);

    const sunrise = sunriseMatch 
      ? `${sunriseMatch[1].padStart(2, '0')}:${sunriseMatch[2]}` 
      : '07:00'; // Default 7 AM

    const sunset = sunsetMatch 
      ? `${sunsetMatch[1].padStart(2, '0')}:${sunsetMatch[2]}` 
      : '18:00'; // Default 6 PM

    // Calculate if it's daytime
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [sunriseHour, sunriseMin] = sunrise.split(':').map(Number);
    const [sunsetHour, sunsetMin] = sunset.split(':').map(Number);
    const sunriseTime = sunriseHour * 60 + sunriseMin;
    const sunsetTime = sunsetHour * 60 + sunsetMin;

    const isDaytime = currentTime >= sunriseTime && currentTime < sunsetTime;

    const weatherData: WeatherData = {
      temperature,
      condition,
      sunrise,
      sunset,
      isDaytime,
      timestamp: Date.now()
    };

    // Cache the result
    weatherCache.set(location, weatherData);
    
    console.log(`[Weather Search] ✅ Weather data for ${location}:`, weatherData);
    return weatherData;

  } catch (err) {
    console.error(`[Weather Search] ❌ Failed to fetch weather for ${location}:`, err);
    return null;
  }
}

/**
 * Clear weather cache (for testing)
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
  console.log('[Weather Search] 🗑️ Weather cache cleared');
}
