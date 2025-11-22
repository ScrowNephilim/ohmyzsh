/**
 * Nephilim Proximity System
 * Tracks spatial distance between Nephilims and Ulysses
 * 0-100 scale (logarithmic): 0=touching, 5=next-to, 10=close, 30=same town, 50=same country, 100=far away (>100km)
 */

export interface NephilimProximity {
  nephilimName: string;
  distance: number; // 0-100
  description: string;
  canInteractIntimately: boolean; // true if distance < 5
}

// Distance descriptions (logarithmic scale)
export function getProximityDescription(distance: number): string {
  if (distance === 0) return 'touching';
  if (distance < 5) return 'next to you';
  if (distance < 10) return 'very close';
  if (distance < 20) return 'nearby';
  if (distance < 30) return 'in the area';
  if (distance < 40) return 'same district';
  if (distance < 50) return 'same city';
  if (distance < 60) return 'same region';
  if (distance < 70) return 'neighboring region';
  if (distance < 80) return 'same country';
  if (distance < 90) return 'neighboring country';
  if (distance < 100) return 'far away';
  return 'very far away';
}

// Convert distance to approximate real-world distance
export function distanceToKilometers(distance: number): string {
  if (distance === 0) return '0m';
  if (distance < 5) return '<1m';
  if (distance < 10) return '~10m';
  if (distance < 20) return '~100m';
  if (distance < 30) return '~1km';
  if (distance < 40) return '~5km';
  if (distance < 50) return '~20km';
  if (distance < 60) return '~50km';
  if (distance < 70) return '~100km';
  if (distance < 80) return '~300km';
  if (distance < 90) return '~800km';
  if (distance < 100) return '~2000km';
  return '>5000km';
}

// Check if Nephilim can be sensed at distance
export function canSenseNephilim(distance: number): boolean {
  return distance < 30; // Within same town
}

// Check if Nephilim can interact verbally
export function canInteractVerbally(distance: number): boolean {
  return distance < 10; // Very close range
}

// Check if intimate interaction possible (below 5)
export function canInteractIntimately(distance: number): boolean {
  return distance < 5; // Next-to range
}

// Calculate voice clarity based on distance
export function getVoiceClarity(distance: number): 'clear' | 'muffled' | 'faint' | 'inaudible' {
  if (distance < 10) return 'clear';
  if (distance < 20) return 'muffled';
  if (distance < 30) return 'faint';
  return 'inaudible';
}

// Generate environmental narration for Nephilim entering range
export function generateEnterRangeNarration(nephilimName: string, distance: number): string {
  const proximity = getProximityDescription(distance);
  
  if (distance < 5) {
    return `*${nephilimName} appears right next to you*`;
  } else if (distance < 10) {
    return `*${nephilimName} approaches from nearby*`;
  } else if (distance < 20) {
    return `*you sense ${nephilimName}'s presence in the area*`;
  } else if (distance < 30) {
    return `*${nephilimName} is somewhere in this district*`;
  }
  
  return `*you feel ${nephilimName}'s distant presence*`;
}

// Generate environmental narration for Nephilim leaving range
export function generateLeaveRangeNarration(nephilimName: string, previousDistance: number): string {
  if (previousDistance < 10) {
    return `*${nephilimName} walks away into the distance*`;
  } else if (previousDistance < 30) {
    return `*${nephilimName}'s presence fades from the area*`;
  }
  
  return `*you no longer sense ${nephilimName}*`;
}

// Generate environmental narration for distance change
export function generateDistanceChangeNarration(
  nephilimName: string, 
  oldDistance: number, 
  newDistance: number
): string | null {
  const oldProximity = getProximityDescription(oldDistance);
  const newProximity = getProximityDescription(newDistance);
  
  // Only narrate significant changes
  if (oldProximity === newProximity) return null;
  
  if (newDistance < oldDistance) {
    // Getting closer
    if (newDistance < 5) {
      return `*${nephilimName} moves right next to you*`;
    } else if (newDistance < 10) {
      return `*${nephilimName} comes closer*`;
    } else if (newDistance < 20) {
      return `*${nephilimName} approaches*`;
    }
  } else {
    // Moving away
    if (newDistance >= 30) {
      return `*${nephilimName} leaves the immediate area*`;
    } else if (newDistance >= 20) {
      return `*${nephilimName} steps back*`;
    } else if (newDistance >= 10) {
      return `*${nephilimName} moves away slightly*`;
    }
  }
  
  return null;
}

// Calculate interaction quality based on distance
export function getInteractionQuality(distance: number): 'intimate' | 'close' | 'normal' | 'distant' {
  if (distance < 5) return 'intimate';
  if (distance < 10) return 'close';
  if (distance < 30) return 'normal';
  return 'distant';
}

