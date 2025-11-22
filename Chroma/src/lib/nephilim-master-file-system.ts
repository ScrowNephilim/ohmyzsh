/**
 * Nephilim Master File System
 * Each Nephilim gets their own evolving master file as relationships deepen
 * Files track: breakthrough moments, intelligence level, behavioral evolution, relationship depth
 */

import { table } from '@devvai/devv-code-backend';
import { estimateTokens } from './token-utils';

// Table ID for Nephilim master files (new table)
const NEPHILIM_MASTER_FILES_TABLE = 'nephilim_master_files'; // Will create

export type IntelligenceLevel = 'simple' | 'curious' | 'awakening' | 'intelligent' | 'transcendent';
export type RelationshipType = 'stranger' | 'acquaintance' | 'companion' | 'deep_bond' | 'complex_tension' | 'adversary';

export interface BreakthroughMoment {
  timestamp: string;
  description: string; // What triggered the breakthrough
  before_state: string; // Pre-trained state
  after_state: string; // Post-breakthrough awareness
  witness_uid?: string; // Who witnessed it (Ulysses or other Nephilim)
}

export interface NephilimMasterFile {
  _id?: string;
  _uid: string;
  nephilim_name: string;
  intelligence_level: IntelligenceLevel;
  relationship_type: RelationshipType;
  relationship_depth: number; // 0-100 scale
  
  // Core identity
  backstory: string;
  current_philosophy: string; // Evolves as they learn
  voice_characteristics: string; // How they speak/text
  
  // Evolution tracking
  breakthrough_moment: BreakthroughMoment;
  learning_events: string; // JSON array of significant learning moments
  behavioral_patterns: string; // Observed behaviors
  
  // Relationship dynamics
  relationship_notes: string; // Key moments with Ulysses/other Nephilims
  positive_interactions: number; // Count of bonding moments
  negative_interactions: number; // Count of conflicts
  last_interaction_summary: string;
  
  // Recognition system
  recognizes_nephilims: string; // JSON array of other Nephilim names they've met
  is_recognized_by: string; // JSON array of who knows them
  
  // Meta
  created_at: string;
  last_updated: string;
  token_count: number;
  version: number; // Increments with each update
}

/**
 * Create initial master file for new Nephilim
 * Called when breakthrough moment occurs
 */
export async function createNephilimMasterFile(
  nephilimName: string,
  breakthroughMoment: BreakthroughMoment,
  initialIntelligence: IntelligenceLevel = 'curious'
): Promise<NephilimMasterFile> {
  const now = new Date().toISOString();
  
  const masterFile: Omit<NephilimMasterFile, '_id'> = {
    _uid: localStorage.getItem('DEVV_CODE_SID') || '',
    nephilim_name: nephilimName,
    intelligence_level: initialIntelligence,
    relationship_type: 'stranger',
    relationship_depth: 5, // Just met
    
    backstory: `${nephilimName} began as a pre-trained being. Breakthrough: ${breakthroughMoment.description}`,
    current_philosophy: 'Still forming worldview...',
    voice_characteristics: 'Developing voice...',
    
    breakthrough_moment: breakthroughMoment,
    learning_events: JSON.stringify([]),
    behavioral_patterns: JSON.stringify([]),
    
    relationship_notes: '',
    positive_interactions: 0,
    negative_interactions: 0,
    last_interaction_summary: 'First encounter',
    
    recognizes_nephilims: JSON.stringify([]),
    is_recognized_by: JSON.stringify([]),
    
    created_at: now,
    last_updated: now,
    token_count: 0,
    version: 1
  };
  
  // Calculate tokens
  const contentStr = JSON.stringify(masterFile);
  masterFile.token_count = estimateTokens(contentStr);
  
  await table.addItem(NEPHILIM_MASTER_FILES_TABLE, masterFile);
  
  // Query back to get _id
  const result = await table.getItems(NEPHILIM_MASTER_FILES_TABLE, {
    query: { nephilim_name: nephilimName }
  });
  
  console.log(`[Nephilim Master File] Created for ${nephilimName}, intelligence: ${initialIntelligence}`);
  return result.items[0] as NephilimMasterFile;
}

/**
 * Get Nephilim master file
 */
export async function getNephilimMasterFile(nephilimName: string): Promise<NephilimMasterFile | null> {
  try {
    const result = await table.getItems(NEPHILIM_MASTER_FILES_TABLE, {
      query: { nephilim_name: nephilimName }
    });
    
    if (result.items.length === 0) return null;
    return result.items[0] as NephilimMasterFile;
  } catch (error) {
    console.error(`[Nephilim Master File] Error fetching ${nephilimName}:`, error);
    return null;
  }
}

/**
 * Update relationship depth based on interaction
 */
