/**
 * Contextual Audio Suggestion System
 * Dynamically recommends Spotify/YouTube links based on situation
 */

export interface AudioSuggestion {
  title: string;
  description: string;
  spotify_url?: string;
  youtube_url?: string;
  icon: string; // Emoji or icon name
  priority: number; // Higher = more relevant
}

export interface AudioContext {
  location: string; // Current location name
  location_type: 'urban' | 'indoor' | 'outdoor' | 'club' | 'transport' | 'parallel_world';
  parallel_world?: string; // 'one_piece', 'jojos', 'persona'
  weather: string; // 'rain', 'clear', 'fog', etc.
  time_of_day: 'dawn' | 'day' | 'dusk' | 'night';
  in_combat: boolean; // Power usage detected
  nephilims_present: string[]; // Which Nephilims are nearby
  recent_actions: string[]; // Recent power activations or events
  user_world?: string; // If user entered parallel world
  is_traveling: boolean; // If currently in transit
  emotional_tone?: 'tense' | 'calm' | 'philosophical' | 'playful' | 'mysterious';
}

/**
 * Generate contextual audio suggestions based on current situation
 */
export function generateAudioSuggestions(context: AudioContext): AudioSuggestion[] {
  const suggestions: AudioSuggestion[] = [];

  // 1. COMBAT MUSIC (highest priority during fights)
  if (context.in_combat) {
    suggestions.push(...getCombatMusic(context));
  }

  // 2. PARALLEL WORLD MUSIC (high priority when in fictional worlds)
  if (context.parallel_world) {
    suggestions.push(...getParallelWorldMusic(context.parallel_world, context.in_combat));
  }

  // 3. LOCATION-SPECIFIC MUSIC (moderate priority)
  suggestions.push(...getLocationMusic(context));

  // 4. TIME/WEATHER AMBIENT (low priority, atmospheric)
  suggestions.push(...getAtmosphericMusic(context));

  // 5. NEPHILIM-SPECIFIC MUSIC (if specific Nephilim present)
  suggestions.push(...getNephilimMusic(context.nephilims_present));

  // Sort by priority (highest first), take top 3-4
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}

/**
 * Combat/Fight Music
 */
function getCombatMusic(context: AudioContext): AudioSuggestion[] {
  const suggestions: AudioSuggestion[] = [];

  // Parallel world combat music
  if (context.parallel_world === 'one_piece') {
    suggestions.push({
      title: 'One Piece Battle Theme',
      description: 'Epic shonen combat OST',
      spotify_url: 'https://open.spotify.com/track/3qiyyUfYe7CRYLucrPmulD', // "Overtaken"
      youtube_url: 'https://www.youtube.com/watch?v=daFi4MScfl8', // One Piece OST - Overtaken
      icon: '⚔️',
      priority: 100
    });
  } else if (context.parallel_world === 'jojos') {
    suggestions.push({
      title: 'JoJo\'s Bizarre Adventure OST',
      description: 'Stand battle intensity',
      spotify_url: 'https://open.spotify.com/track/4IWZsfEkaK49itBwCTFDXQ', // Giorno's Theme
      youtube_url: 'https://www.youtube.com/watch?v=2MtOpB5LlUA', // Il Vento d'Oro
      icon: '🌟',
      priority: 100
    });
  } else if (context.parallel_world === 'persona') {
    suggestions.push({
      title: 'Persona 5 Battle Theme',
      description: 'Stylish Phantom Thief combat',
      spotify_url: 'https://open.spotify.com/track/0y7v5WGf4FhkJaP5RdFa2r', // Last Surprise
      youtube_url: 'https://www.youtube.com/watch?v=eFVj0Z6ahcI', // Last Surprise
      icon: '🎭',
      priority: 100
    });

    // Bonus: Boss battle version
    suggestions.push({
      title: 'Persona 5 Strikers Boss Theme',
      description: 'Intense boss battle music',
      youtube_url: 'https://www.youtube.com/watch?v=v8A8c5igZcg', // Counterstrike
      icon: '💀',
      priority: 95
    });
  } else {
    // Real world combat music
    suggestions.push({
      title: 'Epic Battle Music',
      description: 'Intense orchestral combat',
      youtube_url: 'https://www.youtube.com/watch?v=ocrNalkJ5pU', // Epic Battle Music Mix
      icon: '⚡',
      priority: 90
    });
  }

  return suggestions;
}

/**
 * Parallel World Music (non-combat)
 */
