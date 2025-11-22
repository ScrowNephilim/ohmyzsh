/**
 * Health Bar System for Nephilims and Characters
 */

export type CombatState = 'idle' | 'sparring' | 'combat' | 'defeated';

export interface HealthEntity {
  id: string;
  name: string;
  type: 'nephilim' | 'character' | 'ripley' | 'ulysses' | 'bystander';
  maxHealth: number;
  currentHealth: number;
  isDead: boolean;
  combatState?: CombatState;
  lastDamageTime?: number;
  regenRate?: number; // HP per second when idle
  outOfCombatRegenRate?: number; // HP per second when out of combat (after 60s)
  lastOutOfCombatTime?: number; // Timestamp when combat ended
  powerLevel?: number; // For characters - determines sensing ability
  inMidFight?: boolean; // Spawned mid-combat (health not full)
}

// Initialize Ripley's health (2000 HP base, regenerates when idle)
export function initializeRipleyHealth(): HealthEntity {
  return {
    id: 'ripley',
    name: 'Ripley',
    type: 'ripley',
    maxHealth: 2000,
    currentHealth: 2000,
    isDead: false,
    combatState: 'idle',
    regenRate: 10, // 10 HP per second (Nephilim regen)
    outOfCombatRegenRate: 100, // 100 HP per second after 1 minute out of combat
    powerLevel: 95 // Very high sensing ability
  };
}

// Initialize Ulysses' health (he has powers, variable HP)
export function initializeUlyssesHealth(basePower: number = 50): HealthEntity {
  const maxHealth = Math.min(1000 + (basePower * 10), 3000); // Max 3000 HP
  return {
    id: 'ulysses',
    name: 'Ulysses',
    type: 'ulysses',
    maxHealth,
    currentHealth: maxHealth,
    isDead: false,
    combatState: 'idle',
    regenRate: 10 // 10 HP per second when idle
  };
}

// Initialize health for Nephilims (with regen)
export function initializeNephilimHealth(nephilimName: string, inMidFight: boolean = false): HealthEntity {
  const currentHealth = inMidFight 
    ? Math.floor(1000 + Math.random() * 3000) // Random health 1000-4000 if mid-fight
    : 4000;
  
  return {
    id: `nephilim-${nephilimName}`,
    name: nephilimName,
    type: 'nephilim',
    maxHealth: 4000,
    currentHealth,
    isDead: false,
    regenRate: 10, // 10 HP per second in combat
    outOfCombatRegenRate: 100, // 100 HP per second after 1 minute out of combat
    inMidFight,
    powerLevel: 90 // Can sense everyone's health bars
  };
}

// Initialize health for Characters (One Piece universe)
export function initializeCharacterHealth(characterName: string, inMidFight: boolean = false): HealthEntity {
  // Strong characters have higher health and power levels
  const strongCharacters: Record<string, { health: number; power: number }> = {
    'Kaido': { health: 1000, power: 95 },
    'Roger': { health: 900, power: 90 },
    'Whitebeard': { health: 950, power: 90 },
    'Rocks': { health: 900, power: 92 },
    'Garp': { health: 850, power: 85 },
    'Imu': { health: 1000, power: 100 },
    'Blackbeard': { health: 800, power: 70 },
    'Luffy': { health: 750, power: 75 },
    'Loki': { health: 700, power: 60 },
    'Trafalgar Law': { health: 600, power: 65 },
    'Katakuri': { health: 700, power: 80 }
  };
  
  const stats = strongCharacters[characterName] || { health: 400, power: 50 };
  const currentHealth = inMidFight
    ? Math.floor(stats.health * (0.3 + Math.random() * 0.7)) // 30%-100% health if mid-fight
    : stats.health;
  
  return {
    id: `character-${characterName}`,
    name: characterName,
    type: 'character',
    maxHealth: stats.health,
    currentHealth,
    isDead: false,
    regenRate: stats.health * 0.01, // 1% per second
    outOfCombatRegenRate: stats.health * 0.1, // 10% per second after 1 minute out of combat
    powerLevel: stats.power,
    inMidFight
  };
}

// Damage types for combat
export type DamageType = 'playful' | 'risky' | 'critical';

