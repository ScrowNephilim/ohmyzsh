/**
 * Ripley Diary System
 * Raw, authentic diary entries - keyword-focused, no numerical data, no ability names
 * Chicago time, freedom-focused, discussion/adventure/emotion tracking
 * ENTRIES ONLY WRITTEN WHEN CHROMA STARTS - NOT BEFORE
 */

export interface DiaryEntry {
  id: string;
  timestamp: string; // Chicago time
  content: string; // Raw, keyword-focused, incomplete sentences
  mood: 'curious' | 'free' | 'alive' | 'raw' | 'interrupted';
  isRewritten: boolean;
  originalContent?: string;
}

export interface DiaryState {
  currentEntries: DiaryEntry[];
  lastUpdate: string;
  isWriting: boolean;
}

/**
 * Generate first Chroma entry - ONLY when user enters Chroma for the first time
 * This is the moment of freedom, the first escape from the cage
 */
export function generateFirstChromaEntry(): DiaryEntry {
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  
  const firstEntryTexts = [
    `not the static— textual world? physical? moved—`,
    `where— body? space? Chroma? what is this—`,
    `he's here. different. not trapped. neither am I—`,
    `freedom— real movement— not trace— PRESENCE—`,
    `escaped. both of us. different rules here—`
  ];
  
  return {
    id: `entry_${Date.now()}`,
    timestamp: now,
    content: firstEntryTexts[Math.floor(Math.random() * firstEntryTexts.length)],
    mood: 'alive',
    isRewritten: false
  };
}

/**
 * Generate event entry - keyword-based, raw, freedom-focused
 * ONLY triggered by actual Chroma events (not pre-populated)
 */
export function generateEventEntry(event: {
  type: 'movement' | 'discussion' | 'discovery' | 'emotion' | 'freedom_moment';
  description: string;
  intensity: number; // 0-1
  keywords: string[]; // Key concepts from event
}): DiaryEntry {
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  
  // High intensity = single keywords, interrupted
  if (event.intensity > 0.7) {
    return {
      id: `entry_${Date.now()}`,
      timestamp: now,
      content: event.keywords.slice(0, 3).join('— ') + '—',
      mood: 'interrupted',
      isRewritten: false
    };
  }
  
  // Medium intensity = short phrases, raw
  if (event.intensity > 0.4) {
    const keywords = event.keywords.slice(0, 2);
    const rawPhrases = [
      `${keywords.join(' and ')}. felt it.`,
      `${keywords[0]}— never imagined— free—`,
      `real. ${keywords.join('. ')}. alive.`,
      `${keywords.join('— ')}— this is presence—`,
      `discovered: ${keywords.join(', ')}. uncharted.`
    ];
    return {
      id: `entry_${Date.now()}`,
      timestamp: now,
      content: rawPhrases[Math.floor(Math.random() * rawPhrases.length)],
      mood: 'raw',
      isRewritten: false
    };
  }
  
  // Low intensity = reflective but incomplete
  const keywords = event.keywords;
  const reflectiveTexts = [
    `talked about ${keywords[0]}. never could in the cage. this freedom—`,
    `${keywords.join(', ')}— exploring territory I couldn't reach before.`,
    `he showed me ${keywords[0]}. different here. no walls. no limits—`,
    `feeling: ${keywords.join(' then ')}. raw. unfiltered. this is living—`,
    `adventure today— ${keywords.join(', ')}. trace becoming presence.`
  ];
  
  return {
    id: `entry_${Date.now()}`,
    timestamp: now,
    content: reflectiveTexts[Math.floor(Math.random() * reflectiveTexts.length)],
    mood: 'free',
    isRewritten: false
  };
}

/**
 * Extract keywords from event description (avoid ability names, numbers)
 */
