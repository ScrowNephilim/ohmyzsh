/**
 * User Powers System - Phase 5: Rocks D. Xebec Powers
 * Complete power system overhaul with unlimited actions
 */

export interface UserPower {
  id: string;
  name: string;
  displayName: string;
  type: 'toggle' | 'targeted' | 'instant' | 'utility';
  slot: number; // 0=base attacks (always visible), 1-4 (slot 4 has 4 sub-buttons)
  isActive?: boolean; // For toggle powers
  description: string;
  fontStyle: string; // CSS font styling
  backgroundColor: string;
  textColor: string;
  baseStrengthRange: [number, number]; // Min and max strength
  visualEffect: 'haki' | 'timestop' | 'supreme-haki' | 'katana' | 'observation' | 'pandemonium' | 'darkness' | 'armament' | 'conquerors' | 'muda' | 'thunder';
  cooldown?: 'bubbles' | 'time'; // 'bubbles' = count messages, 'time' = seconds
  cooldownAmount?: number; // Number of bubbles or seconds
  lastUsed?: number; // Bubble count or timestamp
  strengthBoost?: number; // Optional strength boost when active
  mutuallyExclusive?: string[]; // Power IDs that cannot be active simultaneously
  duration?: number; // For timed effects (e.g., 闇 30s prison)
  range?: number; // Attack range (10=base, 20=medium, 30=long)
  selfTargetOnly?: boolean; // True for defense/healing powers
  weatherEffect?: 'sunny' | 'thunder'; // Weather change when activated
  requiresSeppukuConfirmation?: boolean; // Self-targeting requires seppuku confirmation (uchigatana moves)
  synergiesWith?: string[]; // Power IDs that create powerful combinations
}

export interface PowerUsage {
  power: UserPower;
  targets: string[];
  strength: number;
  timestamp: string;
  damageDealt?: number;
}

// Bubble counter for cooldown tracking
let totalBubbleCount = 0;

export function incrementBubbleCount() {
  totalBubbleCount++;
  console.log(`[Cooldown Tracker] 🗨️ Bubble count incremented: ${totalBubbleCount}`);
}

export function getTotalBubbleCount(): number {
  return totalBubbleCount;
}

export function resetBubbleCount() {
  totalBubbleCount = 0;
  console.log('[Cooldown Tracker] 🔄 Bubble count reset');
}

// Strength calculation based on active powers and context
export function calculateMaxStrength(activePowers: string[]): number {
  let maxStrength = 25; // Base maximum
  
  if (activePowers.includes('gear5')) {
    maxStrength = 50; // Gear 5 unlocks up to 50
  }
  
  if (activePowers.includes('coloroftheking')) {
    maxStrength = 60; // Color of the King unlocks up to 60
  }
  
  if (activePowers.includes('gear5') && activePowers.includes('theworld')) {
    maxStrength = 80; // Gear 5 + The World unlocks up to 80
  }
  
  if (activePowers.includes('coloroftheking') && activePowers.includes('theworld')) {
    maxStrength = 100; // Color of the King + The World unlocks up to 100
  }
  
  return maxStrength;
}