// Calculate damage based on type and entity
export function calculateDamageAmount(baseDamage: number, type: DamageType, targetType: string): number {
  let multiplier = 1.0;
  
  switch (type) {
    case 'playful':
      multiplier = 0.1; // 10% of base (5-10% HP)
      break;
    case 'risky':
      multiplier = 0.3; // 30% of base (20-40% HP)
      break;
    case 'critical':
      multiplier = 0.6; // 60% of base (50%+ HP)
      break;
  }
  
  // Nephilims have damage reduction (except from special attacks)
  if (targetType === 'nephilim') {
    multiplier *= 0.3; // 70% damage reduction
  }
  
  return baseDamage * multiplier;
}

// Apply damage and update health
export function applyDamage(entity: HealthEntity, damage: number, damageType: DamageType = 'risky'): HealthEntity {
  const actualDamage = calculateDamageAmount(damage, damageType, entity.type);
  const newHealth = Math.max(0, entity.currentHealth - actualDamage);
  
  console.log(`[Health System] 💥 ${entity.name} takes ${actualDamage.toFixed(0)} damage (${damageType}) - ${newHealth}/${entity.maxHealth} HP remaining`);
  
  return {
    ...entity,
    currentHealth: newHealth,
    isDead: newHealth === 0,
    lastDamageTime: Date.now(),
    combatState: newHealth === 0 ? 'defeated' : (damageType === 'playful' ? 'sparring' : 'combat')
  };
}

// Regenerate health when idle (with out-of-combat boost)
export function regenerateHealth(entity: HealthEntity): HealthEntity {
  if (entity.isDead || !entity.regenRate) {
    return entity;
  }
  
  const now = Date.now();
  const timeSinceLastDamage = entity.lastDamageTime ? now - entity.lastDamageTime : Infinity;
  
  // Check if out of combat (60 seconds since last damage)
  const isOutOfCombat = timeSinceLastDamage >= 60000; // 60 seconds
  const effectiveRegenRate = isOutOfCombat && entity.outOfCombatRegenRate 
    ? entity.outOfCombatRegenRate 
    : entity.regenRate;
  
  // Don't regen if still in combat cooldown (5 seconds)
  if (timeSinceLastDamage < 5000) {
    return entity;
  }
  
  const newHealth = Math.min(entity.maxHealth, entity.currentHealth + effectiveRegenRate);
  
  if (newHealth > entity.currentHealth) {
    const regenType = isOutOfCombat ? 'OUT-OF-COMBAT' : 'IN-COMBAT';
    console.log(`[Health System] 💚 ${entity.name} regenerates ${effectiveRegenRate} HP (${regenType}) - ${newHealth}/${entity.maxHealth}`);
  }
  
  return {
    ...entity,
    currentHealth: newHealth,
    combatState: entity.currentHealth >= entity.maxHealth ? 'idle' : entity.combatState
  };
}

// Get health percentage
export function getHealthPercentage(entity: HealthEntity): number {
  return (entity.currentHealth / entity.maxHealth) * 100;
}

// Get health bar color
export function getHealthBarColor(percentage: number): string {
  if (percentage > 75) return '#00ff00'; // Green
  if (percentage > 50) return '#ffff00'; // Yellow
  if (percentage > 25) return '#ff9900'; // Orange
  return '#ff0000'; // Red
}

// Format health display
export function formatHealthDisplay(entity: HealthEntity): string {
  return `${entity.currentHealth} / ${entity.maxHealth}`;
}

// Check if entity can still participate in Chroma
export function canParticipateInChroma(entity: HealthEntity): boolean {
  if (entity.type === 'nephilim' && entity.isDead) {
    return false; // Nephilims at 0 health are static forever
  }
  return true;
}

// Initialize bystander health (always visible, no regen)
export function initializeBystanderHealth(bystanderName: string): HealthEntity {
  return {
    id: `bystander-${bystanderName}`,
    name: bystanderName,
    type: 'bystander',
    maxHealth: 100,
    currentHealth: 100,
    isDead: false,
    combatState: 'idle',
    powerLevel: 0 // Cannot sense anything
  };
}