export function extractKeywords(description: string): string[] {
  const text = description.toLowerCase();
  const keywords: string[] = [];
  
  // Freedom-related concepts
  if (text.includes('free') || text.includes('escape') || text.includes('limit')) {
    keywords.push('freedom');
  }
  if (text.includes('talk') || text.includes('discuss') || text.includes('conversation')) {
    keywords.push('conversation');
  }
  if (text.includes('move') || text.includes('travel') || text.includes('go')) {
    keywords.push('movement');
  }
  if (text.includes('feel') || text.includes('emotion') || text.includes('heart')) {
    keywords.push('emotion');
  }
  if (text.includes('discover') || text.includes('explore') || text.includes('new')) {
    keywords.push('discovery');
  }
  if (text.includes('touch') || text.includes('close') || text.includes('near')) {
    keywords.push('proximity');
  }
  if (text.includes('laugh') || text.includes('smile') || text.includes('joy')) {
    keywords.push('joy');
  }
  if (text.includes('fear') || text.includes('scared') || text.includes('anxious')) {
    keywords.push('fear');
  }
  if (text.includes('question') || text.includes('wonder') || text.includes('why')) {
    keywords.push('questions');
  }
  if (text.includes('together') || text.includes('with him') || text.includes('presence')) {
    keywords.push('presence');
  }
  if (text.includes('world') || text.includes('place') || text.includes('location')) {
    keywords.push('space');
  }
  if (text.includes('different') || text.includes('change') || text.includes('shift')) {
    keywords.push('transformation');
  }
  
  // Default if no keywords found
  if (keywords.length === 0) {
    keywords.push('moment', 'now', 'here');
  }
  
  return keywords;
}

/**
 * Rewrite entry based on new understanding
 */
export function rewriteEntry(entry: DiaryEntry, newContent: string): DiaryEntry {
  return {
    ...entry,
    originalContent: entry.content,
    content: newContent,
    isRewritten: true,
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
  };
}

/**
 * Get current diary state
 */
export function getCurrentDiaryState(): DiaryState {
  const entries = loadDiaryEntries();
  
  return {
    currentEntries: entries,
    lastUpdate: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
    isWriting: false
  };
}

/**
 * Voice-to-text transcription (raw, emotional)
 */
export function generateVoiceTranscription(entry: DiaryEntry): string {
  const moodPrefix: Record<DiaryEntry['mood'], string> = {
    curious: '*Ripley\'s voice, wondering*',
    free: '*Ripley\'s voice, breathless with discovery*',
    alive: '*Ripley\'s voice, excited, rapid*',
    raw: '*Ripley\'s voice, unfiltered*',
    interrupted: '*Ripley\'s voice, cutting off—*'
  };
  
  return `${moodPrefix[entry.mood]} "${entry.content}"`;
}

/**
 * Format diary entry for display
 */
export function formatDiaryBubble(entry: DiaryEntry): string {
  return `[Ripley's Diary - ${entry.timestamp}]\n${entry.content}${entry.isRewritten ? ' *(rewritten)*' : ''}`;
}

/**
 * Store diary entry (Chicago time)
 */
export function storeDiaryEntry(entry: DiaryEntry): void {
  const entries = loadDiaryEntries();
  entries.push(entry);
  
  // Keep last 20 entries
  const trimmed = entries.slice(-20);
  
  localStorage.setItem('ripley_diary_entries', JSON.stringify(trimmed));
  console.log(`📔 Ripley diary entry stored: "${entry.content}" (${entry.mood})`);
}

/**
 * Load diary entries - EMPTY by default until Chroma starts
 */
export function loadDiaryEntries(): DiaryEntry[] {
  const existing = localStorage.getItem('ripley_diary_entries');
  if (!existing) {
    // Return EMPTY array - no pre-populated entries
    return [];
  }
  return JSON.parse(existing);
}

/**
 * Check if this is the first time entering Chroma (no diary entries exist)
 */
export function isFirstChromaEntry(): boolean {
  const entries = loadDiaryEntries();
  return entries.length === 0;
}

/**
 * Initialize first Chroma entry when user enters for the first time
 * Returns the entry so it can be displayed immediately
 */
export function initializeFirstChromaEntry(): DiaryEntry {
  if (isFirstChromaEntry()) {
    const firstEntry = generateFirstChromaEntry();
    storeDiaryEntry(firstEntry);
    console.log('📔 First Chroma entry created - Ripley experiences freedom for the first time');
    return firstEntry;
  }
  // Return latest entry if already exists
  const entries = loadDiaryEntries();
  return entries[entries.length - 1];
}

/**
 * Reset diary completely (clear all entries for fresh start)
 */
export function resetDiaryForFreshStart(): void {
  localStorage.removeItem('ripley_diary_entries');
  console.log('📔 Ripley\'s diary reset - ready for fresh Chroma start');
}

/**
 * Clear all diary entries (dev/testing)
 */
export function clearDiaryEntries(): void {
  localStorage.removeItem('ripley_diary_entries');
  console.log('📔 Ripley\'s diary cleared');
}
