/**
 * Gear 5 Weather Effects System
 * 
 * Handles weather changes triggered by Gear 5 activation and special attacks:
 * - Gear 5 activation: Cloudy/Rainy → Sunny
 * - Gomu Gomu no Kaminari: Sunny → Thunder
 */

import type { EnvironmentState } from './chroma-types';

export interface WeatherTransition {
  from: string;
  to: string;
  description: string;
  particleEffect?: 'none' | 'rain' | 'thunder';
}

/**
 * Change weather when Gear 5 activates
 * Cloudy/Rainy weather clears to sunny
 */
export function applyGear5WeatherEffect(envState: EnvironmentState, isActivating: boolean): {
  newState: EnvironmentState;
  transition: WeatherTransition | null;
} {
  if (!isActivating) {
    return { newState: envState, transition: null };
  }

  // Check if weather needs to change
  const needsChange = envState.weather !== 'clear' && 
                      envState.weather !== 'sunny' &&
                      !envState.weather.toLowerCase().includes('sun');

  if (!needsChange) {
    console.log('[Gear 5 Weather] ☀️ Already sunny, no change needed');
    return { newState: envState, transition: null };
  }

  const previousWeather = envState.weather;
  
  console.log(`[Gear 5 Weather] ☀️ Activating: ${previousWeather} → sunny`);

  const transition: WeatherTransition = {
    from: previousWeather,
    to: 'clear',
    description: `*The clouds part as Gear 5 activates. Sun breaks through. The sky clears, bathed in warm light. Weather shifts from ${previousWeather} to sunny.*`,
    particleEffect: 'none'
  };

  const newState: EnvironmentState = {
    ...envState,
    weather: 'clear',
    lighting: 'bright daylight',
    temperature: envState.temperature // Keep same temperature
  };

  return { newState, transition };
}

/**
 * Change weather when Gomu Gomu no Kaminari is used
 * Sunny → Thunder storm
 * Only works if Gear 5 is active
 */
export function applyKaminariWeatherEffect(envState: EnvironmentState, gear5Active: boolean): {
  newState: EnvironmentState;
  transition: WeatherTransition | null;
} {
  if (!gear5Active) {
    console.log('[Kaminari Weather] ⚠️ Gear 5 not active, cannot trigger thunder');
    return { newState: envState, transition: null };
  }

  // Check if already stormy
  const isAlreadyStorm = envState.weather.toLowerCase().includes('storm') ||
                         envState.weather.toLowerCase().includes('thunder') ||
                         envState.weather.toLowerCase().includes('lightning');

  if (isAlreadyStorm) {
    console.log('[Kaminari Weather] ⚡ Already stormy, no change needed');
    return { newState: envState, transition: null };
  }

  const previousWeather = envState.weather;

  console.log(`[Kaminari Weather] ⚡ Thunder God: ${previousWeather} → storm`);

  const transition: WeatherTransition = {
    from: previousWeather,
    to: 'thunder storm',
    description: '*Dark clouds gather as Thunder God awakens. Sky crackles with electricity. Lightning splits the air. Weather transforms from sunny to violent thunder storm.*',
    particleEffect: 'thunder'
  };

  const newState: EnvironmentState = {
    ...envState,
    weather: 'thunder storm',
    lighting: 'dark storm clouds',
    temperature: envState.temperature
  };

  return { newState, transition };
}

/**
 * Get narration for weather transition
 */
export function getWeatherTransitionNarration(transition: WeatherTransition): string {
  return transition.description;
}

/**
 * Check if weather allows Gear 5 sunny effect
 */
export function canActivateGear5Weather(weather: string): boolean {
  return weather !== 'clear' && 
         weather !== 'sunny' && 
         !weather.toLowerCase().includes('sun');
}

/**
 * Check if weather allows Kaminari thunder effect
 */
export function canActivateKaminariWeather(weather: string, gear5Active: boolean): boolean {
  if (!gear5Active) return false;
  
  return !weather.toLowerCase().includes('storm') &&
         !weather.toLowerCase().includes('thunder') &&
         !weather.toLowerCase().includes('lightning');
}

/**
 * Thunder particle effect CSS class
 */
export function getThunderParticleClass(): string {
  return 'thunder-particles';
}

/**
 * Initialize thunder particles on canvas (if needed)
 * Returns cleanup function
 */
export function initializeThunderParticles(canvasId: string): () => void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.warn('[Thunder Particles] Canvas not found');
    return () => {};
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let animationId: number;
  let lightningBolts: Array<{ x: number; y: number; opacity: number; frame: number }> = [];

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Randomly spawn lightning bolts
    if (Math.random() < 0.02) { // 2% chance per frame
      lightningBolts.push({
        x: Math.random() * canvas.width,
        y: 0,
        opacity: 1,
        frame: 0
      });
    }

    // Draw and update lightning bolts
    lightningBolts = lightningBolts.filter(bolt => {
      bolt.frame++;
      bolt.opacity -= 0.05;

      if (bolt.opacity <= 0) return false;

      // Draw jagged lightning bolt
      ctx.strokeStyle = `rgba(255, 255, 100, ${bolt.opacity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bolt.x, bolt.y);

      let currentX = bolt.x;
      let currentY = bolt.y;
      const segments = 8;
      const segmentHeight = canvas.height / segments;

      for (let i = 0; i < segments; i++) {
        const nextX = currentX + (Math.random() - 0.5) * 50;
        const nextY = currentY + segmentHeight;
        ctx.lineTo(nextX, nextY);
        currentX = nextX;
        currentY = nextY;
      }

      ctx.stroke();

      return true;
    });

    animationId = requestAnimationFrame(animate);
  };

  animate();

  // Cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
