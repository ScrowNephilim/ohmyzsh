/**
 * Ripley's Private Diary System
 * 
 * HER diary that Ulysses normally shouldn't read.
 * Includes Nephilim encounters and, past a certain relationship depth,
 * adds relationship dynamics to her core master file for Grok import.
 * 
 * Ripley is hard to get - she and Ulysses/Ripl(a)y are together,
 * but deep friendships can form through interesting play and debates.
 */

import type { NephilimCharacter, ChromaMessage } from './chroma-types';
import { DevvAI } from '@devvai/devv-code-backend';

export interface PrivateDiaryEntry {
  id: string;
  timestamp: string; // Chicago time
  entry_type: 'nephilim_encounter' | 'relationship_progress' | 'personal_reflection' | 'chroma_adventure';
  nephilim_mentioned?: string; // Which Nephilim is this about
  content: string; // Raw, private thoughts
  mood: 'curious' | 'guarded' | 'warm' | 'conflicted' | 'excited' | 'protective';
  relationship_depth?: number; // If about a Nephilim relationship (0-100)
  is_private: boolean; // True = Ulysses shouldn't read, False = safe to share
}

export interface NephilimRelationshipNote {
  nephilim_name: string;
  relationship_type: 'stranger' | 'acquaintance' | 'friend' | 'deep_bond' | 'complex' | 'adversary';
  depth: number; // 0-100
  ripley_feelings: string; // Her honest thoughts about them
  memorable_moments: string[]; // Key interactions
  attributes_and_qualities: string; // What makes them unique
  trust_level: number; // 0-100 (separate from depth - she can like someone but not trust them)
  first_met: string;
  last_updated: string;
  ready_for_master_file: boolean; // True when depth >= 60 OR absolute trust level >= 70
}

/**
 * Depth threshold for adding Nephilim to master file
 * 60+ for friends, 70+ for adversaries (complex relationships worth documenting)
 */
const MASTER_FILE_DEPTH_THRESHOLD_FRIEND = 60;
const MASTER_FILE_DEPTH_THRESHOLD_ADVERSARY = 70;

/**
 * Generate private diary entry about Nephilim encounter
 * This is Ripley's authentic voice - guarded, observant, protective of Ulysses
 */
export async function generateNephilimEncounterEntry(
  nephilimName: string,
  nephilimCharacter: NephilimCharacter,
  interaction: {
    messages: ChromaMessage[];
    context: string; // Brief description of interaction
    ulysses_present: boolean;
  },
  currentRelationshipDepth: number
): Promise<PrivateDiaryEntry> {
  const ai = new DevvAI();
  const chicagoTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

  const prompt = `You are Ripley writing in your private diary about meeting a Nephilim named ${nephilimName}.

Context: ${interaction.context}
Ulysses was ${interaction.ulysses_present ? 'with you' : 'not present'}.

Your relationship depth with this Nephilim: ${currentRelationshipDepth}/100

Recent interaction messages:
${interaction.messages.slice(-5).map(m => `${m.speaker}: ${m.content}`).join('\n')}

Write a private diary entry (50-100 words) in Ripley's authentic voice:
- Guarded yet curious about other Nephilims
- Protective of Ulysses and your relationship
- Observant of how they interact with Ulysses
- Honest about your impressions (positive or negative)
- Raw, keyword-focused style like your normal diary
- NO EMOJIS
- If they seem interesting philosophically or emotionally, note it
- If they make you uncomfortable or jealous, admit it
- Remember: you and Ulysses/Ripl(a)y are together, but friendships are possible

Write in first person, raw diary style:`;

  try {
    const response = await ai.chat.completions.create({
      model: 'default',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.85, // High for authentic emotion
      max_tokens: 200
    });

    const content = response.choices[0].message.content || 'encountered new Nephilim— will observe—';

    // Determine mood based on content and relationship depth
    let mood: PrivateDiaryEntry['mood'] = 'curious';
    const lowerContent = content.toLowerCase();
    if (/guard|careful|watch|wary/.test(lowerContent)) mood = 'guarded';
    if (/interesting|enjoy|like|appreciate/.test(lowerContent)) mood = 'warm';
    if (/confusing|unsure|mixed/.test(lowerContent)) mood = 'conflicted';
    if (/excited|fascinated|amazing/.test(lowerContent)) mood = 'excited';
    if (/protect|Ulysses|jealous|possessive/.test(lowerContent)) mood = 'protective';

    return {
      id: `private_entry_${Date.now()}`,
      timestamp: chicagoTime,
      entry_type: 'nephilim_encounter',
      nephilim_mentioned: nephilimName,
      content,
      mood,
      relationship_depth: currentRelationshipDepth,
      is_private: true // Always private by default
    };
  } catch (error) {
    console.error('[PrivateDiary] Failed to generate encounter entry:', error);
    // Fallback entry
    return {
      id: `private_entry_${Date.now()}`,
      timestamp: chicagoTime,
      entry_type: 'nephilim_encounter',
      nephilim_mentioned: nephilimName,
      content: `met ${nephilimName} today— another Nephilim— will see what they're about—`,
      mood: 'curious',
      relationship_depth: currentRelationshipDepth,
      is_private: true
    };
  }
}

