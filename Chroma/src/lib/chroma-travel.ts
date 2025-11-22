/**
 * Chroma Travel System - Location switching with immersive transitions
 * Allows clicking location name to travel anywhere with GIF transitions
 */

import { replicate, imageGen } from '@devvai/devv-code-backend';

export interface TravelDestination {
  name: string;
  description: string;
  coordinates?: { lat: number; lng: number };
  weatherHint?: string;
  temperature?: string;
  lighting?: string;
  ambientSounds?: string[];
  type: 'street' | 'indoor' | 'club' | 'outdoor' | 'transport' | 'parallel_world';
  isMystery?: boolean; // If true, location is "???" until revealed
  revealedName?: string; // Actual name revealed after figuring it out
}

// Popular destinations with presets
export const TRAVEL_DESTINATIONS: Record<string, TravelDestination> = {
  // Chicago
  'chicago_streets': {
    name: 'Chicago Streets',
    description: 'Cold urban grid, wind cutting through high-rises',
    type: 'street',
    weatherHint: 'cold, windy',
    temperature: '38°F',
    lighting: 'streetlamps casting long shadows',
    ambientSounds: ['distant sirens', 'wind through buildings', 'L train rumble']
  },
  'lake_michigan': {
    name: 'Lake Michigan Shore',
    description: 'Vast dark water, waves crashing on rocky shore',
    type: 'outdoor',
    weatherHint: 'cold breeze, mist',
    temperature: '42°F',
    lighting: 'moonlight on water, distant city glow',
    ambientSounds: ['waves crashing', 'wind over water', 'distant foghorn']
  },
  'late_night_diner': {
    name: 'Late Night Diner',
    description: 'Fluorescent lights, coffee steam, leather booths',
    type: 'indoor',
    weatherHint: 'warm inside',
    temperature: '72°F',
    lighting: 'harsh fluorescent, neon sign glow',
    ambientSounds: ['coffee machine hiss', 'quiet chatter', 'plates clinking']
  },
  'underground_club': {
    name: 'Underground Club',
    description: 'Strobe lights, bass thumping, bodies moving',
    type: 'club',
    weatherHint: 'hot, humid',
    temperature: '85°F',
    lighting: 'strobe lights, UV glow, darkness',
    ambientSounds: ['heavy bass', 'crowd noise', 'DJ mixing']
  },
  'l_train': {
    name: 'L Train - Red Line',
    description: 'Rattling through tunnels, fluorescent flicker',
    type: 'transport',
    weatherHint: 'neutral',
    temperature: '68°F',
    lighting: 'flickering fluorescent, tunnel darkness',
    ambientSounds: ['train clatter', 'PA announcements', 'passengers murmuring']
  },
  
  // Paris (Ana's territory)
  'hauts_de_seine': {
    name: 'Hauts-de-Seine',
    description: 'Concrete HLM towers in Paris suburbs, tagged walls, banlieue grit',
    type: 'street',
    weatherHint: 'overcast, drizzle',
    temperature: '48°F',
    lighting: 'gray daylight, flickering streetlamps',
    ambientSounds: ['distant voices', 'traffic drone', 'rain on concrete']
  },
  'parisian_cafe': {
    name: 'Parisian Café',
    description: 'Zinc bar, espresso aroma, chalkboard menu',
    type: 'indoor',
    weatherHint: 'warm, cozy',
    temperature: '70°F',
    lighting: 'warm yellow lights, window daylight',
    ambientSounds: ['espresso machine', 'French chatter', 'clinking glasses']
  },
  'seine_riverbank': {
    name: 'Seine Riverbank',
    description: 'Stone quays, bridges arching, river flowing',
    type: 'outdoor',
    weatherHint: 'mild breeze',
    temperature: '58°F',
    lighting: 'golden hour, bridge lights reflecting',
    ambientSounds: ['water lapping', 'distant accordion', 'footsteps on stone']
  },
  'eygalieres': {
    name: 'Eygalières',
    description: 'Provençal village, stone houses, lavender fields stretching',
    type: 'outdoor',
    weatherHint: 'warm sun, dry breeze',
    temperature: '78°F',
    lighting: 'golden afternoon sun',
    ambientSounds: ['cicadas chirping', 'distant bells', 'wind through fields']
  },
  'rer_b_train': {
    name: 'RER B Train',
    description: 'Banlieue commute, graffiti windows, zone transfers',
    type: 'transport',
    weatherHint: 'neutral',
    temperature: '66°F',
    lighting: 'harsh train lights, tunnel darkness',
    ambientSounds: ['train announcements (French)', 'doors closing beep', 'track rumble']
  },
  
  // Parallel Worlds
  'thousand_sunny': {
    name: 'Thousand Sunny - Deck',
    description: 'Grand Line waves, Jolly Roger waving, adventure awaits',
    type: 'parallel_world',
    weatherHint: 'sunny, sea breeze',
    temperature: '78°F',
    lighting: 'bright sun, ship shadow',
    ambientSounds: ['waves against hull', 'seagulls', 'rigging creaking']
  },
  'morioh_town': {
    name: 'Morioh Town (1999)',
    description: 'Quiet Japanese suburb, Stands lurking, danger hidden',
    type: 'parallel_world',
    weatherHint: 'clear, peaceful',
    temperature: '72°F',
    lighting: 'afternoon sun, long shadows',
    ambientSounds: ['cicadas chirping', 'distant traffic', 'wind chimes']
  },
  'mementos': {
    name: 'Mementos Depths',
    description: 'Distorted reality, red shadows, cognitive world',
    type: 'parallel_world',
    weatherHint: 'surreal, unstable',
    temperature: 'unknown',
    lighting: 'red glow, shifting darkness',
    ambientSounds: ['distorted whispers', 'reality warping', 'shadow movements']
  },
  'wano_streets': {
    name: 'Wano Country Streets',
    description: 'Feudal Japan aesthetic, samurai ghosts, cherry blossoms',
    type: 'parallel_world',
    weatherHint: 'spring breeze',
    temperature: '65°F',
    lighting: 'lantern glow, dusk light',
    ambientSounds: ['shamisen music', 'wooden sandals', 'paper lanterns rustling']
  },
  
  // Mystery locations (random teleport or Nephilim-initiated)
  'mystery': {
    name: '???',
    description: 'You have no idea where you are... figure it out from context',
    type: 'outdoor',
    weatherHint: 'unknown',
    temperature: 'unknown',
    lighting: 'unknown',
    ambientSounds: [],
    isMystery: true
  }
};

