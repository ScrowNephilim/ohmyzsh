/**
 * Contextual Targeting System - Phase 4
 * Range-based targeting with location-specific environmental targets
 */

import type { NephilimCharacter } from './chroma-types';
import type { LocationPreset } from './chroma-locations';
import { getProximityDescription, distanceToKilometers } from './nephilim-proximity';

export interface Target {
  name: string;
  type: 'nephilim' | 'character' | 'bystander' | 'environment';
  distance: number; // 0-100 (only for nephilims/characters)
  description: string;
  icon?: string; // Visual icon identifier
}

/**
 * Get all available targets based on range, location, and context
 */
export function getAvailableTargets(
  nephilims: NephilimCharacter[],
  proximities: Map<string, number>,
  location: LocationPreset,
  bystandersPresent: boolean = false
): Target[] {
  const targets: Target[] = [];
  
  // 1. Nephilims in range (distance < 30)
  nephilims.forEach(n => {
    const distance = proximities.get(n.nephilim_name) || 100;
    if (distance < 30) {
      targets.push({
        name: n.nephilim_name,
        type: 'nephilim',
        distance,
        description: `${n.nephilim_name} (${getProximityDescription(distance)})`,
        icon: 'N'
      });
    }
  });
  
  // 2. One Piece characters (if in parallel world)
  if (location.parallel_world_id === 'one_piece') {
    // Characters always nearby when they appear (5% glitch chance)
    const onePieceCharacters = ['Kaido', 'Roger', 'Whitebeard', 'Rocks', 'Garp'];
    // Randomly add 1-2 characters (5% chance)
    if (Math.random() < 0.05) {
      const randomChar = onePieceCharacters[Math.floor(Math.random() * onePieceCharacters.length)];
      targets.push({
        name: randomChar,
        type: 'character',
        distance: 5,
        description: randomChar,
        icon: 'C'
      });
    }
  }
  
  // 3. Bystanders (if present in environment)
  if (bystandersPresent) {
    targets.push({
      name: 'bystanders',
      type: 'bystander',
      distance: 5,
      description: 'People nearby',
      icon: 'B'
    });
  }
  
  // 4. Environmental targets (location-specific)
  const envTarget = getEnvironmentalTarget(location);
  if (envTarget) {
    targets.push(envTarget);
  }
  
  return targets;
}

/**
 * Get location-specific environmental target
 */
export function getEnvironmentalTarget(location: LocationPreset): Target | null {
  const environmentalTargets: Record<string, Target> = {
    // Paris
    'paris_concorde': { 
      name: 'Concorde Obelisk', 
      type: 'environment', 
      distance: 0,
      description: 'Ancient Egyptian obelisk',
      icon: 'E'
    },
    'paris_seine': { 
      name: 'Seine River', 
      type: 'environment', 
      distance: 0,
      description: 'Flowing water',
      icon: 'E'
    },
    'paris_cafe': { 
      name: 'Café Interior', 
      type: 'environment', 
      distance: 0,
      description: 'Tables and chairs',
      icon: 'E'
    },
    
    // Chicago
    'chicago_streets': { 
      name: 'Street Buildings', 
      type: 'environment', 
      distance: 0,
      description: 'Surrounding buildings',
      icon: 'E'
    },
    'chicago_lakefront': { 
      name: 'Lake Michigan', 
      type: 'environment', 
      distance: 0,
      description: 'Vast water body',
      icon: 'E'
    },
    'underground_club': { 
      name: 'Club Interior', 
      type: 'environment', 
      distance: 0,
      description: 'Dance floor and walls',
      icon: 'E'
    },
    'chicago_diner': {
      name: 'Diner Interior',
      type: 'environment',
      distance: 0,
      description: 'Tables and kitchen',
      icon: 'E'
    },
    
    // Hauts-de-Seine
    'hauts_de_seine': { 
      name: 'HLM Towers', 
      type: 'environment', 
      distance: 0,
      description: 'Concrete apartment buildings',
      icon: 'E'
    },
    
    // Eygalières
    'eygalieres_house': { 
      name: 'Stone House', 
      type: 'environment', 
      distance: 0,
      description: 'Provençal architecture',
      icon: 'E'
    },
    'eygalieres': { 
      name: 'Lavender Fields', 
      type: 'environment', 
      distance: 0,
      description: 'Fields of lavender',
      icon: 'E'
    },
    
    // Parallel Worlds
    'thousand_sunny': {
      name: 'Ship Deck',
      type: 'environment',
      distance: 0,
      description: 'Wooden ship structure',
      icon: 'E'
    },
    'wano_streets': {
      name: 'Japanese Buildings',
      type: 'environment',
      distance: 0,
      description: 'Traditional architecture',
      icon: 'E'
    },
    'mementos': {
      name: 'Metaverse Walls',
      type: 'environment',
      distance: 0,
      description: 'Distorted reality',
      icon: 'E'
    }
  };
  
  return environmentalTargets[location.id] || {
    name: 'Surroundings',
    type: 'environment',
    distance: 0,
    description: 'Environment around you',
    icon: 'E'
  };
}

/**
 * Get badge color for target type
 */
export function getTargetBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    'nephilim': 'bg-pink-500/30 text-pink-300 border-pink-500',
    'character': 'bg-yellow-500/30 text-yellow-300 border-yellow-500',
    'bystander': 'bg-blue-500/30 text-blue-300 border-blue-500',
    'environment': 'bg-green-500/30 text-green-300 border-green-500'
  };
  return colors[type] || 'bg-gray-500/30 text-gray-300 border-gray-500';
}

/**
 * Check if target is valid based on range
 */
export function isTargetInRange(
  targetName: string,
  targetType: string,
  nephilims: NephilimCharacter[],
  proximities: Map<string, number>
): boolean {
  if (targetType === 'nephilim') {
    const distance = proximities.get(targetName) || 100;
    return distance < 30; // Can only target Nephilims within 30 range
  }
  
  // Characters, bystanders, environment always in range when present
  return true;
}
