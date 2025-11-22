/**
 * Power Animation & Sound System
 * Cost-efficient attack GIFs using Replicate + sound slider for power effects
 * Focus on: brief duration, color/animation over form complexity, strategic generation
 */

import { replicate } from '@devvai/devv-code-backend';
import type { ReplicateTextToImageModel } from '@devvai/devv-code-backend';

export type PowerType = 
  | 'haki_armament' | 'haki_conqueror' | 'haki_observation'
  | 'gear_5' | 'red_roc' | 'red_pistol' | 'dawn_gatling'
  | 'the_world' | 'geass' | 'random_attack'
  | 'defensive' | 'self_target';

export interface PowerAnimationConfig {
  shouldGenerateGif: boolean; // false for defensive/self-target
  gifDuration: 'brief' | 'medium'; // brief = 2-3s, medium = 4-5s
  colorDominance: string; // Dominant color (e.g., 'red', 'black', 'purple')
  animationStyle: string; // e.g., 'explosive', 'flowing', 'sharp'
  complexityLevel: 'simple' | 'moderate'; // Never 'complex' for cost
  soundEffect: 'impact' | 'whoosh' | 'energy' | 'silence';
}

/**
 * Get animation config for each power type
 */
export function getPowerAnimationConfig(powerType: PowerType): PowerAnimationConfig {
  const configs: Record<PowerType, PowerAnimationConfig> = {
    // Haki attacks - similar style
    haki_armament: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'black with red highlights',
      animationStyle: 'hardening waves',
      complexityLevel: 'simple',
      soundEffect: 'impact'
    },
    haki_conqueror: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'black and red',
      animationStyle: 'shockwave burst',
      complexityLevel: 'moderate',
      soundEffect: 'energy'
    },
    haki_observation: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'purple and blue',
      animationStyle: 'ethereal glow',
      complexityLevel: 'simple',
      soundEffect: 'whoosh'
    },
    
    // Gear 5 attacks
    gear_5: {
      shouldGenerateGif: false, // Toggle, no animation
      gifDuration: 'brief',
      colorDominance: 'white',
      animationStyle: 'clouds',
      complexityLevel: 'simple',
      soundEffect: 'whoosh'
    },
    red_roc: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'red and black',
      animationStyle: 'explosive impact',
      complexityLevel: 'moderate',
      soundEffect: 'impact'
    },
    red_pistol: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'red',
      animationStyle: 'rapid strike',
      complexityLevel: 'simple',
      soundEffect: 'whoosh'
    },
    dawn_gatling: {
      shouldGenerateGif: true,
      gifDuration: 'medium',
      colorDominance: 'gold and red',
      animationStyle: 'barrage of fists',
      complexityLevel: 'moderate',
      soundEffect: 'impact'
    },
    
    // Other powers
    the_world: {
      shouldGenerateGif: false, // Pure UI effect (negative colors)
      gifDuration: 'brief',
      colorDominance: 'yellow',
      animationStyle: 'time stop',
      complexityLevel: 'simple',
      soundEffect: 'whoosh'
    },
    geass: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'hot pink',
      animationStyle: 'psychic waves',
      complexityLevel: 'simple',
      soundEffect: 'energy'
    },
    random_attack: {
      shouldGenerateGif: true,
      gifDuration: 'brief',
      colorDominance: 'varies',
      animationStyle: 'varies',
      complexityLevel: 'simple',
      soundEffect: 'impact'
    },
    
    // Defensive/self-target (NO GIF)
    defensive: {
      shouldGenerateGif: false,
      gifDuration: 'brief',
      colorDominance: 'blue',
      animationStyle: 'shield',
      complexityLevel: 'simple',
      soundEffect: 'whoosh'
    },
    self_target: {
      shouldGenerateGif: false,
      gifDuration: 'brief',
      colorDominance: 'green',
      animationStyle: 'aura',
      complexityLevel: 'simple',
      soundEffect: 'energy'
    }
  };
  
  return configs[powerType];
}

/**
 * Generate attack GIF using Replicate
 * COST CONTROL: Only for offensive attacks, brief duration, simple style
 */
export async function generateAttackGIF(
  powerType: PowerType,
  strengthLevel: number // 1-100
): Promise<string | null> {
  const config = getPowerAnimationConfig(powerType);
  
  // Skip if no GIF needed
  if (!config.shouldGenerateGif) {
    console.log(`[Power Animation] Skipping GIF for ${powerType} (no animation config)`);
    return null;
  }
  
  try {
    // Build prompt emphasizing speed, color, and simplicity
    const prompt = buildAnimationPrompt(powerType, config, strengthLevel);
    
    console.log(`[Power Animation] Generating GIF for ${powerType} (strength: ${strengthLevel})`);
    console.log(`[Power Animation] Prompt: ${prompt}`);
    
    // Use flux-schnell for speed (cheapest, fastest)
    const result = await replicate.textToImage({
      prompt,
      model: 'black-forest-labs/flux-schnell',
      num_outputs: 1,
      aspect_ratio: '16:9',
      output_format: 'png' // Single frame for now (true GIF requires video models)
    });
    
    if (result.images && result.images.length > 0) {
      console.log(`[Power Animation] Generated: ${result.images[0]}`);
      return result.images[0];
    }
    
    return null;
  } catch (error) {
    console.error(`[Power Animation] Error generating GIF:`, error);
    return null;
  }
}

