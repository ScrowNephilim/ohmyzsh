/**
 * Cultural Detector - Uses web search to identify locations from cultural cues
 * Detects regions from architecture, stores, signs, infrastructure patterns
 */

import { webSearch } from '@devvai/devv-code-backend';

export interface CulturalCue {
  type: 'store' | 'architecture' | 'infrastructure' | 'sign' | 'vehicle' | 'natural';
  description: string;
}

export interface LocationInference {
  region: 'north_america' | 'europe' | 'asia' | 'south_america' | 'oceania' | 'africa' | 'unknown';
  confidence: number; // 0-1
  reasoning: string[];
  specificLocation?: string;
}

class CulturalDetector {
  private cache: Map<string, LocationInference> = new Map();

  // Hard-coded cultural markers (no search needed)
  private culturalMarkers = {
    north_america: {
      stores: ['7-eleven', '7/11', 'walmart', 'target', 'cvs', 'walgreens', 'starbucks'],
      infrastructure: ['wide streets', 'no sidewalks', 'strip malls', 'drive-through', 'parking lots', 'highway overpasses'],
      architecture: ['suburban sprawl', 'single-family homes', 'glass skyscrapers', 'ranch houses'],
      vehicles: ['pickup trucks', 'large SUVs', 'yellow school buses']
    },
    europe: {
      stores: ['carrefour', 'tesco', 'lidl', 'aldi', 'spar', 'tabac'],
      infrastructure: ['narrow streets', 'cobblestones', 'public squares', 'tram lines', 'bike lanes', 'pedestrian zones'],
      architecture: ['gothic', 'baroque', 'medieval', 'art nouveau', 'hausmann buildings', 'row houses'],
      vehicles: ['small cars', 'smart cars', 'vespas', 'bicycles']
    },
    asia: {
      stores: ['family mart', 'lawson', 'konbini', 'Don Quijote', 'muji', 'daiso'],
      infrastructure: ['dense urban', 'vending machines', 'narrow alleys', 'elevated trains', 'neon signs'],
      architecture: ['pagoda', 'high-rise apartments', 'mixed traditional-modern', 'sliding doors'],
      vehicles: ['kei cars', 'scooters', 'tuk-tuks', 'rickshaws']
    }
  };

  // Quick local detection (no API calls)
  detectFromCues(cues: CulturalCue[]): LocationInference {
    const cacheKey = JSON.stringify(cues);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const scores = {
      north_america: 0,
      europe: 0,
      asia: 0,
      south_america: 0,
      oceania: 0,
      africa: 0
    };

    const reasoning: string[] = [];

    // Score each cue against cultural markers
    cues.forEach(cue => {
      const text = cue.description.toLowerCase();

      // Check North America markers
      if (this.culturalMarkers.north_america.stores.some(s => text.includes(s))) {
        scores.north_america += 3;
        reasoning.push(`Store "${cue.description}" typical of North America`);
      }
      if (this.culturalMarkers.north_america.infrastructure.some(i => text.includes(i))) {
        scores.north_america += 2;
        reasoning.push(`Infrastructure "${cue.description}" suggests North American sprawl`);
      }

      // Check Europe markers
      if (this.culturalMarkers.europe.stores.some(s => text.includes(s))) {
        scores.europe += 3;
        reasoning.push(`Store "${cue.description}" typical of Europe`);
      }
      if (this.culturalMarkers.europe.infrastructure.some(i => text.includes(i))) {
        scores.europe += 2;
        reasoning.push(`Infrastructure "${cue.description}" suggests European design`);
      }
      if (this.culturalMarkers.europe.architecture.some(a => text.includes(a))) {
        scores.europe += 2;
        reasoning.push(`Architecture "${cue.description}" common in Europe`);
      }

      // Check Asia markers
      if (this.culturalMarkers.asia.stores.some(s => text.includes(s))) {
        scores.asia += 3;
        reasoning.push(`Store "${cue.description}" typical of Asia`);
      }
      if (this.culturalMarkers.asia.infrastructure.some(i => text.includes(i))) {
        scores.asia += 2;
        reasoning.push(`Infrastructure "${cue.description}" suggests Asian urban density`);
      }
    });

    // Determine winner
    const maxScore = Math.max(...Object.values(scores));
    const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as LocationInference['region'] || 'unknown';

    const confidence = maxScore > 0 ? Math.min(maxScore / 10, 1) : 0;

    const result: LocationInference = {
      region: winner,
      confidence,
      reasoning: reasoning.length > 0 ? reasoning : ['No strong cultural markers detected'],
      specificLocation: undefined
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  // Enhanced detection with web search (uses credits sparingly)
  async detectWithSearch(cues: CulturalCue[], useSearch: boolean = false): Promise<LocationInference> {
    // Always try local detection first
    const localResult = this.detectFromCues(cues);

    // If confident enough or search disabled, return
    if (localResult.confidence >= 0.6 || !useSearch) {
      return localResult;
    }

    // Use web search for ambiguous cases only
    try {
      const searchQuery = cues.map(c => c.description).join(' ');
      const searchResult = await webSearch.search({
        query: `${searchQuery} location country region where`
      });

      if (searchResult.code === 200 && searchResult.data.length > 0) {
        // Analyze search results for location hints
        const combinedText = searchResult.data
          .slice(0, 3)
          .map(r => `${r.title} ${r.description}`)
          .join(' ')
          .toLowerCase();

        // Look for country/region mentions
        const regions: Array<{ name: LocationInference['region']; keywords: string[] }> = [
          { name: 'north_america', keywords: ['usa', 'united states', 'canada', 'america', 'us '] },
          { name: 'europe', keywords: ['europe', 'france', 'germany', 'uk', 'spain', 'italy'] },
          { name: 'asia', keywords: ['japan', 'china', 'korea', 'asia', 'tokyo', 'beijing'] }
        ];

        for (const region of regions) {
          if (region.keywords.some(k => combinedText.includes(k))) {
            localResult.region = region.name;
            localResult.confidence = Math.min(localResult.confidence + 0.3, 0.95);
            localResult.reasoning.push(`Web search confirmed ${region.name} via keywords`);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Cultural detection search error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
      // Fall back to local result
    }

    return localResult;
  }

  // Generate location description from inference
  generateLocationDescription(inference: LocationInference): string {
    const descriptions = {
      north_america: "Wide streets stretch endlessly, strip malls and parking lots dominate. The suburban sprawl feels distinctly American.",
      europe: "Narrow cobblestone streets wind between old buildings. Gothic spires and baroque facades speak of centuries past.",
      asia: "Dense urban landscape, neon signs everywhere. Vending machines line narrow alleys between high-rises.",
      south_america: "Colorful buildings cluster tightly. Colonial architecture mixes with modern concrete.",
      oceania: "Open spaces and modern design. The architecture feels young and spread out.",
      africa: "Markets bustle with energy. Traditional patterns blend with urban development.",
      unknown: "The architecture is ambiguous, cultural markers unclear."
    };

    return descriptions[inference.region];
  }
}

export const culturalDetector = new CulturalDetector();