// Contextual damage calculation (power doesn't equate flat damage)
export function calculateDamage(
  strength: number,
  targetType: 'nephilim' | 'character' | 'bystander' | 'environment',
  targetName: string,
  powerIds: string[],
  targetHealth?: number
): number {
  // Base damage from strength
  let damage = strength * 10;
  
  // 廃止 (Uchigatana) deals extreme damage
  if (powerIds.includes('haishi')) {
    damage *= 2.0; // Double damage for katana attacks
    
    // Can severely damage even Nephilims
    if (targetType === 'nephilim') {
      damage *= 1.5; // +50% against Nephilims (bypasses some resistance)
    }
  }
  
  // Nephilims have resistance (unless hit by 廃止)
  if (targetType === 'nephilim' && !powerIds.includes('haishi')) {
    damage *= 0.3; // 70% damage reduction
  }
  
  // Characters have varying resistance
  if (targetType === 'character') {
    // Strong characters (e.g., Kaido, Roger) resist more
    const strongCharacters = ['Kaido', 'Roger', 'Whitebeard', 'Rocks', 'Garp', 'Imu'];
    if (strongCharacters.includes(targetName)) {
      damage *= 0.6; // 40% reduction
    } else {
      damage *= 0.8; // 20% reduction
    }
  }
  
  // Bystanders have no resistance (instant KO at any strength)
  if (targetType === 'bystander') {
    return 9999; // Always lethal
  }
  
  // Environment has no health bar
  if (targetType === 'environment') {
    return 0; // No damage, only visual effects
  }
  
  // Add randomness for realism
  const variance = 0.9 + Math.random() * 0.2; // ±10%
  return Math.floor(damage * variance);
}

// Format power text for display
export function formatPowerText(
  powerName: string,
  targets: string[],
  strength: number
): string {
  let text = `*${powerName}`;
  
  // Add targets
  if (targets.length > 0) {
    text += ` → ${targets.join(', ')}`;
  }
  
  text += `*`;
  
  // Always show strength indicator
  text += ` [${strength}]`;
  
  return text;
}

// Get strength text size and style
export function getStrengthStyle(strength: number): { fontSize: string; fontWeight: string; color: string; background: string } {
  if (strength >= 50) {
    return { 
      fontSize: '20pt', 
      fontWeight: '900', 
      color: 'white',
      background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' // Deep red gradient
    };
  }
  
  if (strength >= 26) {
    return { 
      fontSize: '16pt', 
      fontWeight: '700', 
      color: 'black',
      background: '#DC143C' // Crimson red
    };
  }
  
  return { 
    fontSize: '12pt', 
    fontWeight: '400', 
    color: 'white',
    background: 'rgba(0,0,0,0.5)' // Subtle dark background
  };
}