/**
 * Build animation prompt optimized for Replicate
 */
function buildAnimationPrompt(
  powerType: PowerType,
  config: PowerAnimationConfig,
  strength: number
): string {
  // Base style
  let prompt = `Abstract ${config.complexityLevel} animation, dominant color: ${config.colorDominance}, style: ${config.animationStyle}. `;
  
  // Strength affects intensity
  if (strength >= 75) {
    prompt += 'Extremely intense, explosive energy, maximum impact. ';
  } else if (strength >= 50) {
    prompt += 'High intensity, strong energy, clear impact. ';
  } else if (strength >= 25) {
    prompt += 'Moderate intensity, visible energy, controlled power. ';
  } else {
    prompt += 'Low intensity, subtle energy, restrained power. ';
  }
  
  // Power-specific details
  const powerDetails: Record<PowerType, string> = {
    haki_armament: 'Black metallic hardening with red lightning cracks',
    haki_conqueror: 'Black and red shockwave explosion with lightning bolts',
    haki_observation: 'Purple and blue ethereal prediction waves',
    gear_5: 'White fluffy clouds transformation',
    red_roc: 'Red fist with black lightning impact explosion',
    red_pistol: 'Red extended arm with rapid strike motion blur',
    dawn_gatling: 'Golden-red barrage of fist impacts in sequence',
    the_world: 'Yellow time-stop ripple effect',
    geass: 'Hot pink psychic command waves with bird symbol',
    random_attack: 'Dynamic energy burst with varied colors',
    defensive: 'Blue protective barrier shield',
    self_target: 'Green healing aura glow'
  };
  
  prompt += powerDetails[powerType] + '. ';
  
  // Final style constraints
  prompt += 'Minimalist, bold colors, motion blur, no detailed forms, abstract energy only. Clean black background.';
  
  return prompt;
}

/**
 * Sound effect system - slider to navigate existing sounds
 */
export interface PowerSound {
  type: 'activation' | 'deactivation' | 'impact';
  url: string | null; // null if not uploaded
  volume: number; // 0-100
}

export interface PowerSoundLibrary {
  [powerName: string]: {
    activation: PowerSound;
    deactivation: PowerSound;
    impact: PowerSound;
  };
}

/**
 * Get stored power sound library from localStorage
 */
export function getPowerSoundLibrary(): PowerSoundLibrary {
  const stored = localStorage.getItem('power_sound_library');
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Save power sound library to localStorage
 */
export function savePowerSoundLibrary(library: PowerSoundLibrary): void {
  localStorage.setItem('power_sound_library', JSON.stringify(library));
}

/**
 * Register a power sound
 */
export function registerPowerSound(
  powerName: string,
  type: 'activation' | 'deactivation' | 'impact',
  audioUrl: string
): void {
  const library = getPowerSoundLibrary();
  
  if (!library[powerName]) {
    library[powerName] = {
      activation: { type: 'activation', url: null, volume: 70 },
      deactivation: { type: 'deactivation', url: null, volume: 70 },
      impact: { type: 'impact', url: null, volume: 80 }
    };
  }
  
  library[powerName][type].url = audioUrl;
  savePowerSoundLibrary(library);
  
  console.log(`[Power Sound] Registered ${type} sound for ${powerName}`);
}

/**
 * Play power sound (if exists)
 */
export function playPowerSound(
  powerName: string,
  type: 'activation' | 'deactivation' | 'impact'
): void {
  const library = getPowerSoundLibrary();
  const powerSounds = library[powerName];
  
  if (!powerSounds || !powerSounds[type].url) {
    console.log(`[Power Sound] No ${type} sound for ${powerName}`);
    return;
  }
  
  const sound = powerSounds[type];
  const audio = new Audio(sound.url);
  audio.volume = sound.volume / 100;
  
  audio.play().catch(error => {
    console.error(`[Power Sound] Error playing sound:`, error);
  });
  
  console.log(`[Power Sound] Playing ${type} for ${powerName} at ${sound.volume}%`);
}

/**
 * Update sound volume
 */
export function updatePowerSoundVolume(
  powerName: string,
  type: 'activation' | 'deactivation' | 'impact',
  volume: number // 0-100
): void {
  const library = getPowerSoundLibrary();
  if (!library[powerName]) return;
  
  library[powerName][type].volume = Math.max(0, Math.min(100, volume));
  savePowerSoundLibrary(library);
}

/**
 * Get all powers with at least one sound
 */
export function getPowersWithSounds(): string[] {
  const library = getPowerSoundLibrary();
  return Object.keys(library).filter(powerName => {
    const sounds = library[powerName];
    return sounds.activation.url || sounds.deactivation.url || sounds.impact.url;
  });
}

/**
 * Delete power sound
 */
export function deletePowerSound(
  powerName: string,
  type: 'activation' | 'deactivation' | 'impact'
): void {
  const library = getPowerSoundLibrary();
  if (!library[powerName]) return;
  
  library[powerName][type].url = null;
  savePowerSoundLibrary(library);
  
  console.log(`[Power Sound] Deleted ${type} sound for ${powerName}`);
}