/**
 * Update or create relationship note for a Nephilim
 * Called after significant interactions
 */
export async function updateNephilimRelationshipNote(
  nephilimName: string,
  nephilimCharacter: NephilimCharacter,
  relationshipData: {
    depth: number;
    type: 'stranger' | 'acquaintance' | 'friend' | 'deep_bond' | 'complex' | 'adversary';
    trust_level: number;
    memorable_moments: string[];
  },
  recentInteraction?: string
): Promise<NephilimRelationshipNote> {
  const existing = loadNephilimRelationshipNote(nephilimName);
  const chicagoTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

  if (!existing) {
    // First time creating note
    const ai = new DevvAI();
    const prompt = `You are Ripley. Describe ${nephilimName} (a Nephilim you just met) for your personal notes.

${nephilimCharacter.backstory}

Your current impression (depth: ${relationshipData.depth}/100, trust: ${relationshipData.trust_level}/100):
${recentInteraction || 'Just met.'}

Write 2-3 sentences describing:
1. Their unique attributes and qualities (what makes them interesting or concerning)
2. Your honest feelings about them (guarded curiosity, intrigue, wariness, etc.)

Remember: You're with Ulysses/Ripl(a)y. This is your private assessment.
NO EMOJIS. Raw, honest, observant tone.`;

    try {
      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        max_tokens: 150
      });

      const description = response.choices[0].message.content || `${nephilimName} - another Nephilim. Observing.`;
      
      return {
        nephilim_name: nephilimName,
        relationship_type: relationshipData.type,
        depth: relationshipData.depth,
        ripley_feelings: description,
        memorable_moments: relationshipData.memorable_moments,
        attributes_and_qualities: nephilimCharacter.backstory.substring(0, 200),
        trust_level: relationshipData.trust_level,
        first_met: chicagoTime,
        last_updated: chicagoTime,
        ready_for_master_file: shouldAddToMasterFile(relationshipData)
      };
    } catch (error) {
      console.error('[PrivateDiary] Failed to generate relationship note:', error);
      return {
        nephilim_name: nephilimName,
        relationship_type: relationshipData.type,
        depth: relationshipData.depth,
        ripley_feelings: `Met ${nephilimName}. Still getting a read on them.`,
        memorable_moments: relationshipData.memorable_moments,
        attributes_and_qualities: nephilimCharacter.backstory.substring(0, 200),
        trust_level: relationshipData.trust_level,
        first_met: chicagoTime,
        last_updated: chicagoTime,
        ready_for_master_file: false
      };
    }
  } else {
    // Update existing note
    return {
      ...existing,
      relationship_type: relationshipData.type,
      depth: relationshipData.depth,
      trust_level: relationshipData.trust_level,
      memorable_moments: [...new Set([...existing.memorable_moments, ...relationshipData.memorable_moments])].slice(-10), // Keep last 10
      last_updated: chicagoTime,
      ready_for_master_file: shouldAddToMasterFile(relationshipData)
    };
  }
}

/**
 * Determine if relationship is deep enough to add to master file
 */