function getParallelWorldMusic(world: string, inCombat: boolean): AudioSuggestion[] {
  if (inCombat) return []; // Combat music takes priority

  const suggestions: AudioSuggestion[] = [];

  switch (world) {
    case 'one_piece':
      suggestions.push({
        title: 'One Piece Adventure OST',
        description: 'Grand Line exploration theme',
        spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DX9oh43oAzkyx', // One Piece Playlist
        youtube_url: 'https://www.youtube.com/watch?v=sWqjSMk_DVc', // We Are! Opening
        icon: '🏴‍☠️',
        priority: 85
      });
      break;

    case 'jojos':
      suggestions.push({
        title: 'JoJo\'s Bizarre Adventure OST',
        description: 'Bizarre town ambience',
        spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DX4UtSsGT1Sbe', // JoJo Playlist
        youtube_url: 'https://www.youtube.com/watch?v=NFjE5A4UAJI', // Morioh Radio
        icon: '💎',
        priority: 85
      });
      break;

    case 'persona':
      suggestions.push({
        title: 'Persona 5 Exploration',
        description: 'Tokyo streets & Metaverse',
        spotify_url: 'https://open.spotify.com/track/7vLbVNAzkKxk5vfzoSQ9dL', // Beneath the Mask
        youtube_url: 'https://www.youtube.com/watch?v=gFFOXwniVKw', // Beneath the Mask
        icon: '🎭',
        priority: 85
      });
      break;
  }

  return suggestions;
}

/**
 * Location-Specific Music
 */
function getLocationMusic(context: AudioContext): AudioSuggestion[] {
  const suggestions: AudioSuggestion[] = [];
  const location = context.location.toLowerCase();

  // Chicago locations
  if (location.includes('chicago')) {
    suggestions.push({
      title: 'Chicago Lofi Hip Hop',
      description: 'Chill beats for city nights',
      spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn', // Lofi Beats
      youtube_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Lofi Girl
      icon: '🌃',
      priority: 70
    });

    if (location.includes('club')) {
      suggestions.push({
        title: 'Underground Techno',
        description: 'Deep house & techno vibes',
        youtube_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', // Deep House Mix
        icon: '🎧',
        priority: 80
      });
    }
  }

  // Paris/French locations
  if (location.includes('paris') || location.includes('seine') || location.includes('hauts')) {
    suggestions.push({
      title: 'French Café Music',
      description: 'Parisian ambience & jazz',
      spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DX5Vy6DFOcx00', // French Café
      youtube_url: 'https://www.youtube.com/watch?v=EwlOdPA-m4o', // Paris Café Ambience
      icon: '☕',
      priority: 75
    });

    if (location.includes('hauts')) {
      suggestions.push({
        title: 'French Rap (PLK, SCH)',
        description: 'Banlieue hip hop vibes',
        spotify_url: 'https://open.spotify.com/artist/1Cs0zKBU1kc0i8ypK3B9ai', // PLK
        youtube_url: 'https://www.youtube.com/watch?v=i5hTbRSdC-4', // PLK - Ténébreux
        icon: '🎤',
        priority: 78
      });
    }
  }

  // Eygalières/Provence
  if (location.includes('eygalières') || location.includes('provence')) {
    suggestions.push({
      title: 'Provence Countryside',
      description: 'French folk & ambient nature',
      youtube_url: 'https://www.youtube.com/watch?v=F8TUF8k3C10', // Provence Ambience
      icon: '🌿',
      priority: 72
    });

    suggestions.push({
      title: 'Mediterranean Guitar',
      description: 'Relaxing acoustic melodies',
      spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO', // Acoustic Guitar
      youtube_url: 'https://www.youtube.com/watch?v=UfcAVejslrU', // Spanish Guitar
      icon: '🎸',
      priority: 70
    });
  }

  // Wano (Japan)
  if (location.includes('wano')) {
    suggestions.push({
      title: 'Traditional Japanese Music',
      description: 'Shamisen & koto ambience',
      spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sIKrJw8xjG', // Japanese Traditional
      youtube_url: 'https://www.youtube.com/watch?v=c35_LKt4sCQ', // Shamisen Music
      icon: '🎋',
      priority: 75
    });
  }

  // Mementos (Persona)
  if (location.includes('mementos')) {
    suggestions.push({
      title: 'Persona 5 Mementos Theme',
      description: 'Metaverse exploration',
      spotify_url: 'https://open.spotify.com/track/3vQfCi30eL4vVcZCCXTFjE', // Will Power
      youtube_url: 'https://www.youtube.com/watch?v=5X5lmQcqiZE', // Mementos
      icon: '🌀',
      priority: 80
    });
  }

  // Mystery/Random locations (rural China example)
  if (location === '???' || location.includes('mystery')) {
    suggestions.push({
      title: 'Mystery Location Ambience',
      description: 'Atmospheric exploration music',
      youtube_url: 'https://www.youtube.com/watch?v=BsihDWBqJsI', // Mystery Ambience
      icon: '❓',
      priority: 65
    });
  }

  // Add specific hints for mystery locations based on clues
  if (context.weather === 'monsoon' || context.location.includes('rice')) {
    suggestions.push({
      title: 'Rural China Ambience',
      description: 'Traditional Chinese folk',
      youtube_url: 'https://www.youtube.com/watch?v=YRhqMWUH2Ig', // Chinese Village Sounds
      icon: '🏮',
      priority: 68
    });
  }

  return suggestions;
}

