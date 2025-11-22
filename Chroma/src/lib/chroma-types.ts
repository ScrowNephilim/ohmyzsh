/**
 * Chroma System Type Definitions
 * Shared types to prevent circular dependencies
 */

export interface EnvironmentState {
  time: string; // e.g., "3:47 AM CST"
  time_of_day?: 'dawn' | 'day' | 'dusk' | 'night'; // Phase 4: Time classification
  weather: string; // e.g., "cold, light rain"
  temperature: string; // e.g., "42°F"
  lighting: string; // e.g., "streetlamps, neon signs"
  activeNephilims?: string[];
  bystanders?: Array<{ name: string; archetype: string }>;
  ambient_sounds?: string[]; // e.g., ["distant traffic", "rain on pavement"]
  activity_level?: string; // e.g., "quiet", "bustling", "deserted"
}

export interface ChromaEnvironment {
  _id?: string;
  _uid?: string;
  location_name: string;
  location_type: string;
  active_nephilims: string; // JSON array
  bystanders: string; // JSON array
  environment_state: string; // JSON object
  background_music_url?: string;
  visual_theme?: string;
  last_updated: string;
}

export interface NephilimCharacter {
  _id?: string;
  _uid?: string;
  nephilim_name: string;
  backstory: string;
  current_location: string;
  native_language: string;
  voice_id?: string; // Optional for ephemeral Nephilims
  relationship_level: number;
  conversation_history: string; // JSON array
  appearance_triggers: string; // JSON array
  bookshelf_ids?: string; // JSON array
  last_seen: string;
  power_name?: string;
  power_description?: string;
  is_ephemeral?: boolean; // Procedurally generated, not in DB
  appearance_count?: number; // Track how many times appeared
}

export interface ChromaMessage {
  role?: 'user' | 'nephilim' | 'environment' | 'bystander'; // Optional for backwards compatibility
  speaker?: string;
  content: string;
  language?: string;
  timestamp: string;
  is_action?: boolean; // true for italicized actions like "*Ripl(a)y changes environment*"
  isMiddleBubble?: boolean; // true for environment narration (centered, italic, no speaker)
  hasBubble?: boolean; // PHASE 4: Wrap action text in opaque bubble for readability
  bubbleOpacity?: number; // PHASE 4: Bubble opacity (default 0.6)
  textFX?: {
    animation?: string;
    style?: string;
    intensity?: number;
  };
}

export interface ChromaInteraction {
  _id?: string;
  _uid?: string;
  environment_id: string;
  participants: string; // JSON array
  messages: string; // JSON array
  environment_events: string; // JSON array
  start_time: string;
  end_time?: string;
  emotional_valence?: number;
}
