/**
 * Weather Transition Engine - Smooth visual transitions between weather states
 * Creates immersive animations when weather changes (rain starting, fog rolling in, etc.)
 * Zero credit cost, pure CSS + Web Audio API
 */

import { environmentalSFX, type WeatherEffect } from './environmental-sfx';

export interface WeatherTransition {
  from: WeatherEffect;
  to: WeatherEffect;
  duration: number; // milliseconds
  animationClass: string;
  description: string;
}

export interface TransitionEffect {
  element: HTMLElement;
  animationClass: string;
  duration: number;
  cleanup: () => void;
}

class WeatherTransitionEngine {
  private activeTransitions: Map<string, TransitionEffect> = new Map();
  private currentWeather: WeatherEffect = 'clear';
  private transitionCallbacks: Array<(from: WeatherEffect, to: WeatherEffect) => void> = [];

  /**
   * Get transition configuration between two weather states
   */
  getTransition(from: WeatherEffect, to: WeatherEffect): WeatherTransition | null {
    const key = `${from}-${to}`;

    const transitions: Record<string, WeatherTransition> = {
      // Rain transitions
      'clear-rain': {
        from: 'clear',
        to: 'rain',
        duration: 3000,
        animationClass: 'weather-rain-starting',
        description: 'Dark clouds roll in... First drops begin to fall...'
      },
      'clear-storm': {
        from: 'clear',
        to: 'storm',
        duration: 4000,
        animationClass: 'weather-storm-building',
        description: 'Thunder rumbles in the distance... Lightning flashes on the horizon...'
      },
      'rain-storm': {
        from: 'rain',
        to: 'storm',
        duration: 2500,
        animationClass: 'weather-storm-intensifying',
        description: 'The rain intensifies... Wind picks up... Thunder crashes!'
      },
      'rain-clear': {
        from: 'rain',
        to: 'clear',
        duration: 3500,
        animationClass: 'weather-rain-stopping',
        description: 'The rain slows to a drizzle... Clouds part... Sun breaks through...'
      },
      'storm-rain': {
        from: 'storm',
        to: 'rain',
        duration: 3000,
        animationClass: 'weather-storm-calming',
        description: 'Thunder fades into the distance... The storm passes... Rain softens...'
      },
      'storm-clear': {
        from: 'storm',
        to: 'clear',
        duration: 4000,
        animationClass: 'weather-storm-ending',
        description: 'Lightning subsides... Clouds break apart... Calm returns...'
      },

      // Fog transitions
      'clear-fog': {
        from: 'clear',
        to: 'fog',
        duration: 5000,
        animationClass: 'weather-fog-rolling',
        description: 'Mist begins to form... Visibility drops... Fog rolls in slowly...'
      },
      'fog-clear': {
        from: 'fog',
        to: 'clear',
        duration: 4000,
        animationClass: 'weather-fog-lifting',
        description: 'The fog thins... Shapes emerge... Air clears...'
      },
      'rain-fog': {
        from: 'rain',
        to: 'fog',
        duration: 3000,
        animationClass: 'weather-rain-to-fog',
        description: 'Rain fades... Moisture lingers... Fog settles in...'
      },

      // Snow transitions
      'clear-snow': {
        from: 'clear',
        to: 'snow',
        duration: 4000,
        animationClass: 'weather-snow-beginning',
        description: 'Temperature drops... First flakes drift down... Snow begins to fall...'
      },
      'snow-clear': {
        from: 'snow',
        to: 'clear',
        duration: 3500,
        animationClass: 'weather-snow-melting',
        description: 'Flakes slow... Sun emerges... Snow melts away...'
      },
      'fog-snow': {
        from: 'fog',
        to: 'snow',
        duration: 3000,
        animationClass: 'weather-fog-to-snow',
        description: 'Fog crystallizes... Temperature plummets... Snow begins...'
      },

      // Wind transitions
      'clear-wind': {
        from: 'clear',
        to: 'wind',
        duration: 2500,
        animationClass: 'weather-wind-picking-up',
        description: 'A breeze stirs... Wind builds... Gusts howl...'
      },
      'wind-clear': {
        from: 'wind',
        to: 'clear',
        duration: 2500,
        animationClass: 'weather-wind-dying',
        description: 'Wind weakens... Gusts fade... Calm returns...'
      },
      'wind-storm': {
        from: 'wind',
        to: 'storm',
        duration: 3000,
        animationClass: 'weather-wind-to-storm',
        description: 'Wind grows violent... Thunder joins... Storm arrives!'
      }
    };

    return transitions[key] || null;
  }