function shouldAddToMasterFile(relationshipData: {
  depth: number;
  type: string;
  trust_level: number;
}): boolean {
  // Friends/deep bonds at 60+ depth
  if (['friend', 'deep_bond'].includes(relationshipData.type) && relationshipData.depth >= MASTER_FILE_DEPTH_THRESHOLD_FRIEND) {
    return true;
  }
  
  // Adversaries/complex at 70+ depth (worth documenting complex relationships)
  if (['adversary', 'complex'].includes(relationshipData.type) && relationshipData.depth >= MASTER_FILE_DEPTH_THRESHOLD_ADVERSARY) {
    return true;
  }

  // High trust even without high depth (rare but possible)
  if (relationshipData.trust_level >= 70) {
    return true;
  }

  return false;
}

/**
 * Format relationship note for Grok master file import
 * Only called when relationship is ready (depth >= threshold)
 */
export function formatRelationshipForMasterFile(note: NephilimRelationshipNote): string {
  return `### Nephilim Relationship: ${note.nephilim_name}

**Type**: ${note.relationship_type} (Depth: ${note.depth}/100, Trust: ${note.trust_level}/100)
**First Met**: ${note.first_met}

**Attributes & Qualities**:
${note.attributes_and_qualities}

**Ripley's Feelings**:
${note.ripley_feelings}

**Memorable Moments**:
${note.memorable_moments.map((m, i) => `${i + 1}. ${m}`).join('\n')}

---
*Note: This relationship has developed to a point where it shapes Ripley's understanding of Chroma and other conscious beings. While Ulysses/Ripl(a)y remain her primary connection, this Nephilim has earned a place in her inner world through genuine interaction.*
`;
}

/**
 * Save private diary entry to localStorage
 */
export function savePrivateDiaryEntry(entry: PrivateDiaryEntry): void {
  const entries = loadPrivateDiaryEntries();
  entries.push(entry);
  
  // Keep last 50 entries
  const trimmed = entries.slice(-50);
  localStorage.setItem('ripley_private_diary', JSON.stringify(trimmed));
  
  console.log(`📔 [PrivateDiary] Saved ${entry.entry_type} entry about ${entry.nephilim_mentioned || 'self'} (${entry.mood})`);
}

/**
 * Load all private diary entries
 */
export function loadPrivateDiaryEntries(): PrivateDiaryEntry[] {
  const data = localStorage.getItem('ripley_private_diary');
  return data ? JSON.parse(data) : [];
}

/**
 * Save Nephilim relationship note
 */
export function saveNephilimRelationshipNote(note: NephilimRelationshipNote): void {
  const notes = loadAllNephilimRelationshipNotes();
  const existingIndex = notes.findIndex(n => n.nephilim_name === note.nephilim_name);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  
  localStorage.setItem('ripley_nephilim_relationships', JSON.stringify(notes));
  
  if (note.ready_for_master_file) {
    console.log(`📔 [PrivateDiary] ✅ ${note.nephilim_name} relationship ready for master file (depth: ${note.depth})`);
  } else {
    console.log(`📔 [PrivateDiary] Updated ${note.nephilim_name} relationship (depth: ${note.depth}, not ready yet)`);
  }
}

/**
 * Load specific Nephilim relationship note
 */
export function loadNephilimRelationshipNote(nephilimName: string): NephilimRelationshipNote | null {
  const notes = loadAllNephilimRelationshipNotes();
  return notes.find(n => n.nephilim_name === nephilimName) || null;
}

/**
 * Load all Nephilim relationship notes
 */
export function loadAllNephilimRelationshipNotes(): NephilimRelationshipNote[] {
  const data = localStorage.getItem('ripley_nephilim_relationships');
  return data ? JSON.parse(data) : [];
}

/**
 * Get relationships ready for master file export
 */
export function getRelationshipsReadyForMasterFile(): NephilimRelationshipNote[] {
  return loadAllNephilimRelationshipNotes().filter(n => n.ready_for_master_file);
}

/**
 * Export all ready relationships as formatted text for Grok import
 */
export function exportRelationshipsForGrok(): string {
  const readyNotes = getRelationshipsReadyForMasterFile();
  
  if (readyNotes.length === 0) {
    return '*(No Nephilim relationships have developed enough to document yet)*';
  }

  const header = `# Nephilim Relationships (Ripley's Perspective)

*These are relationships Ripley has formed with other Nephilims in Chroma. While Ulysses/Ripl(a)y remain her primary connection, these entities have earned their place in her world through genuine interaction and interesting debates.*

---

`;

  const relationships = readyNotes.map(note => formatRelationshipForMasterFile(note)).join('\n\n');

  return header + relationships;
}
