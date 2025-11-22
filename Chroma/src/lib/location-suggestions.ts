/**
 * Location Suggestions System
 * Generates nearby location suggestions when clicking current location
 */

import { TRAVEL_DESTINATIONS, TravelDestination } from './chroma-travel';

export interface LocationSuggestion {
  name: string;
  description: string;
  distance: string;
  command: string;
}

// Geographic groupings for accurate distance calculation
const CHICAGO_LOCATIONS = ['chicago_streets', 'lake_michigan', 'late_night_diner', 'underground_club', 'l_train'];
const PARIS_LOCATIONS = ['hauts_de_seine', 'parisian_cafe', 'seine_riverbank', 'rer_b_train'];
const PARALLEL_WORLDS = ['thousand_sunny', 'morioh_town', 'mementos', 'wano_streets'];

/**
 * Calculate distance label based on geography (NOT just type)
 */
function getDistanceLabel(currentKey: string, targetKey: string, targetDest: TravelDestination): string {
  // Mystery locations
  if (targetDest.isMystery) return 'unknown';
  
  // Parallel worlds
  if (PARALLEL_WORLDS.includes(targetKey)) return 'another dimension';
  
  // Same city (Chicago)
  if (CHICAGO_LOCATIONS.includes(currentKey) && CHICAGO_LOCATIONS.includes(targetKey)) {
    return 'in Chicago';
  }
  
  // Same city (Paris/France)
  if (PARIS_LOCATIONS.includes(currentKey) && PARIS_LOCATIONS.includes(targetKey)) {
    return 'in Paris';
  }
  
  // Cross-continental (Chicago ↔ Paris)
  if (
    (CHICAGO_LOCATIONS.includes(currentKey) && PARIS_LOCATIONS.includes(targetKey)) ||
    (PARIS_LOCATIONS.includes(currentKey) && CHICAGO_LOCATIONS.includes(targetKey))
  ) {
    return 'far away';
  }
  
  // Default to nearby for same-type locations
  return 'nearby';
}

/**
 * Get nearby location suggestions based on current location
 */
export function getLocationSuggestions(currentLocation: string): LocationSuggestion[] {
  const currentKey = currentLocation.toLowerCase().replace(/ /g, '_').replace(/[()]/g, '');
  const current = TRAVEL_DESTINATIONS[currentKey];
  if (!current) {
    return getDefaultSuggestions();
  }

  const suggestions: LocationSuggestion[] = [];
  
  // If Chicago, prioritize Chicago-specific suggestions
  if (CHICAGO_LOCATIONS.includes(currentKey)) {
    const chicagoSpots = CHICAGO_LOCATIONS.filter(key => key !== currentKey);
    
    chicagoSpots.forEach(key => {
      const dest = TRAVEL_DESTINATIONS[key];
      if (dest) {
        suggestions.push({
          name: dest.name,
          description: dest.description,
          distance: 'in Chicago',
          command: `*go to ${dest.name}*`
        });
      }
    });
  }

  // If Paris, prioritize Paris-specific suggestions
  if (PARIS_LOCATIONS.includes(currentKey)) {
    const parisSpots = PARIS_LOCATIONS.filter(key => key !== currentKey);
    
    parisSpots.forEach(key => {
      const dest = TRAVEL_DESTINATIONS[key];
      if (dest) {
        suggestions.push({
          name: dest.name,
          description: dest.description,
          distance: 'in Paris',
          command: `*go to ${dest.name}*`
        });
      }
    });
  }

  // Add distant locations (different continent)
  const distantKeys = Object.keys(TRAVEL_DESTINATIONS).filter(key => 
    key !== currentKey &&
    key !== 'mystery' &&
    !suggestions.find(s => s.name === TRAVEL_DESTINATIONS[key].name) &&
    getDistanceLabel(currentKey, key, TRAVEL_DESTINATIONS[key]) === 'far away'
  );
  
  const randomDistant = distantKeys
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  
  randomDistant.forEach(key => {
    const dest = TRAVEL_DESTINATIONS[key];
    suggestions.push({
      name: dest.name,
      description: dest.description,
      distance: 'far away',
      command: `*go to ${dest.name}*`
    });
  });

  // Add mystery location suggestion (50% chance)
  if (Math.random() > 0.5) {
    suggestions.push({
      name: '??? (Mystery)',
      description: 'Random teleport—figure out where you are from context',
      distance: 'unknown',
      command: '*go to mystery*'
    });
  }

  // Limit to 6 suggestions
  return suggestions.slice(0, 6);
}

/**
 * Get default suggestions when location unknown
 */
function getDefaultSuggestions(): LocationSuggestion[] {
  return [
    {
      name: 'Chicago Streets',
      description: 'Cold urban grid, wind cutting through high-rises',
      distance: 'start here',
      command: '*go to Chicago Streets*'
    },
    {
      name: 'Lake Michigan Shore',
      description: 'Vast dark water, waves crashing on rocky shore',
      distance: 'nearby',
      command: '*go to Lake Michigan Shore*'
    },
    {
      name: 'Late Night Diner',
      description: 'Fluorescent lights, coffee steam, leather booths',
      distance: 'nearby',
      command: '*go to Late Night Diner*'
    },
    {
      name: 'Hauts-de-Seine',
      description: 'Paris suburbs, concrete HLM towers, Ana\'s territory',
      distance: 'far away',
      command: '*go to Hauts-de-Seine*'
    },
    {
      name: 'Thousand Sunny',
      description: 'Straw Hat Pirates\' ship deck',
      distance: 'another dimension',
      command: '*go to Thousand Sunny*'
    },
    {
      name: '??? (Mystery)',
      description: 'Random teleport—figure out where from context',
      distance: 'unknown',
      command: '*go to mystery*'
    }
  ];
}

/**
 * Get suggestions for bringing a Nephilim with you
 */
export function getNephilimTravelSuggestions(activeNephilims: string[]): string[] {
  return activeNephilims.map(name => `*bring ${name} with me*`);
}