  /**
   * Perform smooth transition between weather states
   */
  async transitionTo(
    newWeather: WeatherEffect,
    containerElement: HTMLElement,
    options: {
      skipAnimation?: boolean;
      onComplete?: () => void;
    } = {}
  ): Promise<void> {
    const from = this.currentWeather;
    const to = newWeather;

    // Same weather, no transition
    if (from === to) {
      options.onComplete?.();
      return;
    }

    console.log(`[WeatherTransitions] 🌦️ Transitioning: ${from} → ${to}`);

    const transition = this.getTransition(from, to);

    if (!transition || options.skipAnimation) {
      // Instant change without animation
      this.currentWeather = to;
      this.notifyCallbacks(from, to);
      await this.updateEnvironmentalSounds(to);
      options.onComplete?.();
      return;
    }

    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = `weather-transition-overlay ${transition.animationClass}`;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    `;
    containerElement.appendChild(overlay);

    // Show transition description
    const description = document.createElement('div');
    description.className = 'weather-transition-text';
    description.textContent = transition.description;
    description.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
      font-family: 'Times New Roman', serif;
      font-style: italic;
      text-align: center;
      pointer-events: none;
      z-index: 10;
      animation: fade-in-out ${transition.duration}ms ease-in-out;
      text-shadow: 0 0 20px rgba(0, 0, 0, 0.9), 2px 2px 4px rgba(0, 0, 0, 1);
      max-width: 80%;
      line-height: 1.6;
    `;
    containerElement.appendChild(description);

    // Store active transition
    const transitionId = `${from}-${to}-${Date.now()}`;
    const effect: TransitionEffect = {
      element: overlay,
      animationClass: transition.animationClass,
      duration: transition.duration,
      cleanup: () => {
        overlay.remove();
        description.remove();
      }
    };
    this.activeTransitions.set(transitionId, effect);

    // Gradually fade environmental sounds
    await this.crossfadeEnvironmentalSounds(from, to, transition.duration);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, transition.duration));

    // Cleanup
    effect.cleanup();
    this.activeTransitions.delete(transitionId);

    // Update current weather
    this.currentWeather = to;
    this.notifyCallbacks(from, to);

    console.log(`[WeatherTransitions] ✅ Transition complete: ${from} → ${to}`);
    options.onComplete?.();
  }

  /**
   * Crossfade environmental sounds during weather transition
   */
  private async crossfadeEnvironmentalSounds(
    from: WeatherEffect,
    to: WeatherEffect,
    duration: number
  ): Promise<void> {
    // Stop old weather sounds with fade-out
    // (Environmental SFX engine will handle this internally)
    
    // Wait for middle of transition
    await new Promise(resolve => setTimeout(resolve, duration / 2));

    // Start new weather sounds with fade-in
    await this.updateEnvironmentalSounds(to);
  }

  /**
   * Update environmental sounds for new weather
   */
  private async updateEnvironmentalSounds(weather: WeatherEffect): Promise<void> {
    // Map weather to environmental SFX
    switch (weather) {
      case 'rain':
        await environmentalSFX.playRain(0.6);
        break;
      case 'storm':
        await environmentalSFX.playRain(0.9);
        await environmentalSFX.playWind(0.7);
        break;
      case 'wind':
        await environmentalSFX.playWind(0.5);
        break;
      case 'fog':
        await environmentalSFX.playWind(0.2);
        break;
      case 'snow':
        await environmentalSFX.playWind(0.3);
        break;
      case 'clear':
        // Clear has no specific sounds, handled by time/location
        break;
    }
  }

  /**
   * Register callback for weather changes
   */
  onWeatherChange(callback: (from: WeatherEffect, to: WeatherEffect) => void): () => void {
    this.transitionCallbacks.push(callback);
    return () => {
      const index = this.transitionCallbacks.indexOf(callback);
      if (index > -1) {
        this.transitionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(from: WeatherEffect, to: WeatherEffect): void {
    this.transitionCallbacks.forEach(cb => cb(from, to));
  }

  /**
   * Get current weather
   */
  getCurrentWeather(): WeatherEffect {
    return this.currentWeather;
  }

  /**
   * Set current weather without transition (for initialization)
   */
  setWeatherImmediate(weather: WeatherEffect): void {
    this.currentWeather = weather;
  }

  /**
   * Cancel all active transitions
   */
  cancelAll(): void {
    this.activeTransitions.forEach(effect => effect.cleanup());
    this.activeTransitions.clear();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.cancelAll();
    this.transitionCallbacks = [];
  }
}

export const weatherTransitions = new WeatherTransitionEngine();