// User's power slots (PHASE 5 OVERHAUL)
export const USER_POWERS: UserPower[] = [
  // SLOT 0: BASE ATTACKS (ALWAYS AVAILABLE)
  
  // Base Attack 1: Armament Koka (Defense Boost)
  {
    id: 'armament_koka',
    name: 'Armament Koka',
    displayName: '🛡️',
    type: 'instant',
    slot: 0,
    description: "Armament Haki (Koka) - harden skin/body with black armor. Self-target only. Increases defense temporarily.",
    fontStyle: 'font-family: monospace; font-weight: 700;',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    baseStrengthRange: [1, 100],
    visualEffect: 'armament',
    range: 10,
    selfTargetOnly: true
  },
  
  // Base Attack 2: Joy Boy's 結ぶ Supreme King Haki
  {
    id: 'conquerors_haki',
    name: "Joy Boy's Supreme King Haki",
    displayName: '結ぶ',
    type: 'targeted',
    slot: 0,
    description: "Joy Boy's Supreme King Haki - Bind and unleash. AOE knockback that staggers multiple enemies.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 900;',
    backgroundColor: 'linear-gradient(to bottom, #000000, #8B0000)', // Black to red gradient
    textColor: 'hsl(220, 100%, 50%)', // Royal blue
    baseStrengthRange: [1, 100],
    visualEffect: 'conquerors',
    range: 20 // Medium range AOE
  },
  
  // Base Attack 3: Uchigatana Range Slash (廃止 - Long Distance)
  {
    id: 'uchigatana_slash',
    name: 'Uchigatana Slash',
    displayName: '廃止',
    type: 'targeted',
    slot: 0,
    description: "Uchigatana range slash like Mihawk or Ichigo. Long-distance cutting wave. Self-targeting requires seppuku confirmation.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 700;',
    backgroundColor: '#000000',
    textColor: '#00FFFF', // Light cyan
    baseStrengthRange: [1, 100],
    visualEffect: 'katana',
    range: 20, // Long range slash
    requiresSeppukuConfirmation: true // Self-targeting requires confirmation
  },
  
  // Base Attack 4: Muda (Dual Mode: Attack or Heal)
  {
    id: 'muda',
    name: 'Muda',
    displayName: '無駄',
    type: 'targeted',
    slot: 0,
    description: "Dual mode attack/heal. Targeted: rapid punch barrage. Self-targeted: vampiric regeneration.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 700;',
    backgroundColor: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', // Gold to dark gold
    textColor: '#FFFFFF',
    baseStrengthRange: [1, 100],
    visualEffect: 'muda',
    range: 10 // Close range
  },
  
  // SLOT 1: Gear 5 (Added range for attacks)
  {
    id: 'gear5',
    name: 'Gear 5',
    displayName: 'Ｇｅａｒ ５',
    type: 'toggle',
    slot: 1,
    description: "Monkey D. Luffy's Gear 5 + Hito Hito no Mi, Model: Nika. All attacks imbued with Haki. Passives: Hakis, immune to bullets. Gear 5 attacks have 30 range (stronger closer).",
    fontStyle: 'font-family: "Courier New", monospace; letter-spacing: 0.2em; font-weight: 300;',
    backgroundColor: 'white',
    textColor: 'black',
    baseStrengthRange: [1, 50],
    visualEffect: 'haki',
    strengthBoost: 25,
    mutuallyExclusive: ['coloroftheking'], // Cannot be active with Color of the King's Haki
    range: 30, // Gear 5 attacks have long range
    synergiesWith: ['theworld'] // Gear 5 + The World = devastating combo (80 max strength)
  },
  
  // SLOT 1B: Gomu Gomu no Kaminari (⚡ 雷) - Thunder God Attack (GEAR 5 REQUIRED)
  {
    id: 'kaminari',
    name: 'Gomu Gomu no Kaminari',
    displayName: '⚡ 雷',
    type: 'targeted',
    slot: 1, // Appears next to Gear 5 when active
    description: "Gomu Gomu no Kaminari - Thunder God attack. Triggers sunny→thunder weather. Only available when Gear 5 active. Range 30.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 700;',
    backgroundColor: '#1a1a1a',
    textColor: '#FFD700', // Gold
    baseStrengthRange: [40, 80],
    visualEffect: 'thunder',
    range: 30,
    weatherEffect: 'thunder' // Triggers sunny→thunder weather
  },
  
  // SLOT 2: The World (MAJOR CHANGES)
  {
    id: 'theworld',
    name: 'The World',
    displayName: '𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃',
    type: 'toggle',
    slot: 2,
    description: "Dio Brando's The World Over Heaven. Toggle to stop time for 60s and gain +30 strength. Auto-deactivates after 60s or when you type. Background goes negative colors during time stop.",
    fontStyle: 'font-family: "Times New Roman", serif; font-weight: 900; letter-spacing: 0.1em;',
    backgroundColor: '#B8860B', // Dark goldenrod
    textColor: 'white',
    baseStrengthRange: [1, 50],
    strengthBoost: 30,
    visualEffect: 'timestop',
    cooldown: 'bubbles',
    cooldownAmount: 5, // 5 chat bubbles after deactivation
    duration: 60, // Fixed 60 seconds
    synergiesWith: ['gear5', 'coloroftheking'] // The World + Gear 5 = 80 strength, The World + Color of the King = 100 strength
  },
  
  // SLOT 3: Color of the King's Haki (NEW - REPLACES GEASS)
  {
    id: 'coloroftheking',
    name: "Color of the King's Haki",
    displayName: "𝐑𝐨𝐜𝐤𝐬 𝐃. 𝐗𝐞𝐛𝐞𝐜", // Make visible with bold serif
    type: 'toggle',
    slot: 3,
    description: "Rocks D. Xebec's supreme Conqueror's Haki - imbues weapons and body with the King's power. Stronger than Shanks, Prime Garp, and Prime Roger. Cannot be active with Gear 5.",
    fontStyle: 'font-family: "Times New Roman", serif; font-weight: 900; letter-spacing: 0.05em;',
    backgroundColor: 'linear-gradient(135deg, #8B0000 0%, #000000 100%)', // Deep red to black
    textColor: '#DC143C', // Crimson red text
    baseStrengthRange: [1, 60],
    strengthBoost: 40,
    visualEffect: 'supreme-haki',
    mutuallyExclusive: ['gear5'], // Cannot be active with Gear 5
    synergiesWith: ['theworld'] // Color of the King + The World = 100 max strength (ultimate combination)
  },
  
  // SLOT 4A: Aufhebung (Uchigatana):Xebec's Supreme King Haki
  {
    id: 'haishi',
    name: 'Aufhebung (Uchigatana):Xebec\'s Supreme King Haki',
    displayName: '廃止',
    type: 'targeted',
    slot: 4,
    description: "Uchigatana imbued with Rocks D. Xebec's Supreme Conqueror's Haki. Black lightning flows from blade. Can severely damage even Nephilims. Self-targeting requires seppuku confirmation.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 900; letter-spacing: 0.1em;',
    backgroundColor: 'black',
    textColor: '#DC143C', // Crimson red
    baseStrengthRange: [1, 100],
    visualEffect: 'katana',
    cooldown: 'bubbles',
    cooldownAmount: 5, // 5 chat bubbles after use
    range: 20, // Rocks' attacks have medium range
    requiresSeppukuConfirmation: true // Self-targeting requires confirmation
  },
  
  // SLOT 4B: 心綱 (Observation Haki)
  {
    id: 'shinkou',
    name: '心綱',
    displayName: '心綱',
    type: 'utility',
    slot: 4,
    description: "Observation Haki - predicts the next 3 actions from targets. No cooldown, can use repeatedly. Range 20.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 400;',
    backgroundColor: 'black',
    textColor: 'white',
    baseStrengthRange: [1, 1], // Always strength 1 (utility, no damage)
    visualEffect: 'observation',
    range: 20
  },
  
  // SLOT 4C: 深淵 (Pandemonium)
  {
    id: 'shin_en',
    name: '深淵',
    displayName: '深淵',
    type: 'targeted',
    slot: 4,
    description: "Pandemonium - Rocks D. Xebec's signature devastation ability. Massive area damage and environmental destruction. Range 20 (stronger closer).",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 700;',
    backgroundColor: 'linear-gradient(135deg, #8B0000 0%, #FF4500 100%)', // Dark red to orange-red
    textColor: 'white',
    baseStrengthRange: [1, 100],
    visualEffect: 'pandemonium',
    range: 20
  },
  
  // SLOT 4D: 闇 (Darkness - Yami Yami no Mi)
  {
    id: 'yami',
    name: '闇',
    displayName: '闇',
    type: 'targeted',
    slot: 4,
    description: "Darkness - Yami Yami no Mi abilities condensed. First click: imprison targets in black hole (30s). Second click: Kurouzu (pull 20 proximity closer). Self-target: hide in shadows (30s). Liberation damage on countdown end. Range 20.",
    fontStyle: 'font-family: "Noto Serif JP", serif; font-weight: 500;',
    backgroundColor: 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)', // Light purple to indigo
    textColor: 'black',
    baseStrengthRange: [1, 100],
    visualEffect: 'darkness',
    duration: 30, // 30 seconds prison duration
    range: 20
  }
];

