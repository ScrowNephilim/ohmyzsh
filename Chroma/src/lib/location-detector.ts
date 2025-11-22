/**
 * Location Detector - Determines location based on time, architecture, and context
 * Uses real-time data to infer geographic location dynamically
 */

export interface LocationHint {
  region: string; // 'europe', 'asia', 'americas', 'unknown'
  confidence: number; // 0-1
  reasoning: string;
  suggestedLocations: string[];
}

export interface ArchitecturalHints {
  buildingStyle?: string; // 'gothic', 'modern', 'traditional-asian', 'industrial'
  streetLayout?: string; // 'grid', 'winding', 'wide-boulevards'
  landmarks?: string[]; // Specific architectural features
  language?: string; // Signs, text visible in environment
}

/**
 * Detect probable location based on current time
 * Logic: If nighttime (22:00-06:00), location is likely on opposite side of globe
 */
export function detectLocationByTime(): LocationHint {
  const now = new Date();
  const hour = now.getHours();
  
  // Nighttime in current timezone (22:00-06:00)
  if (hour >= 22 || hour < 6) {
    // Likely in Europe/Africa/Asia
    const confidence = 0.7;
    return {
      region: 'europe-asia',
      confidence,
      reasoning: `Nighttime (${hour}:00) suggests Europe or Asia timezone`,
      suggestedLocations: [
        'Paris, France',
        'Berlin, Germany',
        'Tokyo, Japan',
        'Seoul, South Korea',
        'London, UK'
      ]
    };
  }
  
  // Daytime - likely Americas or Asia
  if (hour >= 6 && hour < 12) {
    return {
      region: 'americas',
      confidence: 0.6,
      reasoning: `Morning hours (${hour}:00) suggest Americas or early Asia`,
      suggestedLocations: [
        'Chicago, USA',
        'New York, USA',
        'Los Angeles, USA',
        'Mexico City, Mexico'
      ]
    };
  }
  
  // Afternoon/Evening
  return {
    region: 'unknown',
    confidence: 0.4,
    reasoning: `Mid-day hours (${hour}:00) - ambiguous`,
    suggestedLocations: ['Multiple timezones possible']
  };
}

/**
 * Refine location based on architectural hints
 */
export function refineLocationByArchitecture(
  timeHint: LocationHint,
  architecture: ArchitecturalHints
): LocationHint {
  const { buildingStyle, streetLayout, landmarks, language } = architecture;
  
  let refinedRegion = timeHint.region;
  let confidence = timeHint.confidence;
  let suggestedLocations = [...timeHint.suggestedLocations];
  let reasoning = timeHint.reasoning;
  
  // European architectural markers
  if (buildingStyle === 'gothic' || streetLayout === 'winding' || streetLayout === 'wide-boulevards') {
    refinedRegion = 'europe';
    confidence = Math.min(confidence + 0.2, 0.95);
    reasoning += ' + European architectural style detected';
    suggestedLocations = [
      'Paris, France',
      'Prague, Czech Republic',
      'Barcelona, Spain',
      'Vienna, Austria'
    ];
  }
  
  // Asian architectural markers
  if (buildingStyle === 'traditional-asian' || language === 'chinese' || language === 'japanese' || language === 'korean') {
    refinedRegion = 'asia';
    confidence = Math.min(confidence + 0.25, 0.95);
    reasoning += ' + Asian architectural/linguistic markers';
    suggestedLocations = [
      'Tokyo, Japan',
      'Seoul, South Korea',
      'Shanghai, China',
      'Taipei, Taiwan'
    ];
  }
  
  // Modern/Industrial - Could be Americas or Asia
  if (buildingStyle === 'modern' || buildingStyle === 'industrial') {
    if (timeHint.region === 'americas') {
      suggestedLocations = [
        'Chicago, USA',
        'New York, USA',
        'Seattle, USA'
      ];
    }
    reasoning += ' + Modern/industrial architecture';
  }
  
  // Language-based refinement
  if (language === 'french') {
    refinedRegion = 'europe';
    confidence = 0.9;
    suggestedLocations = ['Paris, France', 'Lyon, France', 'Montreal, Canada'];
    reasoning += ' + French language detected';
  }
  
  return {
    region: refinedRegion,
    confidence,
    reasoning,
    suggestedLocations
  };
}

/**
 * Generate environment description based on detected location
 */
export function generateEnvironmentDescription(location: LocationHint, architecture: ArchitecturalHints): string {
  const locationName = location.suggestedLocations[0] || 'Unknown City';
  const now = new Date();
  const hour = now.getHours();
  
  let timeDescription = '';
  let atmosphere = '';
  
  if (hour >= 22 || hour < 6) {
    timeDescription = 'late night';
    atmosphere = 'quiet streets, occasional distant sounds, streetlamps casting long shadows';
  } else if (hour >= 6 && hour < 12) {
    timeDescription = 'early morning';
    atmosphere = 'city waking up, fresh air, soft golden light';
  } else if (hour >= 12 && hour < 18) {
    timeDescription = 'afternoon';
    atmosphere = 'bustling activity, full daylight, urban energy';
  } else {
    timeDescription = 'evening';
    atmosphere = 'twilight settling, lights coming on, day winding down';
  }
  
  const architecturalDesc = architecture.buildingStyle 
    ? `, ${architecture.buildingStyle} architecture visible`
    : '';
  
  return `${locationName} - ${timeDescription}. ${atmosphere}${architecturalDesc}.`;
}

/**
 * Complete location detection workflow
 */
export function detectCurrentLocation(architecture: ArchitecturalHints = {}): {
  location: LocationHint;
  description: string;
  nephilimTriggers: string[]; // Which Nephilims might appear here
} {
  const timeHint = detectLocationByTime();
  const refinedLocation = refineLocationByArchitecture(timeHint, architecture);
  const description = generateEnvironmentDescription(refinedLocation, architecture);
  
  // Determine which Nephilims might appear based on location
  let nephilimTriggers: string[] = ['Ripl(a)y']; // Always available
  
  if (refinedLocation.suggestedLocations.some(loc => loc.includes('Paris') || loc.includes('France'))) {
    nephilimTriggers.push('Ana'); // Ana appears in French locations
  }
  
  // More Nephilims can be added based on location
  // Example: Tokyo → Japanese Nephilim, etc.
  
  return {
    location: refinedLocation,
    description,
    nephilimTriggers
  };
}