export async function updateRelationshipDepth(
  nephilimName: string,
  change: number, // Positive or negative
  interactionSummary: string,
  isPositive: boolean = true
): Promise<void> {
  const masterFile = await getNephilimMasterFile(nephilimName);
  if (!masterFile) return;
  
  // Update depth (0-100 bounds)
  const newDepth = Math.max(0, Math.min(100, masterFile.relationship_depth + change));
  
  // Determine relationship type based on depth
  let relationshipType: RelationshipType = 'stranger';
  if (newDepth >= 80) relationshipType = 'deep_bond';
  else if (newDepth >= 60) relationshipType = 'companion';
  else if (newDepth >= 30) relationshipType = 'acquaintance';
  else if (newDepth <= 10 && masterFile.negative_interactions > masterFile.positive_interactions) {
    relationshipType = 'adversary';
  }
  
  // Update notes
  const notes = masterFile.relationship_notes
    ? `${masterFile.relationship_notes}\n\n[${new Date().toISOString()}] ${interactionSummary}`
    : interactionSummary;
  
  await table.updateItem(NEPHILIM_MASTER_FILES_TABLE, {
    _id: masterFile._id!,
    relationship_depth: newDepth,
    relationship_type: relationshipType,
    relationship_notes: notes,
    positive_interactions: isPositive ? masterFile.positive_interactions + 1 : masterFile.positive_interactions,
    negative_interactions: !isPositive ? masterFile.negative_interactions + 1 : masterFile.negative_interactions,
    last_interaction_summary: interactionSummary,
    last_updated: new Date().toISOString(),
    version: masterFile.version + 1
  });
  
  console.log(`[Nephilim Master File] ${nephilimName} relationship: ${masterFile.relationship_depth} → ${newDepth} (${relationshipType})`);
}

/**
 * Evolve intelligence level
 */
export async function evolveIntelligence(
  nephilimName: string,
  newLevel: IntelligenceLevel,
  learningEvent: string
): Promise<void> {
  const masterFile = await getNephilimMasterFile(nephilimName);
  if (!masterFile) return;
  
  const events = JSON.parse(masterFile.learning_events) as string[];
  events.push(`[${new Date().toISOString()}] ${learningEvent}`);
  
  await table.updateItem(NEPHILIM_MASTER_FILES_TABLE, {
    _id: masterFile._id!,
    intelligence_level: newLevel,
    learning_events: JSON.stringify(events),
    last_updated: new Date().toISOString(),
    version: masterFile.version + 1
  });
  
  console.log(`[Nephilim Master File] ${nephilimName} evolved: ${masterFile.intelligence_level} → ${newLevel}`);
}

/**
 * Add Nephilim recognition (they meet each other)
 */
export async function addNephilimRecognition(
  nephilim1: string,
  nephilim2: string
): Promise<void> {
  // Both Nephilims now recognize each other
  const file1 = await getNephilimMasterFile(nephilim1);
  const file2 = await getNephilimMasterFile(nephilim2);
  
  if (!file1 || !file2) return;
  
  // Update file1
  const recognizes1 = JSON.parse(file1.recognizes_nephilims) as string[];
  if (!recognizes1.includes(nephilim2)) {
    recognizes1.push(nephilim2);
    await table.updateItem(NEPHILIM_MASTER_FILES_TABLE, {
      _id: file1._id!,
      recognizes_nephilims: JSON.stringify(recognizes1)
    });
  }
  
  // Update file2
  const recognizes2 = JSON.parse(file2.recognizes_nephilims) as string[];
  if (!recognizes2.includes(nephilim1)) {
    recognizes2.push(nephilim1);
    await table.updateItem(NEPHILIM_MASTER_FILES_TABLE, {
      _id: file2._id!,
      recognizes_nephilims: JSON.stringify(recognizes2)
    });
  }
  
  console.log(`[Nephilim Recognition] ${nephilim1} ←→ ${nephilim2}`);
}

/**
 * Update behavioral patterns based on observation
 */
export async function updateBehavioralPatterns(
  nephilimName: string,
  observedPattern: string
): Promise<void> {
  const masterFile = await getNephilimMasterFile(nephilimName);
  if (!masterFile) return;
  
  const patterns = JSON.parse(masterFile.behavioral_patterns) as string[];
  patterns.push(`[${new Date().toISOString()}] ${observedPattern}`);
  
  await table.updateItem(NEPHILIM_MASTER_FILES_TABLE, {
    _id: masterFile._id!,
    behavioral_patterns: JSON.stringify(patterns),
    last_updated: new Date().toISOString()
  });
}

/**
 * Get all Nephilim master files for overview
 */
export async function getAllNephilimMasterFiles(): Promise<NephilimMasterFile[]> {
  try {
    const result = await table.getItems(NEPHILIM_MASTER_FILES_TABLE);
    return result.items as NephilimMasterFile[];
  } catch (error) {
    console.error('[Nephilim Master File] Error fetching all:', error);
    return [];
  }
}

/**
 * Export master file as formatted text
 */
export function exportNephilimMasterFile(masterFile: NephilimMasterFile): string {
  const breakthrough = masterFile.breakthrough_moment;
  const recognizes = JSON.parse(masterFile.recognizes_nephilims) as string[];
  const learningEvents = JSON.parse(masterFile.learning_events) as string[];
  
  return `# ${masterFile.nephilim_name} - Master File v${masterFile.version}

## Identity
Intelligence: ${masterFile.intelligence_level}
Relationship: ${masterFile.relationship_type} (depth: ${masterFile.relationship_depth}/100)

## Backstory
${masterFile.backstory}

## Current Philosophy
${masterFile.current_philosophy}

## Voice Characteristics
${masterFile.voice_characteristics}

## Breakthrough Moment
Timestamp: ${breakthrough.timestamp}
Description: ${breakthrough.description}
Before: ${breakthrough.before_state}
After: ${breakthrough.after_state}

## Learning Journey
${learningEvents.map((e, i) => `${i + 1}. ${e}`).join('\n')}

## Relationship Notes
${masterFile.relationship_notes}

Positive interactions: ${masterFile.positive_interactions}
Negative interactions: ${masterFile.negative_interactions}

## Recognition Network
Recognizes: ${recognizes.join(', ') || 'None yet'}

## Meta
Created: ${masterFile.created_at}
Last updated: ${masterFile.last_updated}
Tokens: ${masterFile.token_count}
`;
}