// Check if power is on cooldown (bubble-based)
export function isPowerOnCooldown(power: UserPower): boolean {
  if (power.cooldown !== 'bubbles' || !power.cooldownAmount || !power.lastUsed) return false;
  
  const bubblesElapsed = totalBubbleCount - power.lastUsed;
  return bubblesElapsed < power.cooldownAmount;
}

// Get remaining cooldown bubbles
export function getRemainingCooldownBubbles(power: UserPower): number {
  if (power.cooldown !== 'bubbles' || !power.cooldownAmount || !power.lastUsed) return 0;
  
  const bubblesElapsed = totalBubbleCount - power.lastUsed;
  const remaining = power.cooldownAmount - bubblesElapsed;
  
  return Math.max(0, remaining);
}

// Check mutual exclusivity
export function canActivatePower(powerId: string, activePowers: string[]): { canActivate: boolean; reason?: string } {
  const power = USER_POWERS.find(p => p.id === powerId);
  if (!power) return { canActivate: false, reason: 'Power not found' };
  
  // Check mutual exclusivity
  if (power.mutuallyExclusive) {
    for (const exclusiveId of power.mutuallyExclusive) {
      if (activePowers.includes(exclusiveId)) {
        const exclusivePower = USER_POWERS.find(p => p.id === exclusiveId);
        return {
          canActivate: false,
          reason: `Cannot activate both ${power.name} and ${exclusivePower?.name}`
        };
      }
    }
  }
  
  // Check cooldown
  if (isPowerOnCooldown(power)) {
    const remaining = getRemainingCooldownBubbles(power);
    return {
      canActivate: false,
      reason: `On cooldown: ${remaining} bubble${remaining > 1 ? 's' : ''} remaining`
    };
  }
  
  return { canActivate: true };
}

