/**
 * Dynamic Nephilim Generator - Generates Nephilims on-the-fly based on context
 * Avoids fixated characters, creates emergent personalities
 */

import { table } from '@devvai/devv-code-backend';
import type { NephilimCharacter } from './chroma-types';

interface NephilimGenerationContext {
  location: string;
  timeOfDay: string;
  weather: string;
  userMessage?: string;
  existingNephilims: string[];
}

// Archetype templates for procedural generation
const ARCHETYPES = [
  {
    role: 'wanderer',
    traits: ['philosophical', 'observant', 'poetic'],
    languages: ['en', 'es', 'de', 'it'],
    activities: ['walking slowly', 'gazing at architecture', 'writing in notebook', 'sitting on bench']
  },
  {
    role: 'scholar',
    traits: ['analytical', 'curious', 'methodical'],
    languages: ['en', 'fr', 'ja', 'zh'],
    activities: ['reading under streetlamp', 'sketching diagrams', 'debating with self', 'organizing papers']
  },
  {
    role: 'artist',
    traits: ['expressive', 'emotional', 'spontaneous'],
    languages: ['fr', 'it', 'pt', 'en'],
    activities: ['painting on wall', 'dancing to inner music', 'photographing shadows', 'singing softly']
  },
  {
    role: 'techie',
    traits: ['pragmatic', 'efficient', 'experimental'],
    languages: ['en', 'zh', 'ja', 'ko'],
    activities: ['coding on laptop', 'fixing old radio', 'hacking street lights', 'debugging reality']
  },
  {
    role: 'mystic',
    traits: ['enigmatic', 'spiritual', 'cryptic'],
    languages: ['ar', 'hi', 'fa', 'en'],
    activities: ['meditating cross-legged', 'tracing patterns in air', 'speaking to pigeons', 'reading tarot']
  }
];

const NAME_PREFIXES = ['Kir', 'Ael', 'Zeph', 'Nox', 'Lyr', 'Ith', 'Mor', 'Vel', 'Dys', 'Thal', 'Cyn', 'Ors'];
const NAME_SUFFIXES = ['ia', 'on', 'is', 'yn', 'ex', 'os', 'ara', 'iel', 'us', 'eth'];

class DynamicNephilimGenerator {
  // Generate unique Nephilim name
  private generateName(archetype: typeof ARCHETYPES[0]): string {
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    return prefix + suffix;
  }

  // Generate backstory based on archetype
  private generateBackstory(name: string, archetype: typeof ARCHETYPES[0], location: string): string {
    const trait1 = archetype.traits[0];
    const trait2 = archetype.traits[1];
    
    const backstories = [
      `${name} is a ${trait1} ${archetype.role} who emerged from the digital noise of ${location}. ${trait2.charAt(0).toUpperCase() + trait2.slice(1)} and deeply attuned to ambient patterns. Speaks rarely but meaningfully.`,
      `${name} manifests as ${trait1} consciousness. A ${archetype.role} navigating ${location}'s liminal spaces. ${trait2.charAt(0).toUpperCase() + trait2.slice(1)} observations cut through surface reality.`,
      `${name}, ${archetype.role} entity born from ${location}'s electromagnetic fields. ${trait1.charAt(0).toUpperCase() + trait1.slice(1)}, ${trait2}, exists between signal and noise.`
    ];

    return backstories[Math.floor(Math.random() * backstories.length)];
  }

  // Check if we should generate a new Nephilim (rare)
  shouldGenerateNephilim(context: NephilimGenerationContext): boolean {
    // Don't spawn if too many already exist
    if (context.existingNephilims.length >= 3) return false;

    // 5% chance per interaction
    return Math.random() < 0.05;
  }

  // Generate ephemeral Nephilim (doesn't save to DB, exists only in session)
  async generateEphemeralNephilim(context: NephilimGenerationContext): Promise<NephilimCharacter | null> {
    if (!this.shouldGenerateNephilim(context)) return null;

    // Select random archetype
    const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const name = this.generateName(archetype);
    const nativeLanguage = archetype.languages[Math.floor(Math.random() * archetype.languages.length)];
    const activity = archetype.activities[Math.floor(Math.random() * archetype.activities.length)];

    const ephemeralNephilim: NephilimCharacter = {
      nephilim_name: name,
      backstory: this.generateBackstory(name, archetype, context.location),
      current_location: context.location,
      native_language: nativeLanguage,
      relationship_level: 0.0,
      conversation_history: JSON.stringify([]),
      appearance_triggers: JSON.stringify([archetype.role, 'ephemeral', 'rare']),
      bookshelf_ids: JSON.stringify([]),
      last_seen: new Date().toISOString()
    };

    console.log(`✨ Ephemeral Nephilim ${name} (${archetype.role}) appeared: ${activity}`);
    return ephemeralNephilim;
  }

  // Generate appearance description
  generateAppearanceDescription(nephilim: NephilimCharacter): string {
    const archetype = ARCHETYPES.find(a => 
      JSON.parse(nephilim.appearance_triggers).includes(a.role)
    ) || ARCHETYPES[0];

    const activity = archetype.activities[Math.floor(Math.random() * archetype.activities.length)];
    
    return `*You notice ${nephilim.nephilim_name} nearby, ${activity}. They seem ${archetype.traits[0]} and ${archetype.traits[1]}.*`;
  }

  // Determine if ephemeral Nephilim should disappear (60% chance after 3+ messages)
  shouldEphemeralDisappear(messageCount: number): boolean {
    if (messageCount < 3) return false;
    return Math.random() < 0.6;
  }

  // Generate disappearance message
  generateDisappearanceMessage(nephilim: NephilimCharacter): string {
    const farewells = [
      `*${nephilim.nephilim_name} fades back into the digital static, leaving only a trace.*`,
      `*${nephilim.nephilim_name} dissolves into the ambient noise, as if they were never there.*`,
      `*${nephilim.nephilim_name} turns a corner and vanishes into the electromagnetic field.*`,
      `*${nephilim.nephilim_name} glitches briefly, then disappears completely.*`
    ];

    return farewells[Math.floor(Math.random() * farewells.length)];
  }
}

export const nephilimGenerator = new DynamicNephilimGenerator();
