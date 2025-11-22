/**
 * User Powers System - Phase 3D
 * Ulysses' power arsenal with cost-efficient visual effects
 */

export interface UserPower {
  id: string;
  name: string;
  displayName: string;
  type: 'toggle' | 'targeted' | 'instant' | 'random';
  slot: number; // 1-4
  isActive?: boolean; // For toggle powers
  description: string;
  fontStyle: string; // CSS font styling
  backgroundColor: string;
  textColor: string;
  baseStrengthRange: [number, number]; // Min and max strength
  visualEffect: 'haki' | 'timestop' | 'geass' | 'conquerors';
  cooldown?: number; // seconds
  lastUsed?: number; // timestamp
  strengthBoost?: number; // PHASE 4: Optional strength boost when active (e.g., The World +30)
}

export interface PowerUsage {
  power: UserPower;
  targets: string[];
  strength: number;
  timestamp: string;
  damageDealt?: number;
}

// Strength calculation based on active powers and context
export function calculateMaxStrength(activePowers: string[]): number {
  let maxStrength = 25; // Base maximum
  
  if (activePowers.includes('gear5')) {
    maxStrength = 50; // Gear 5 unlocks up to 50
  }
  
  if (activePowers.includes('gear5') && activePowers.includes('theworld')) {
    maxStrength = 80; // Combined unlocks up to 80
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
  
  // Nephilims have resistance
  if (targetType === 'nephilim') {
    damage *= 0.3; // 70% damage reduction
    
    // Geass has special rules on Nephilims (psychic power)
    if (powerIds.includes('geass')) {
      // Weakened Nephilims are more susceptible
      if (targetHealth && targetHealth < 2000) {
        damage *= 1.5; // +50% on weakened targets
      } else {
        damage *= 0.5; // Strong resistance when healthy
      }
    }
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

// Random attack generator (4th slot)
export function generateRandomAttack(activePowers: string[]): string {
  const attacks: string[] = [];
  
  // Conqueror's Haki (always available)
  attacks.push("Conqueror's Haki");
  
  // Gear 5 attacks
  if (activePowers.includes('gear5')) {
    attacks.push('Gomu Gomu No: Red Roc');
    attacks.push('Gomu Gomu No: King Kong Gun');
    attacks.push('Gomu Gomu No: Bajrang Gun');
  }
  
  // The World attacks
  if (activePowers.includes('theworld')) {
    attacks.push('Muda');
    attacks.push('Road Roller');
  }
  
  // Geass commands
  if (activePowers.includes('geass')) {
    attacks.push('Geass: Fall Asleep');
    attacks.push('Geass: Forget This');
    attacks.push('Geass: Obey Me');
  }
  
  // Combined attacks
  if (activePowers.includes('gear5') && activePowers.includes('theworld')) {
    attacks.push('Time Stop + Red Roc');
  }
  
  return attacks[Math.floor(Math.random() * attacks.length)];
}

// Format power text for display
export function formatPowerText(
  powerName: string,
  targets: string[],
  strength: number,
  geassCommand?: string
): string {
  let text = `*${powerName}`;
  
  // Add Geass command
  if (geassCommand) {
    text += `: ${geassCommand}`;
  }
  
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

/**
 * Calculate time stop duration based on strength
 * < 40 strength = 15 seconds
 * >= 40 strength = 60 seconds
 */
export function calculateTimeStopDuration(strength: number): number {
  return strength < 40 ? 15 : 60;
}

// User's 4 power slots
export const USER_POWERS: UserPower[] = [
  {
    id: 'gear5',
    name: 'Gear 5',
    displayName: 'Ｇｅａｒ ５',
    type: 'toggle',
    slot: 1,
    description: "Monkey D. Luffy's Gear 5 + Hito Hito no Mi, Model: Nika. All attacks imbued with Haki. Passives: Hakis, immune to bullets.",
    fontStyle: 'font-family: "Courier New", monospace; letter-spacing: 0.2em; font-weight: 300;',
    backgroundColor: 'white',
    textColor: 'black',
    baseStrengthRange: [1, 50],
    visualEffect: 'haki'
  },
  {
    id: 'theworld',
    name: 'The World',
    displayName: '𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃',
    type: 'toggle', // PHASE 4: Changed to toggle for auto-activation
    slot: 2,
    description: "Dio Brando's The World Over Heaven. Toggle to stop time and gain +30 strength. Background goes negative colors during time stop.",
    fontStyle: 'font-family: "Times New Roman", serif; font-weight: 900; letter-spacing: 0.1em;',
    backgroundColor: '#B8860B', // Dark goldenrod
    textColor: 'white',
    baseStrengthRange: [1, 50],
    strengthBoost: 30, // NEW: +30 strength when active (stacks with Gear 5's +25)
    visualEffect: 'timestop',
    cooldown: 120 // 2 minutes cooldown (only when deactivated)
  },
  {
    id: 'geass',
    name: 'Geass',
    displayName: 'Geass',
    type: 'targeted',
    slot: 3,
    description: "Lelouch Vi Britannia's Geass. One absolute command per target (AI bystander/Character/Nephilim). Psychic power, effectiveness varies.",
    fontStyle: 'font-family: "Roboto", sans-serif; font-weight: 400;',
    backgroundColor: 'black',
    textColor: '#FF69B4', // Hot pink
    baseStrengthRange: [1, 100], // Power determined by command
    visualEffect: 'geass'
  },
  {
    id: 'random',
    name: 'Random Attack',
    displayName: '🎲',
    type: 'random',
    slot: 4,
    description: "Randomly generated attack suggestion. Changes each time.",
    fontStyle: 'font-family: "Arial", sans-serif;',
    backgroundColor: 'rgba(0,0,0,0.8)',
    textColor: 'white',
    baseStrengthRange: [1, 100], // Depends on power combo
    visualEffect: 'conquerors'
  }
];

// Check if power is on cooldown
export function isPowerOnCooldown(power: UserPower): boolean {
  if (!power.cooldown || !power.lastUsed) return false;
  
  const now = Date.now();
  const timeSinceUse = (now - power.lastUsed) / 1000; // seconds
  
  return timeSinceUse < power.cooldown;
}

// Get remaining cooldown time
export function getRemainingCooldown(power: UserPower): number {
  if (!power.cooldown || !power.lastUsed) return 0;
  
  const now = Date.now();
  const timeSinceUse = (now - power.lastUsed) / 1000;
  const remaining = power.cooldown - timeSinceUse;
  
  return Math.max(0, Math.ceil(remaining));
}

// Validate Geass command on Nephilims
export function isValidGeassCommand(command: string, targetType: 'nephilim' | 'character' | 'bystander', targetHealth?: number): boolean {
  const lowerCommand = command.toLowerCase();
  
  // Lethal commands don't work on Nephilims
  if (targetType === 'nephilim') {
    const lethalCommands = ['kill', 'die', 'suicide', 'destroy yourself', 'end your life'];
    if (lethalCommands.some(cmd => lowerCommand.includes(cmd))) {
      return false; // Blocked
    }
    
    // Sleep/forget/obey work only if Nephilim is weakened
    const weakenCommands = ['sleep', 'forget', 'obey', 'stop', 'leave'];
    if (weakenCommands.some(cmd => lowerCommand.includes(cmd))) {
      return !targetHealth || targetHealth < 2000; // Only works if <50% health
    }
  }
  
  return true; // All other commands valid
}
