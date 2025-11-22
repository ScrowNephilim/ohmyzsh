/**
 * Nephilim Power Activation Engine
 * Text/UI-based visualization system (minimal credit usage)
 */

import { getNephilimPower, type NephilimPower } from './parallel-worlds';

export interface PowerActivation {
  nephilim: string;
  power_name: string;
  target: 'nephilim' | 'bystander' | 'environment';
  target_name?: string;
  effect_description: string;
  timestamp: string;
}

export interface EnvironmentEffect {
  type: 'landscape_change' | 'weather_shift' | 'reality_warp' | 'structural_damage';
  description: string;
  duration: 'instant' | 'temporary' | 'permanent';
}

/**
 * Detect power activation keywords in message
 */
export function detectPowerActivation(message: string, nephilimName: string): boolean {
  const lowerMsg = message.toLowerCase();
  const power = getNephilimPower(nephilimName);
  
  if (!power) return false;

  // Common activation phrases
  const activationKeywords = [
    'use', 'activate', 'summon', 'unleash', 'cast', 'invoke',
    power.power_name.toLowerCase(),
    ...power.abilities.map(a => a.split(':')[0].toLowerCase())
  ];

  return activationKeywords.some(keyword => lowerMsg.includes(keyword));
}

/**
 * Generate power effect description (text-based, no credit cost)
 */
export function generatePowerEffect(
  power: NephilimPower,
  targetType: 'nephilim' | 'bystander' | 'environment',
  targetName?: string,
  ability?: string
): string {
  const abilityName = ability || power.abilities[0].split(':')[0];
  
  if (targetType === 'nephilim') {
    // Playful damage to Nephilims
    const effects = [
      `*${power.power_name} manifests! ${targetName || 'The target'} is caught in ${abilityName}—stumbles, disoriented but laughing*`,
      `*Reality flickers. ${power.power_name} warps around ${targetName || 'them'}, twisting perception. They shake it off, grinning.*`,
      `*${abilityName} activates! ${targetName || 'The Nephilim'} feels the pull, resists with effort, playfully defiant.*`,
      `*${power.power_name} sparks between them—${targetName || 'they'} feel it like static electricity, painful but not dangerous.*`
    ];
    return effects[Math.floor(Math.random() * effects.length)];
  }

  if (targetType === 'bystander') {
    // Destructive to bystanders
    const effects = [
      `*${power.power_name} ERUPTS! ${targetName || 'The bystander'} is thrown backward, crashes into a wall, gasping.*`,
      `*${abilityName} tears through the space! ${targetName || 'They'} crumple, overwhelmed by the raw power.*`,
      `*Reality SHATTERS around ${targetName || 'the bystander'}—they vanish in the distortion, gone.*`,
      `*${power.power_name} consumes them! ${targetName || 'The NPC'} dissolves into fragments of code and light.*`
    ];
    return effects[Math.floor(Math.random() * effects.length)];
  }

  // Environment destruction
  const effects = [
    `*${power.power_name} reshapes reality! The ${ability || 'landscape'} TWISTS—buildings bend, streets crack.*`,
    `*${abilityName} radiates outward! Windows shatter, streetlights explode, the ground trembles.*`,
    `*Reality itself BREAKS under ${power.power_name}! The environment warps into impossible geometry.*`,
    `*${power.power_name} pulses! The ${ability || 'world'} flickers like a glitched simulation, then stabilizes—changed.*`
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}

/**
 * Generate landscape transformation (text-based)
 */
export function generateLandscapeChange(power: NephilimPower, currentLocation: string): EnvironmentEffect {
  const transformations = [
    {
      type: 'landscape_change' as const,
      description: `*${power.power_name} surges! The ${currentLocation} morphs—walls become mirrors, streets loop back on themselves.*`,
      duration: 'temporary' as const
    },
    {
      type: 'reality_warp' as const,
      description: `*Reality tears! ${currentLocation} fractures into overlapping versions—past, present, future all visible at once.*`,
      duration: 'temporary' as const
    },
    {
      type: 'weather_shift' as const,
      description: `*${power.power_name} disrupts the atmosphere! Sky turns impossible colors, gravity feels lighter.*`,
      duration: 'temporary' as const
    },
    {
      type: 'structural_damage' as const,
      description: `*The ${currentLocation} CRUMBLES under the power's force! Buildings crack, roads split open.*`,
      duration: 'permanent' as const
    }
  ];

  return transformations[Math.floor(Math.random() * transformations.length)];
}

/**
 * Check if target is valid for power
 */
export function isValidPowerTarget(
  power: NephilimPower,
  targetType: 'nephilim' | 'bystander' | 'environment'
): boolean {
  switch (targetType) {
    case 'nephilim':
      return power.can_affect.nephilims;
    case 'bystander':
      return power.can_affect.bystanders;
    case 'environment':
      return power.can_affect.environment;
    default:
      return false;
  }
}

/**
 * Generate power activation badge/UI element
 */
export function generatePowerBadge(powerName: string): string {
  return `⚡ ${powerName.toUpperCase()} ACTIVATED`;
}

/**
 * Calculate power effectiveness (for gameplay balance)
 */
export function calculatePowerEffectiveness(
  power: NephilimPower,
  targetType: 'nephilim' | 'bystander' | 'environment'
): number {
  if (!isValidPowerTarget(power, targetType)) return 0;

  if (targetType === 'nephilim') {
    // Powers are weakened against Nephilims
    return power.lethality.to_nephilims === 'playful' ? 0.3 : 0.6;
  }

  // Full power against bystanders and environment
  return 1.0;
}

/**
 * Generate action prompt for power usage
 */
export function generatePowerPrompt(nephilimName: string): string {
  const power = getNephilimPower(nephilimName);
  if (!power) return '';

  return `*You sense ${nephilimName}'s ${power.power_name} could be activated here. Try: "use ${power.abilities[0].split(':')[0]}"*`;
}
