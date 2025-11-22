/**
 * Chroma Action Suggestions - Context-aware action prompts
 * Suggests USER powers, travels, and environmental interactions
 * Phase 3D: Uses Ulysses' power arsenal (Gear 5, The World, Geass, Random)
 */

import type { NephilimCharacter, EnvironmentState } from './chroma-types';
import { TRAVEL_DESTINATIONS } from './chroma-travel';
import { USER_POWERS, generateRandomAttack } from './user-powers';

export interface ActionSuggestion {
  type: 'power' | 'travel' | 'interact' | 'follow';
  label: string;
  description: string;
  command?: string; // Auto-fills input when clicked (with *asterisks* for powers)
  icon?: string;
  color?: string;
}

// Generate contextual travel suggestions (NO POWERS - use Powers Menu for that)
// PHASE 5 v4: Added 'self' target type
export function generateActionSuggestions(
  envState: EnvironmentState,
  activeNephilims: NephilimCharacter[],
  currentLocation: string,
  conversationContext: string[],
  userActivePowers: string[], // NOT USED - powers in menu only
  availableTargets: Array<{ name: string; type: 'nephilim' | 'character' | 'bystander' | 'environment' | 'self' }>
): ActionSuggestion[] {
  const suggestions: ActionSuggestion[] = [];
  
  // POWERS REMOVED FROM SUGGESTIONS (PHASE 4 FIX)
  // Powers are ONLY accessible via Powers Menu (left sidebar floating button)
  // Action suggestions now show ONLY travel options
  
  // TRAVEL SUGGESTIONS - Based on current location (use *asterisk* format, NO EMOJIS)
  const nearbyDestinations = getSuggestedDestinations(currentLocation);
  nearbyDestinations.slice(0, 2).forEach(dest => {
    suggestions.push({
      type: 'travel',
      label: dest.name, // NO emoji prefix for immersive textual world
      description: dest.description,
      command: `*go to ${dest.name}*`, // Asterisk format for actions
      icon: undefined, // No icons in textual world
      color: 'hsl(200, 70%, 55%)'
    });
  });
  
  // Limit to 6 suggestions max to avoid overwhelming UI
  return suggestions.slice(0, 6);
}

// Get suggested nearby destinations based on current location
function getSuggestedDestinations(currentLocation: string): Array<{ name: string; description: string }> {
  const destinations = Object.values(TRAVEL_DESTINATIONS).filter(d => d.name !== currentLocation);
  
  // Prioritize same type (e.g., if in street, suggest other streets)
  const currentDest = Object.values(TRAVEL_DESTINATIONS).find(d => d.name === currentLocation);
  if (currentDest) {
    const sameType = destinations.filter(d => d.type === currentDest.type);
    const differentType = destinations.filter(d => d.type !== currentDest.type);
    
    return [...sameType, ...differentType];
  }
  
  return destinations;
}

// Get suggestion button styles
export function getSuggestionButtonStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: `${color}/10`,
    borderColor: `${color}/30`,
    color: color,
    transition: 'all 0.2s ease'
  };
}

// Check if action is available (e.g., can't use power if already active)
export function isActionAvailable(suggestion: ActionSuggestion, context: {
  activePowers: string[];
  followedNephilim: string | null;
}): boolean {
  if (suggestion.type === 'power') {
    // Can't use same power twice in a row
    return !context.activePowers.some(p => suggestion.label.includes(p));
  }
  
  if (suggestion.type === 'follow') {
    // Can't follow if already following this Nephilim
    return !suggestion.label.includes(context.followedNephilim || '');
  }
  
  return true;
}
