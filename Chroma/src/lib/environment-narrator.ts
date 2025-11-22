/**
 * Environment Narrator
 * Generates middle-bubble environment narration for world events
 * Shows bystanders, weather changes, spatial events without Nephilim control
 */

import type { EnvironmentState } from './chroma-types';

export interface EnvironmentNarration {
  content: string;
  type: 'crowd' | 'weather' | 'spatial' | 'atmosphere' | 'time' | 'sensory';
  timestamp: string;
  isMiddleBubble: true; // Always true for environment narration
  hasBubble: true; // PHASE 4: ALL environment messages wrapped in dark bubble
  bubbleOpacity: 0.6; // PHASE 4: Readable on any background
}

// Generate crowd/bystander events (appears rarely, more atmospheric than constant)
export function generateCrowdNarration(
  locationName: string, 
  activityLevel: string,
  timeOfDay: string
): string | null {
  const random = Math.random();
  
  // Only generate crowd events 20% of the time
  if (random > 0.2) return null;
  
  const isNight = timeOfDay === 'latenight' || timeOfDay === 'evening';
  const isBusy = activityLevel === 'bustling' || activityLevel === 'crowded';
  
  if (locationName.toLowerCase().includes('street')) {
    if (isBusy) {
      const events = [
        "*the streets are fully crowded, you're getting pushed around*",
        "*a group rushes past, nearly knocking you over*",
        "*voices overlap in every direction, indistinct chatter*",
        "*the sidewalk narrows with bodies pressing in*"
      ];
      return events[Math.floor(Math.random() * events.length)];
    } else if (isNight) {
      const events = [
        "*a lone figure passes under streetlamps, hurrying home*",
        "*the wind carries distant sirens through empty streets*",
        "*footsteps echo on pavement, then fade into silence*",
        "*a car drives by slowly, taillights disappearing*"
      ];
      return events[Math.floor(Math.random() * events.length)];
    }
  } else if (locationName.toLowerCase().includes('diner') || locationName.toLowerCase().includes('cafe')) {
    const events = [
      "*a waitress drops a plate, glass shattering across tile*",
      "*someone laughs too loud at the corner booth*",
      "*the coffee machine hisses, espresso dripping steady*",
      "*a regular sits reading newspaper, ignoring everyone*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  } else if (locationName.toLowerCase().includes('club')) {
    const events = [
      "*bass vibrates through floor, bodies moving as one mass*",
      "*someone spills a drink, shouting over the music*",
      "*strobe lights cut through smoke, faces flashing in and out*",
      "*the crowd surges toward the DJ booth, euphoric energy*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  }
  
  return null;
}

// Generate weather change narration
export function generateWeatherNarration(
  previousWeather: string, 
  currentWeather: string
): string | null {
  if (previousWeather === currentWeather) return null;
  
  const prev = previousWeather.toLowerCase();
  const curr = currentWeather.toLowerCase();
  
  // Rain starting
  if (!prev.includes('rain') && curr.includes('rain')) {
    return "*the first drops begin to fall, cold against skin*";
  }
  
  // Rain stopping
  if (prev.includes('rain') && !curr.includes('rain')) {
    return "*rain fades to nothing, leaving puddles reflecting streetlights*";
  }
  
  // Snow starting
  if (!prev.includes('snow') && curr.includes('snow')) {
    return "*snowflakes drift down silent, settling on shoulders*";
  }
  
  // Fog rolling in
  if (!prev.includes('fog') && curr.includes('fog')) {
    return "*fog thickens around you, visibility dropping to meters*";
  }
  
  // Storm starting
  if (!prev.includes('storm') && curr.includes('storm')) {
    return "*thunder rumbles in the distance, lightning flashing far off*";
  }
  
  // Wind picking up
  if (!prev.includes('wind') && curr.includes('wind')) {
    return "*wind gusts suddenly, papers scattering down the street*";
  }
  
  return null;
}

// Generate spatial/proximity narration (not Nephilim-related)
export function generateSpatialNarration(locationName: string): string | null {
  const random = Math.random();
  
  // Only generate spatial events 15% of the time
  if (random > 0.15) return null;
  
  if (locationName.toLowerCase().includes('street')) {
    const events = [
      "*a streetlamp flickers overhead, buzzing with electricity*",
      "*graffiti covers the alley wall, fresh paint still wet*",
      "*a fire escape ladder creaks in the wind above*",
      "*broken glass crunches underfoot, scattered across concrete*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  } else if (locationName.toLowerCase().includes('lake')) {
    const events = [
      "*waves lap against the shore, rhythmic and endless*",
      "*a boat horn sounds far out on the water*",
      "*seagulls circle overhead, calling to each other*",
      "*water reflects city lights, shimmering in darkness*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  } else if (locationName.toLowerCase().includes('train') || locationName.toLowerCase().includes('l train')) {
    const events = [
      "*the train lurches, bodies swaying with sudden deceleration*",
      "*fluorescent lights buzz, one flickering on and off*",
      "*metal wheels screech against rails, piercing and sharp*",
      "*doors hiss open, cold air rushing into the car*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  }
  
  return null;
}

// Generate atmospheric narration (sensory details)
export function generateAtmosphericNarration(state: EnvironmentState): string | null {
  const random = Math.random();
  
  // Only generate atmospheric events 25% of the time
  if (random > 0.25) return null;
  
  const temp = parseInt(state.temperature);
  const time = state.time.toLowerCase();
  
  // Cold temperature
  if (temp < 40) {
    const events = [
      "*breath mists in cold air, dissipating slowly*",
      "*fingers numb from cold, tucking hands into pockets*",
      "*ice forms at puddle edges, crunching under weight*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  }
  
  // Hot temperature
  if (temp > 80) {
    const events = [
      "*heat radiates from pavement, shimmering air above asphalt*",
      "*sweat beads on forehead, wiping it away with the back of hand*",
      "*the air thick and heavy, every breath labored*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  }
  
  // Night time
  if (time.includes('am') && !time.includes('12:')) {
    const events = [
      "*shadows stretch long between pools of streetlight*",
      "*the city quiets, only distant sounds remaining*",
      "*darkness presses in from all sides, intimate and close*"
    ];
    return events[Math.floor(Math.random() * events.length)];
  }
  
  return null;
}

// Generate time passage narration (when time changes significantly)
export function generateTimePassageNarration(
  oldTime: string, 
  newTime: string
): string | null {
  const oldHour = parseInt(oldTime.split(':')[0]);
  const newHour = parseInt(newTime.split(':')[0]);
  
  // Only narrate significant time jumps (>2 hours)
  if (Math.abs(newHour - oldHour) < 2) return null;
  
  // Dawn breaking
  if (oldHour < 6 && newHour >= 6) {
    return "*dawn breaks over the city, gray light spreading slowly*";
  }
  
  // Noon approaching
  if (oldHour < 12 && newHour >= 12) {
    return "*the sun climbs high, casting short sharp shadows*";
  }
  
  // Dusk falling
  if (oldHour < 18 && newHour >= 18) {
    return "*dusk settles in, streetlamps flickering to life one by one*";
  }
  
  // Deep night
  if (oldHour < 23 && newHour >= 23) {
    return "*night deepens, the city's pulse slowing to a whisper*";
  }
  
  return null;
}

// Generate power-based environment reaction (called when user uses powers)
export function generatePowerReaction(
  powerName: string,
  strength: number,
  location: string,
  weather: string
): string {
  // Extract attack type from power name
  const attackLower = powerName.toLowerCase();
  
  // Strength-based intensity
  if (strength >= 51) {
    // Catastrophic level (51+)
    if (attackLower.includes('conqueror') || attackLower.includes('haki')) {
      return `*The AIR SHATTERS—reality trembles—shockwave expands through ${location}—bystanders collapse—windows explode—${weather} intensifies*`;
    }
    if (attackLower.includes('red roc') || attackLower.includes('bajrang')) {
      return `*GROUND CRACKS—impact crater forms—${location} SHAKES violently—debris everywhere—atmosphere burns red*`;
    }
    if (attackLower.includes('world') || attackLower.includes('muda')) {
      return `*TIME SHATTERS—reality fragments—${location} distorts—space-time ripples expand—negative colors bleed through*`;
    }
    if (attackLower.includes('geass')) {
      return `*PSYCHIC STORM erupts—minds bend—reality warps—${location} inhabitants freeze—hot pink energy crackles*`;
    }
    const message = `*${location} SHATTERS from the impact—catastrophic destruction—environment REACTS violently*`;
  return Object.assign(message, { hasBubble: true, bubbleOpacity: 0.75 });
  }
  
  if (strength >= 26) {
    // Significant level (26-50)
    if (attackLower.includes('conqueror') || attackLower.includes('haki')) {
      return `*pressure wave ripples—${location} trembles—nearby people stumble—${weather} shifts*`;
    }
    if (attackLower.includes('red roc') || attackLower.includes('gun')) {
      return `*ground trembles—dust rises—${location} shakes—bystanders scatter in panic*`;
    }
    if (attackLower.includes('world')) {
      return `*time ripples outward—${location} freezes momentarily—colors invert briefly*`;
    }
    if (attackLower.includes('geass')) {
      return `*pink flash illuminates ${location}—psychic pressure builds—witnesses confused*`;
    }
    return `*${location} reacts—environment shifts—energy visible in the air*`;
  }
  
  // Minor level (1-25)
  if (attackLower.includes('conqueror') || attackLower.includes('haki')) {
    return `*air ripples subtly—faint pressure felt—${location} stills for a moment*`;
  }
  if (attackLower.includes('red roc') || attackLower.includes('gomu')) {
    return `*ground vibrates—nearby objects rattle—${location} notices*`;
  }
  if (attackLower.includes('world')) {
    return `*time slows imperceptibly—${location} flickers—brief distortion*`;
  }
  if (attackLower.includes('geass')) {
    return `*faint pink glow—psychic whisper—${location} feels eerie*`;
  }
  
  const message = `*${location} reacts to the power—subtle environmental shift*`;
  return Object.assign(message, { hasBubble: true, bubbleOpacity: 0.75 });
}

// Combine all narration checks into one function
export function checkForEnvironmentNarration(
  state: EnvironmentState,
  locationName: string,
  previousWeather?: string,
  previousTime?: string
): EnvironmentNarration | null {
  // Check in order of priority
  
  // 1. Weather changes (most noticeable)
  if (previousWeather) {
    const weatherNarr = generateWeatherNarration(previousWeather, state.weather);
    if (weatherNarr) {
      return {
        content: weatherNarr,
        type: 'weather',
        timestamp: new Date().toISOString(),
        isMiddleBubble: true,
        hasBubble: true, // PHASE 4
        bubbleOpacity: 0.6 // PHASE 4
      };
    }
  }
  
  // 2. Time passage (significant changes)
  if (previousTime) {
    const timeNarr = generateTimePassageNarration(previousTime, state.time);
    if (timeNarr) {
      return {
        content: timeNarr,
        type: 'time',
        timestamp: new Date().toISOString(),
        isMiddleBubble: true,
        hasBubble: true, // PHASE 4
        bubbleOpacity: 0.6 // PHASE 4
      };
    }
  }
  
  // 3. Crowd events (contextual)
  const timeOfDay = state.time.includes('PM') ? 
    (parseInt(state.time.split(':')[0]) > 6 ? 'evening' : 'afternoon') : 'morning';
  const crowdNarr = generateCrowdNarration(locationName, state.activity_level, timeOfDay);
  if (crowdNarr) {
    return {
      content: crowdNarr,
      type: 'crowd',
      timestamp: new Date().toISOString(),
      isMiddleBubble: true,
      hasBubble: true, // PHASE 4
      bubbleOpacity: 0.6 // PHASE 4
    };
  }
  
  // 4. Spatial events (location-specific)
  const spatialNarr = generateSpatialNarration(locationName);
  if (spatialNarr) {
    return {
      content: spatialNarr,
      type: 'spatial',
      timestamp: new Date().toISOString(),
      isMiddleBubble: true,
      hasBubble: true, // PHASE 4
      bubbleOpacity: 0.6 // PHASE 4
    };
  }
  
  // 5. Atmospheric details (sensory)
  const atmoNarr = generateAtmosphericNarration(state);
  if (atmoNarr) {
    return {
      content: atmoNarr,
      type: 'atmosphere',
      timestamp: new Date().toISOString(),
      isMiddleBubble: true,
      hasBubble: true, // PHASE 4
      bubbleOpacity: 0.6 // PHASE 4
    };
  }
  
  return null;
}