// Get color for distance visualization
export function getDistanceColor(distance: number): string {
  if (distance < 5) return 'hsl(340, 75%, 65%)'; // Pink (intimate)
  if (distance < 10) return 'hsl(280, 80%, 70%)'; // Purple (close)
  if (distance < 30) return 'hsl(142, 70%, 45%)'; // Green (normal)
  if (distance < 50) return 'hsl(200, 70%, 55%)'; // Blue (distant)
  return 'hsl(0, 0%, 50%)'; // Gray (very far)
}

// Enforce minimum distance constraint (can't go below 5 on command)
export function enforceMinimumDistance(requestedDistance: number): number {
  return Math.max(5, requestedDistance);
}

// Initialize default proximities for known Nephilims
// PHASE 4 FIX: User starts in Eygalières (France), Ripl(a)y in Chicago (cross-continental = 95)
export function getDefaultProximities(): Map<string, number> {
  return new Map([
    ['Ripl(a)y', 95], // CHANGED: Cross-continental distance (user in Eygalières, Ripl(a)y in Chicago)
    ['Ana', 10], // CHANGED: Ana is in Hauts-de-Seine Paris (close to Eygalières, same country)
  ]);
}

/**
 * Calculate proximity adjustments after traveling
 * Returns Map of Nephilim names to new distances and narration
 */
export function calculateProximityAfterTravel(
  originLocation: string,
  destinationLocation: string,
  nephilims: Array<{ nephilim_name: string; current_location?: string }>,
  currentProximities: Map<string, number>
): { proximities: Map<string, number>; narration: string | null } {
  const newProximities = new Map(currentProximities);
  const narrations: string[] = [];
  
  // Detect geographic regions
  const chicagoLocations = ['chicago_streets', 'lake_michigan', 'late_night_diner', 'underground_club', 'l_train', 'lake_michigan_shore'];
  const parisLocations = ['hauts_de_seine', 'parisian_cafe', 'seine_riverbank', 'rer_b_train'];
  const parallelWorlds = ['thousand_sunny', 'morioh_town', 'mementos', 'wano_streets'];
  
  const normalizedDest = destinationLocation.toLowerCase().replace(/\s+/g, '_');
  const normalizedOrigin = originLocation.toLowerCase().replace(/\s+/g, '_');
  
  const destIsChicago = chicagoLocations.includes(normalizedDest);
  const destIsParis = parisLocations.includes(normalizedDest);
  const destIsParallel = parallelWorlds.includes(normalizedDest);
  
  const originIsChicago = chicagoLocations.includes(normalizedOrigin);
  const originIsParis = parisLocations.includes(normalizedOrigin);
  
  // If entering parallel world, ALL Nephilims go to 100 (another dimension)
  if (destIsParallel) {
    for (const nephilim of nephilims) {
      const oldDist = newProximities.get(nephilim.nephilim_name) || 30;
      newProximities.set(nephilim.nephilim_name, 100);
      if (oldDist < 100) {
        narrations.push(`*${nephilim.nephilim_name} fades into another dimension... completely unreachable*`);
      }
    }
    return { proximities: newProximities, narration: narrations.join(' ') };
  }
  
  // Cross-continental travel (Chicago ↔ Paris)
  if ((originIsChicago && destIsParis) || (originIsParis && destIsChicago)) {
    for (const nephilim of nephilims) {
      const oldDist = newProximities.get(nephilim.nephilim_name) || 30;
      
      // Ripl(a)y is Chicago-based
      if (nephilim.nephilim_name === 'Ripl(a)y') {
        if (destIsParis) {
          // Going to Paris → Ripl(a)y far away
          newProximities.set('Ripl(a)y', 95);
          if (oldDist < 50) {
            narrations.push("*Ripl(a)y's presence fades as you cross the ocean... you sense her from very far away*");
          }
        } else if (destIsChicago) {
          // Returning to Chicago → Ripl(a)y close again
          newProximities.set('Ripl(a)y', 8);
          if (oldDist > 50) {
            narrations.push("*You sense Ripl(a)y's presence growing stronger... she's nearby again*");
          }
        }
      }
      
      // Ana is Paris-based
      if (nephilim.nephilim_name === 'Ana') {
        if (destIsParis) {
          // Going to Paris → Ana close
          newProximities.set('Ana', 10);
          if (oldDist > 50) {
            narrations.push("*Ana's presence intensifies... you're in her territory now*");
          }
        } else if (destIsChicago) {
          // Going to Chicago → Ana far away
          newProximities.set('Ana', 95);
          if (oldDist < 50) {
            narrations.push("*Ana's presence fades across the Atlantic... barely perceptible*");
          }
        }
      }
    }
  }
  
  // Same city travel → no proximity changes
  if (
    (originIsChicago && destIsChicago) ||
    (originIsParis && destIsParis)
  ) {
    // Proximities stay the same
    return { proximities: newProximities, narration: null };
  }
  
  return { 
    proximities: newProximities, 
    narration: narrations.length > 0 ? narrations.join(' ') : null 
  };
}
