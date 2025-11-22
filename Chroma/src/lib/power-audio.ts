/**
 * Power Audio System - Sound Effects for User Powers
 * Allows user to upload custom sound files for powers
 */

export interface PowerSound {
  id: string;
  powerName: string;
  category: 'activation' | 'deactivation' | 'impact';
  audioUrl: string;
  volume: number;
}

// localStorage persistence key
const STORAGE_KEY = 'chroma_power_sounds';

/**
 * Load power sounds from localStorage
 */
function loadPowerSoundsFromStorage(): Map<string, PowerSound> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const map = new Map<string, PowerSound>();
      Object.entries(parsed).forEach(([key, value]) => {
        map.set(key, value as PowerSound);
      });
      console.log(`[Power Audio] 💾 Loaded ${map.size} sounds from storage`);
      return map;
    }
  } catch (err) {
    console.error('[Power Audio] ❌ Failed to load from storage:', err);
  }
  return new Map();
}

/**
 * Save power sounds to localStorage
 */
function savePowerSoundsToStorage(): void {
  try {
    const obj = Object.fromEntries(powerSounds.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    console.log(`[Power Audio] 💾 Saved ${powerSounds.size} sounds to storage`);
  } catch (err) {
    console.error('[Power Audio] ❌ Failed to save to storage:', err);
  }
}

// Initialize from localStorage
const powerSounds: Map<string, PowerSound> = loadPowerSoundsFromStorage();

/**
 * Register a power sound effect
 * @param power - Power name (e.g., 'theworld', 'conquerors', 'geass')
 * @param category - When to play the sound
 * @param url - Public URL from uploaded file
 * @param volume - Volume level (0.0 to 1.0)
 */
export function registerPowerSound(
  power: string, 
  category: 'activation' | 'deactivation' | 'impact', 
  url: string, 
  volume = 0.7
): void {
  const key = `${power}_${category}`;
  powerSounds.set(key, {
    id: key,
    powerName: power,
    category,
    audioUrl: url,
    volume
  });
  
  savePowerSoundsToStorage(); // AUTO-SAVE
  console.log(`[Power Audio] 🔊 Registered sound: ${key} (${url})`);
}

/**
 * Play a power sound effect
 * @param power - Power name
 * @param category - Sound category to play
 */
export function playPowerSound(
  power: string, 
  category: 'activation' | 'deactivation' | 'impact'
): void {
  const key = `${power}_${category}`;
  const sound = powerSounds.get(key);
  
  if (!sound) {
    console.log(`[Power Audio] ℹ️ No sound registered for ${key}`);
    return;
  }

  try {
    const audio = new Audio(sound.audioUrl);
    audio.volume = sound.volume;
    audio.play().catch(err => {
      console.error(`[Power Audio] ❌ Failed to play ${key}:`, err);
    });
    
    console.log(`[Power Audio] 🔊 Playing ${key}`);
  } catch (err) {
    console.error(`[Power Audio] ❌ Error creating audio for ${key}:`, err);
  }
}

/**
 * Get all registered sounds
 */
export function getAllPowerSounds(): PowerSound[] {
  return Array.from(powerSounds.values());
}

/**
 * Get sounds for a specific power
 */
export function getPowerSounds(power: string): PowerSound[] {
  return Array.from(powerSounds.values()).filter(s => s.powerName === power);
}

/**
 * Remove a registered sound
 */
export function unregisterPowerSound(power: string, category: 'activation' | 'deactivation' | 'impact'): void {
  const key = `${power}_${category}`;
  powerSounds.delete(key);
  savePowerSoundsToStorage(); // AUTO-SAVE
  console.log(`[Power Audio] 🗑️ Unregistered sound: ${key}`);
}

/**
 * Clear all registered sounds
 */
export function clearAllPowerSounds(): void {
  powerSounds.clear();
  savePowerSoundsToStorage(); // AUTO-SAVE
  console.log('[Power Audio] 🗑️ Cleared all registered sounds');
}

/**
 * Update volume for a specific sound
 */
export function updateSoundVolume(power: string, category: 'activation' | 'deactivation' | 'impact', volume: number): void {
  const key = `${power}_${category}`;
  const sound = powerSounds.get(key);
  
  if (sound) {
    sound.volume = Math.max(0, Math.min(1, volume)); // Clamp to 0-1
    console.log(`[Power Audio] 🔊 Updated ${key} volume to ${sound.volume}`);
  }
}

/**
 * Check if a sound is registered
 */
export function hasPowerSound(power: string, category: 'activation' | 'deactivation' | 'impact'): boolean {
  const key = `${power}_${category}`;
  return powerSounds.has(key);
}

/**
 * Cleanup function for page unmount
 */
export function cleanupPowerAudio(): void {
  // No active audio instances to clean up (Audio objects are short-lived)
  console.log('[Power Audio] 🧹 Cleanup complete');
}