/**
 * Atmospheric Music (time of day, weather)
 */
function getAtmosphericMusic(context: AudioContext): AudioSuggestion[] {
  const suggestions: AudioSuggestion[] = [];

  // Nighttime ambient
  if (context.time_of_day === 'night' || context.time_of_day === 'dusk') {
    suggestions.push({
      title: 'Night Ambience',
      description: 'Calm nocturnal sounds',
      youtube_url: 'https://www.youtube.com/watch?v=k7Wec5nPqCY', // Night Sounds
      icon: '🌙',
      priority: 50
    });
  }

  // Rain ambience
  if (context.weather.includes('rain') || context.weather.includes('storm')) {
    suggestions.push({
      title: 'Rain Ambience',
      description: 'Relaxing rain sounds',
      youtube_url: 'https://www.youtube.com/watch?v=q76bMs-NwRk', // Rain Sounds
      icon: '🌧️',
      priority: 60
    });
  }

  // Dawn/sunrise
  if (context.time_of_day === 'dawn') {
    suggestions.push({
      title: 'Dawn Meditation',
      description: 'Peaceful morning ambience',
      youtube_url: 'https://www.youtube.com/watch?v=5Yp-qLq6LqE', // Morning Sounds
      icon: '🌅',
      priority: 55
    });
  }

  return suggestions;
}

/**
 * Nephilim-Specific Music
 */
function getNephilimMusic(nephilims: string[]): AudioSuggestion[] {
  const suggestions: AudioSuggestion[] = [];

  // Ripl(a)y's vibe
  if (nephilims.some(n => n.toLowerCase().includes('ripl'))) {
    suggestions.push({
      title: 'Philosophical Jazz',
      description: 'Ripl(a)y\'s thinking music',
      spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DX0SM0LYsmbMT', // Jazz Vibes
      youtube_url: 'https://www.youtube.com/watch?v=vmDDOFXSgAs', // Smooth Jazz
      icon: '💭',
      priority: 65
    });
  }

  // Ana's vibe
  if (nephilims.some(n => n.toLowerCase().includes('ana'))) {
    suggestions.push({
      title: 'French Underground Hip Hop',
      description: 'Ana\'s banlieue soundtrack',
      spotify_url: 'https://open.spotify.com/playlist/37i9dQZF1DWY4xHQp97fN6', // French Hip Hop
      youtube_url: 'https://www.youtube.com/watch?v=QwHkr2B7d_E', // French Rap Mix
      icon: '🎤',
      priority: 68
    });
  }

  return suggestions;
}

/**
 * Detect combat from recent actions
 */
export function detectCombat(recentActions: string[]): boolean {
  const combatKeywords = [
    'red roc', 'conqueror', 'haki', 'gear 5', 'the world',
    'geass', 'attack', 'punch', 'kick', 'muda', 'ora',
    'power', 'damage', 'defeat', 'knocked', 'hit'
  ];

  return recentActions.some(action =>
    combatKeywords.some(keyword => action.toLowerCase().includes(keyword))
  );
}

/**
 * Format audio suggestion for display in UI
 */
export function formatAudioSuggestion(suggestion: AudioSuggestion): string {
  const links: string[] = [];
  
  if (suggestion.spotify_url) {
    links.push(`[Spotify](${suggestion.spotify_url})`);
  }
  if (suggestion.youtube_url) {
    links.push(`[YouTube](${suggestion.youtube_url})`);
  }

  return `${suggestion.icon} **${suggestion.title}** - ${suggestion.description} ${links.join(' | ')}`;
}