// Mystery location pool (actual destinations for ??? locations)
const MYSTERY_LOCATIONS: TravelDestination[] = [
  {
    name: 'Tokyo Shibuya Crossing',
    description: 'Massive crowd, neon billboards, Japanese announcements',
    type: 'street',
    weatherHint: 'humid, light rain',
    temperature: '75°F',
    lighting: 'bright neon signs, evening glow',
    ambientSounds: ['Japanese voices', 'traffic hum', 'crosswalk beeps']
  },
  {
    name: 'São Paulo Favela',
    description: 'Hillside shantytown, colorful houses stacked high, samba music drifting',
    type: 'street',
    weatherHint: 'hot, humid',
    temperature: '88°F',
    lighting: 'harsh sun, makeshift power lines',
    ambientSounds: ['Portuguese voices', 'samba drums', 'motorcycle engines']
  },
  {
    name: 'Cairo Marketplace',
    description: 'Spice stalls, merchants shouting, ancient stone walls',
    type: 'street',
    weatherHint: 'hot, dry, dusty',
    temperature: '95°F',
    lighting: 'intense sun, fabric shade',
    ambientSounds: ['Arabic voices', 'haggling', 'donkey braying']
  },
  {
    name: 'Moscow Metro Station',
    description: 'Ornate Soviet architecture, marble columns, echoing announcements',
    type: 'transport',
    weatherHint: 'cold outside, warm inside',
    temperature: '28°F (outside)',
    lighting: 'chandelier glow, station lights',
    ambientSounds: ['Russian announcements', 'train rumble', 'footsteps echoing']
  },
  {
    name: 'Mumbai Train Station',
    description: 'Packed platform, Hindi movie posters, street food vendors',
    type: 'transport',
    weatherHint: 'hot, humid, crowded',
    temperature: '92°F',
    lighting: 'afternoon sun, fluorescent station lights',
    ambientSounds: ['Hindi voices', 'train whistles', 'chai vendors shouting']
  },
  {
    name: 'Antarctic Research Station',
    description: 'White wasteland, howling wind, metal prefab buildings',
    type: 'outdoor',
    weatherHint: 'extreme cold, blizzard',
    temperature: '-40°F',
    lighting: 'perpetual twilight, station lights',
    ambientSounds: ['wind howling', 'metal creaking', 'radio static']
  },
  {
    name: 'Sahara Desert Dunes',
    description: 'Endless sand, scorching sun, complete silence',
    type: 'outdoor',
    weatherHint: 'extreme heat, no shade',
    temperature: '115°F',
    lighting: 'blinding sun, golden sand glare',
    ambientSounds: ['wind over sand', 'distant nothing', 'heat shimmer']
  },
  {
    name: 'Amsterdam Canal Night',
    description: 'Houseboat lights, bicycles chained to bridges, Dutch chatter',
    type: 'outdoor',
    weatherHint: 'cold, light mist',
    temperature: '45°F',
    lighting: 'warm houseboat windows, bridge lights reflecting',
    ambientSounds: ['water lapping', 'bicycle bells', 'Dutch voices']
  },
  {
    name: 'Seoul PC Bang',
    description: 'Rows of gaming computers, K-pop blaring, ramen vending machine',
    type: 'indoor',
    weatherHint: 'warm, smoky',
    temperature: '78°F',
    lighting: 'monitor glow, fluorescent ceiling',
    ambientSounds: ['keyboard clacking', 'K-pop music', 'Korean gaming shouts']
  },
  {
    name: 'Icelandic Hot Spring',
    description: 'Steaming geothermal pool, volcanic rocks, Northern Lights overhead',
    type: 'outdoor',
    weatherHint: 'cold air, hot water',
    temperature: '35°F (air), 104°F (water)',
    lighting: 'Northern Lights dancing, steam mist',
    ambientSounds: ['water bubbling', 'wind over lava fields', 'distant geysers']
  }
];