/**
 * Check if target is in range based on proximity (logarithmic scale)
 * Range values are NOT meters - they're logarithmic distance thresholds
 * Range 10 = ~10m, Range 20 = ~1km, Range 30 = ~20km
 */
export function isTargetInRange(
  targetName: string,
  targetProximity: number,
  powerRange?: number
): { inRange: boolean; reason?: string } {
  // No range limit (self-target powers or unlimited range)
  if (!powerRange) return { inRange: true };
  
  // Self-target always in range
  if (targetName.toLowerCase() === 'ulysses' || targetName.toLowerCase() === 'self') {
    return { inRange: true };
  }
  
  // Environment targets always in range
  if (targetName.toLowerCase() === 'environment') {
    return { inRange: true };
  }
  
  // Check if target proximity is within power range
  // Lower proximity value = closer distance
  // Range is logarithmic threshold, NOT linear meters
  if (targetProximity > powerRange) {
    const approximateKm = distanceToApproximateKm(targetProximity);
    return {
      inRange: false,
      reason: `${targetName} is too far away (distance ~${approximateKm}). This power has range ${powerRange} (~${distanceToApproximateKm(powerRange)} max).`
    };
  }
  
  return { inRange: true };
}

/**
 * Convert logarithmic proximity to approximate real-world distance description
 * This is NOT meters - proximity is logarithmic scale (0-100)
 */
function distanceToApproximateKm(proximity: number): string {
  if (proximity === 0) return '0m';
  if (proximity < 5) return '<1m';
  if (proximity < 10) return '~10m';
  if (proximity < 20) return '~100m';
  if (proximity < 30) return '~1km';
  if (proximity < 40) return '~5km';
  if (proximity < 50) return '~20km';
  if (proximity < 60) return '~50km';
  if (proximity < 70) return '~100km';
  if (proximity < 80) return '~300km';
  if (proximity < 90) return '~800km';
  if (proximity < 100) return '~2000km';
  return '>5000km';
}

/**
 * Get power combination synergy description
 */
export function getPowerCombinationDescription(activePowers: string[]): string | null {
  // Gear 5 + The World = 80 max strength
  if (activePowers.includes('gear5') && activePowers.includes('theworld')) {
    return '⚡🌍 Gear 5 + The World: Time-stopped rubber reality warping (80 max strength)';
  }
  
  // Color of the King + The World = 100 max strength (ULTIMATE)
  if (activePowers.includes('coloroftheking') && activePowers.includes('theworld')) {
    return '👑🌍 Color of the King + The World: Supreme Conqueror frozen in time (100 MAX STRENGTH!)';
  }
  
  return null;
}