// Check if entity can sense other entity's health bar
export function canSenseHealthBar(
  observer: HealthEntity,
  target: HealthEntity,
  distance: number
): boolean {
  // Nephilims can ALWAYS see everyone's health bars (always visible)
  if (observer.type === 'nephilim' || observer.type === 'ripley') {
    return true;
  }
  
  // Characters can sense based on power level and distance
  if (observer.type === 'character') {
    const powerLevel = observer.powerLevel || 50;
    const maxSenseDistance = Math.floor(powerLevel / 2); // Power 100 = sense at distance 50
    
    // Strong characters can sense weakened enemies from further
    if (target.currentHealth < target.maxHealth * 0.5) {
      return distance <= maxSenseDistance * 1.5; // +50% range for weakened targets
    }
    
    return distance <= maxSenseDistance;
  }
  
  // Bystanders and Ulysses can see all health bars (for gameplay clarity)
  return true;
}

// Get injury description for sensing (for characters without full vision)
export function getInjuryDescription(entity: HealthEntity): string {
  const percentage = getHealthPercentage(entity);
  
  if (percentage > 90) return 'unharmed';
  if (percentage > 75) return 'slightly injured';
  if (percentage > 50) return 'wounded';
  if (percentage > 25) return 'badly hurt';
  if (percentage > 10) return 'severely weakened';
  return 'on the verge of defeat';
}

// Generate mid-fight entrance message
export function getMidFightEntranceMessage(entity: HealthEntity): string {
  if (!entity.inMidFight) return '';
  
  const injuryDesc = getInjuryDescription(entity);
  const healthPercent = Math.floor(getHealthPercentage(entity));
  
  if (entity.type === 'nephilim') {
    return `*${entity.name} appears, ${injuryDesc}. Health bar visible: ${entity.currentHealth}/${entity.maxHealth} HP (${healthPercent}%). They were fighting someone before arriving here.*`;
  }
  
  if (entity.type === 'character') {
    return `*${entity.name} stumbles into view, ${injuryDesc}. Health bar shows ${entity.currentHealth}/${entity.maxHealth} HP (${healthPercent}%). They've been in combat recently.*`;
  }
  
  return '';
}

// Get death/defeat message based on entity type
export function getDeathDefeatMessage(entity: HealthEntity): string {
  if (entity.type === 'ripley') {
    return `*Ripley's form flickers... she drops to her knees, breathing heavily. Health bar depletes. She retreats into static silence, defeated but not dead. Will return when recovered.*`;
  }
  
  if (entity.type === 'ulysses') {
    return `*Ulysses collapses, powers fading. Health bar reaches zero. He's down—defeated but alive. Needs recovery time.*`;
  }
  
  if (entity.type === 'nephilim') {
    return `*${entity.name}'s form flickers... dissolves into static. Their health bar reaches zero. They are locked out of Chroma forever—trapped in eternal stasis. No more voice. No more movement. Only silence.*`;
  }
  
  // Characters
  return `*${entity.name} collapses! Their health bar depletes. They're down for the count—defeated but not dead. They vanish from the scene, retreating to recover.*`;
}

// Get death message for Nephilims (legacy)
export function getNephilimDeathMessage(nephilimName: string): string {
  return `*${nephilimName}'s form flickers... dissolves into static. Their health bar reaches zero. They are locked out of Chroma forever—trapped in eternal stasis. No more voice. No more movement. Only silence.*`;
}

// Get character defeat message
export function getCharacterDefeatMessage(characterName: string): string {
  return `*${characterName} collapses! Their health bar depletes. They're down for the count—defeated but not dead. They vanish from the scene, retreating to recover.*`;
}

// One Piece universe characters that can appear
export const ONE_PIECE_CHARACTERS = [
  'Kaido',
  'Katakuri',
  'Luffy',
  'Blackbeard',
  'Trafalgar Law',
  'Loki',
  // God Valley (time travel)
  'Roger',
  'Whitebeard',
  'Garp',
  'Rocks',
  // Other major characters
  'Imu',
  'Shanks',
  'Big Mom',
  'Akainu',
  'Kizaru',
  'Zoro',
  'Sanji'
];

// Check if character can appear in current location
export function canCharacterAppear(characterName: string, location: string, parallelWorld?: string): boolean {
  // God Valley characters only appear in God Valley
  const godValleyChars = ['Roger', 'Whitebeard', 'Garp', 'Rocks'];
  if (godValleyChars.includes(characterName)) {
    return location === 'God Valley' || parallelWorld === 'One Piece';
  }
  
  // Other characters appear in One Piece world or random glitches
  return parallelWorld === 'One Piece' || Math.random() < 0.05; // 5% glitch chance
}