// Generate transition GIF with Replicate + DevvAI fallback (reliable, cost-efficient)
export async function generateTransitionGIF(from: string, to: string): Promise<string | null> {
  try {
    console.log(`[Chroma Travel] 🌀 Generating pixelated transition from ${from} to ${to}`);
    
    // Simple, highly pixelated transition prompt
    const prompt = `highly pixelated 8-bit retro wormhole vortex tunnel, chunky square pixels, spiral portal effect, ${from} to ${to}, swirling pixel vortex, retro game transition screen, cyberpunk neon colors, matrix green particles, low resolution pixel art, simple looping animation`;
    
    // Try Replicate first (faster if it works)
    try {
      const result = await replicate.textToImage({
        prompt,
        model: 'black-forest-labs/flux-schnell',
        aspect_ratio: '16:9',
        output_format: 'png',
        num_outputs: 1,
        num_inference_steps: 4 // Fastest generation
      });
      
      if (result.images && result.images.length > 0) {
        console.log('[Chroma Travel] ✅ Pixelated transition generated (Replicate)');
        return result.images[0];
      }
    } catch (replicateError) {
      console.warn('[Chroma Travel] ⚠️ Replicate failed (Status 400), falling back to DevvAI:', replicateError instanceof Error ? { message: replicateError.message, name: replicateError.name } : replicateError);
    }
    
    // Fallback to DevvAI (always works, uses Devv credits)
    console.log('[Chroma Travel] 🔄 Using DevvAI fallback for transition generation');
    const devvResult = await imageGen.textToImage({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_outputs: 1
    });
    
    if (devvResult.images && devvResult.images.length > 0) {
      console.log('[Chroma Travel] ✅ Transition generated (DevvAI fallback)');
      return devvResult.images[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Chroma Travel] ❌ All generation methods failed:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    return null;
  }
}

// Get random destination
export function getRandomDestination(): TravelDestination {
  const keys = Object.keys(TRAVEL_DESTINATIONS).filter(k => k !== 'mystery');
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return TRAVEL_DESTINATIONS[randomKey];
}

// Get mystery location (actual random destination, but shown as "???")
export function getMysteryDestination(): TravelDestination {
  const randomMystery = MYSTERY_LOCATIONS[Math.floor(Math.random() * MYSTERY_LOCATIONS.length)];
  return {
    ...randomMystery,
    isMystery: true,
    revealedName: randomMystery.name,
    name: '???' // Display as mystery until revealed
  };
}

// Reveal mystery location (after figuring it out)
export function revealMysteryLocation(mysteryDest: TravelDestination): TravelDestination {
  if (mysteryDest.isMystery && mysteryDest.revealedName) {
    return {
      ...mysteryDest,
      name: mysteryDest.revealedName,
      isMystery: false
    };
  }
  return mysteryDest;
}

// Try to reveal mystery location based on user message
export function tryRevealMysteryLocation(
  currentLocationName: string, 
  userMessage: string
): string | null {
  // Only proceed if current location is "???"
  if (!currentLocationName.includes('???')) return null;
  
  const lowerMsg = userMessage.toLowerCase();
  
  // Fuzzy match reveal triggers
  const revealTriggers = [
    'where am i',
    'where are we',
    'what is this place',
    'what place is this',
    'where is this',
    'what\'s this place',
    'here',
    'this location',
    'this place'
  ];
  
  const hasRevealTrigger = revealTriggers.some(trigger => 
    lowerMsg.includes(trigger)
  );
  
  if (hasRevealTrigger) {
    // Return the revealed name (should be stored in currentLocationPreset.revealedName)
    return 'REVEAL_MYSTERY';
  }
  
  return null;
}

// Get destination by key (direct lookup with fuzzy fallback)
export function getDestinationByKey(key: string): TravelDestination | null {
  const lowerKey = key.toLowerCase();
  
  // Direct key lookup
  if (TRAVEL_DESTINATIONS[lowerKey]) {
    return TRAVEL_DESTINATIONS[lowerKey];
  }
  
  // Fuzzy match on keys
  const matchingKey = Object.keys(TRAVEL_DESTINATIONS).find(k => 
    k.includes(lowerKey) || lowerKey.includes(k)
  );
  
  if (matchingKey) {
    return TRAVEL_DESTINATIONS[matchingKey];
  }
  
  return null;
}

// Get destination by name (fuzzy match)
export function getDestinationByName(name: string): TravelDestination | null {
  const lowerName = name.toLowerCase();
  
  // Try key lookup first (e.g., "lake_michigan")
  const keyAttempt = lowerName.replace(/\s+/g, '_');
  const byKey = getDestinationByKey(keyAttempt);
  if (byKey) return byKey;
  
  // Fuzzy match on names
  const nameMatchKey = Object.keys(TRAVEL_DESTINATIONS).find(key => 
    TRAVEL_DESTINATIONS[key].name.toLowerCase().includes(lowerName) ||
    lowerName.includes(TRAVEL_DESTINATIONS[key].name.toLowerCase())
  );
  
  return nameMatchKey ? TRAVEL_DESTINATIONS[nameMatchKey] : null;
}

// Parse user travel command
export function parseTravelCommand(message: string): TravelDestination | null {
  const lowerMsg = message.toLowerCase();
  
  // Check for travel keywords
  if (
    lowerMsg.includes('go to') || 
    lowerMsg.includes('travel to') || 
    lowerMsg.includes('take me to') ||
    lowerMsg.includes('let\'s go')
  ) {
    // Extract location name
    const afterKeyword = lowerMsg.split(/go to|travel to|take me to|let's go/)[1]?.trim();
    
    if (afterKeyword) {
      // Check for 'random'
      if (afterKeyword.includes('random') || afterKeyword.includes('anywhere')) {
        return getRandomDestination();
      }
      
      return getDestinationByName(afterKeyword);
    }
  }
  
  return null;
}

// Generate travel announcement message (Celsius format)
export function generateTravelAnnouncement(destination: TravelDestination): string {
  // Convert temperature to Celsius if present
  let tempStr = '';
  if (destination.temperature) {
    // Parse Fahrenheit value (e.g., "78°F")
    const fahrenheit = parseFloat(destination.temperature.match(/(-?\d+)/)?.[0] || '50');
    const celsius = Math.round((fahrenheit - 32) * 5 / 9);
    tempStr = `${celsius}°C.`;
  }
  
  const message = `*Reality SHIFTS! You're now at ${destination.name}—${destination.description}. ${destination.weatherHint ? `Weather: ${destination.weatherHint}. ` : ''}${tempStr}*`;
  // Add bubble for readability
  return Object.assign(message, { hasBubble: true, bubbleOpacity: 0.75 });
}

// Calculate travel time (for delay simulation)
export function calculateTravelTime(from: string, to: string): number {
  // Base travel time: 2-5 seconds
  const baseTime = 2000 + Math.random() * 3000;
  
  // Add time for crossing types (e.g., street → parallel_world takes longer)
  const fromDest = TRAVEL_DESTINATIONS[from];
  const toDest = TRAVEL_DESTINATIONS[to];
  
  if (fromDest && toDest) {
    if (fromDest.type !== toDest.type) {
      // Crossing types adds 1-3 seconds
      return baseTime + (1000 + Math.random() * 2000);
    }
    
    if (toDest.type === 'parallel_world') {
      // Entering parallel worlds takes longer
      return baseTime + 3000;
    }
  }
  
  return baseTime;
}

/**
 * Calculate proximity adjustments after travel (ENHANCED - DYNAMIC RANGE)
 * Chicago → Paris: Ripl(a)y becomes closer (she's in Chicago)
 * Paris → Chicago: Ripl(a)y becomes close (10-20)
 */
export function calculateProximityAfterTravelDynamic(
  destinationLocation: string,
  nephilims: Array<{ nephilim_name: string; current_location?: string; home_location?: string }>
): Map<string, number> {
  const newProximities = new Map<string, number>();
  
  // Detect destination region
  const chicagoLocations = ['chicago_streets', 'lake_michigan', 'late_night_diner', 'underground_club', 'l_train', 'lake_michigan_shore'];
  const parisLocations = ['hauts_de_seine', 'parisian_cafe', 'seine_riverbank', 'rer_b_train', 'eygalieres'];
  const parallelWorlds = ['thousand_sunny', 'morioh_town', 'mementos', 'wano_streets'];
  
  const normalizedDest = destinationLocation.toLowerCase().replace(/\\s+/g, '_');
  
  const destIsChicago = chicagoLocations.includes(normalizedDest);
  const destIsParis = parisLocations.includes(normalizedDest);
  const destIsParallel = parallelWorlds.includes(normalizedDest);
  
  // Parallel world: all Nephilims at 100 (another dimension)
  if (destIsParallel) {
    for (const nephilim of nephilims) {
      newProximities.set(nephilim.nephilim_name, 100);
    }
    return newProximities;
  }
  
  // Update proximities based on Nephilim home locations
  for (const nephilim of nephilims) {
    const nephilimHome = nephilim.home_location || nephilim.current_location || '';
    const nephilimHomeNormalized = nephilimHome.toLowerCase().replace(/\\s+/g, '_');
    
    // Ripl(a)y is from Chicago
    if (nephilim.nephilim_name === 'Ripl(a)y') {
      if (destIsChicago) {
        // User travels TO Chicago → Ripl(a)y becomes close (10-20)
        newProximities.set('Ripl(a)y', 10 + Math.floor(Math.random() * 10));
      } else if (destIsParis) {
        // User travels TO Paris → Ripl(a)y stays in Chicago (far, 80-95)
        newProximities.set('Ripl(a)y', 80 + Math.floor(Math.random() * 15));
      } else {
        // Other locations: moderate distance (30-60)
        newProximities.set('Ripl(a)y', 30 + Math.floor(Math.random() * 30));
      }
    }
    
    // Ana is from Paris/Hauts-de-Seine
    if (nephilim.nephilim_name === 'Ana') {
      if (destIsParis) {
        // User travels TO Paris → Ana becomes close (10-20)
        newProximities.set('Ana', 10 + Math.floor(Math.random() * 10));
      } else if (destIsChicago) {
        // User travels TO Chicago → Ana stays in Paris (far, 80-95)
        newProximities.set('Ana', 80 + Math.floor(Math.random() * 15));
      } else {
        // Other locations: moderate distance (30-60)
        newProximities.set('Ana', 30 + Math.floor(Math.random() * 30));
      }
    }
    
    // Other Nephilims: check if their home matches destination
    if (nephilim.nephilim_name !== 'Ripl(a)y' && nephilim.nephilim_name !== 'Ana') {
      const nephilimHomeIsChicago = chicagoLocations.includes(nephilimHomeNormalized);
      const nephilimHomeIsParis = parisLocations.includes(nephilimHomeNormalized);
      
      if ((destIsChicago && nephilimHomeIsChicago) || (destIsParis && nephilimHomeIsParis)) {
        // Same region: close (10-30)
        newProximities.set(nephilim.nephilim_name, 10 + Math.floor(Math.random() * 20));
      } else {
        // Different region: far (60-90)
        newProximities.set(nephilim.nephilim_name, 60 + Math.floor(Math.random() * 30));
      }
    }
  }
  
  return newProximities;
}

/**
 * Travel Invitation System
 */
export interface TravelInvitation {
  nephilimName: string;
  destination: string;
  accepted: boolean;
  reason?: string; // Why they declined
}

/**
 * Generate travel invitation prompt
 */
export function generateTravelInvitationPrompt(
  destination: TravelDestination,
  nephilimsPresent: string[]
): string {
  if (nephilimsPresent.length === 0) {
    return `*You prepare to travel to ${destination.name}...*`;
  }
  
  const nephilimList = nephilimsPresent.join(', ');
  return `*You're about to travel to ${destination.name}. Who would you like to invite?*\\n\\n👥 Present: ${nephilimList}\\n✋ Say "invite [name]" or "bring [name]" to invite someone.\\n🚪 Say "go alone" to travel solo.`;
}

/**
 * Check if Nephilim accepts travel invitation (AI-driven or random)
 */
export function checkNephilimAcceptance(
  nephilimName: string,
  destination: TravelDestination,
  currentProximity: number,
  relationshipLevel: number = 50 // 0-100
): TravelInvitation {
  // Base acceptance chance: 50%
  let acceptanceChance = 0.5;
  
  // Proximity affects acceptance (closer = more likely to accept)
  if (currentProximity < 10) acceptanceChance += 0.3; // Very close
  else if (currentProximity < 30) acceptanceChance += 0.1; // Nearby
  
  // Relationship level affects acceptance
  acceptanceChance += (relationshipLevel - 50) / 100; // -0.5 to +0.5
  
  // Parallel worlds are more interesting (higher acceptance)
  if (destination.type === 'parallel_world') {
    acceptanceChance += 0.2;
  }
  
  // Random roll
  const accepted = Math.random() < acceptanceChance;
  
  // Generate reason for decline
  let reason: string | undefined;
  if (!accepted) {
    const reasons = [
      `*${nephilimName} shakes their head—not interested in going there right now*`,
      `*${nephilimName} declines: "I have something else to do here"*`,
      `*${nephilimName} looks uncertain: "Maybe another time?"*`,
      `*${nephilimName} refuses: "That place... I'd rather stay here"*`,
      `*${nephilimName} is distracted, doesn't respond to invitation*`
    ];
    reason = reasons[Math.floor(Math.random() * reasons.length)];
  }
  
  return {
    nephilimName,
    destination: destination.name,
    accepted,
    reason
  };
}

/**
 * Generate acceptance/decline message
 */
export function generateInvitationResponseMessage(invitation: TravelInvitation): string {
  if (invitation.accepted) {
    return `*${invitation.nephilimName} accepts! They'll travel with you to ${invitation.destination}.*`;
  }
  
  return invitation.reason || `*${invitation.nephilimName} declined the invitation.*`;
}

/**
 * Update proximity for traveling companion (set to 5 = next-to)
 */
export function setCompanionProximity(nephilimName: string): number {
  return 5; // Next-to (intimate travel companion range)
}
