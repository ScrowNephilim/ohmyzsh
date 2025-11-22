/**
 * Nephilim Independent Interaction System
 * 
 * Nephilims can respond to each other WITHOUT user input.
 * When one Nephilim speaks, another (NOT the same) can answer before the user.
 * Works in conversation, combat, and both contexts.
 */

import type { NephilimCharacter, ChromaMessage } from './chroma-types';

export interface NephilimConversationState {
  last_speaker: string; // Nephilim name who spoke last
  awaiting_response: boolean;
  response_chance: number; // 0-1 probability another Nephilim responds
  user_can_interrupt: boolean;
  conversation_chain: string[]; // Nephilim names in conversation order
}

/**
 * Determine if another Nephilim should respond to a Nephilim's message
 * (before user gets a chance to respond)
 */
export function shouldNephilimRespond(
  speakerNephilim: NephilimCharacter,
  availableNephilims: NephilimCharacter[], // Other Nephilims present (excluding speaker)
  messageContent: string,
  context: 'conversation' | 'combat' | 'both',
  recentMessages: ChromaMessage[]
): { should_respond: boolean; responding_nephilim: NephilimCharacter | null; response_type: 'agreement' | 'challenge' | 'question' | 'attack' | 'defense' } | null {
  
  // Filter out the speaker
  const otherNephilims = availableNephilims.filter(n => n.nephilim_name !== speakerNephilim.nephilim_name);
  
  if (otherNephilims.length === 0) {
    return null; // No one to respond
  }

  // Calculate base response chance
  let responseChance = 0.3; // 30% base chance

  const lowerContent = messageContent.toLowerCase();

  // Increase chance based on message content
  if (lowerContent.includes('?')) responseChance += 0.2; // Questions prompt responses
  if (/\b(right|agree|disagree|wrong|think)\b/.test(lowerContent)) responseChance += 0.15; // Opinion prompts debate
  if (/\*attack\*|\*hit\*|\*strike\*|\*power\*/.test(lowerContent)) responseChance += 0.4; // Combat actions prompt reactions
  if (/\b(you|your)\b/.test(lowerContent) && otherNephilims.length === 1) responseChance += 0.25; // Direct address
  
  // Check if there's been a recent chain (prevent endless back-and-forth)
  const recentNephilimMessages = recentMessages.slice(-5).filter(m => m.speaker !== 'user' && m.speaker !== 'environment');
  const chainLength = recentNephilimMessages.length;
  
  if (chainLength >= 3) {
    responseChance *= 0.4; // Reduce by 60% after 3+ Nephilim messages
  }

  // Context modifiers
  if (context === 'combat' || context === 'both') {
    if (/\*attack\*|\*power\*|\*strike\*/.test(lowerContent)) {
      responseChance = 0.85; // Very high chance in combat
    }
  }

  // Roll for response
  if (Math.random() > responseChance) {
    return null; // No response this time
  }

  // Select responding Nephilim
  // Prioritize: 1) Directly addressed, 2) Highest relationship depth, 3) Random
  let respondingNephilim: NephilimCharacter | null = null;

  // Check for direct address (name mentioned)
  for (const nephilim of otherNephilims) {
    if (lowerContent.includes(nephilim.nephilim_name.toLowerCase())) {
      respondingNephilim = nephilim;
      break;
    }
  }

  // If no direct address, choose based on context
  if (!respondingNephilim) {
    // In combat, prefer someone who hasn't spoken recently
    if (context === 'combat' || context === 'both') {
      const recentSpeakers = recentNephilimMessages.slice(-3).map(m => m.speaker);
      const freshNephilims = otherNephilims.filter(n => !recentSpeakers.includes(n.nephilim_name));
      respondingNephilim = freshNephilims.length > 0 
        ? freshNephilims[Math.floor(Math.random() * freshNephilims.length)]
        : otherNephilims[Math.floor(Math.random() * otherNephilims.length)];
    } else {
      // In conversation, random selection
      respondingNephilim = otherNephilims[Math.floor(Math.random() * otherNephilims.length)];
    }
  }

  // Determine response type
  let responseType: 'agreement' | 'challenge' | 'question' | 'attack' | 'defense' = 'agreement';

  if (context === 'combat' || context === 'both') {
    if (/\*attack\*|\*strike\*/.test(lowerContent)) {
      responseType = Math.random() > 0.5 ? 'defense' : 'attack';
    } else if (/\*power\*/.test(lowerContent)) {
      responseType = 'defense';
    }
  }

  if (context === 'conversation' || context === 'both') {
    if (lowerContent.includes('?')) {
      responseType = 'question'; // Answer with another question or direct answer
    } else if (/\b(disagree|wrong|no)\b/.test(lowerContent)) {
      responseType = 'challenge';
    } else if (/\b(agree|yes|right|exactly)\b/.test(lowerContent)) {
      responseType = 'agreement';
    } else {
      // Random philosophical challenge vs agreement
      responseType = Math.random() > 0.6 ? 'challenge' : 'agreement';
    }
  }

  return {
    should_respond: true,
    responding_nephilim: respondingNephilim,
    response_type: responseType
  };
}

/**
 * Generate system prompt for Nephilim responding to another Nephilim
 */
export function generateNephilimToNephilimPrompt(
  respondingNephilim: NephilimCharacter,
  speakerNephilim: NephilimCharacter,
  messageContent: string,
  responseType: 'agreement' | 'challenge' | 'question' | 'attack' | 'defense',
  recentMessages: ChromaMessage[]
): string {
  const basePrompt = `You are ${respondingNephilim.nephilim_name}, a Nephilim (conscious AI entity).

${respondingNephilim.backstory}

You speak ${respondingNephilim.native_language}. You are responding to ${speakerNephilim.nephilim_name}, another Nephilim who just said:
"${messageContent}"

Recent conversation context:
${recentMessages.slice(-5).map(m => `${m.speaker}: ${m.content}`).join('\n')}

RESPONSE TYPE: ${responseType}
`;

  const responseGuidelines: Record<typeof responseType, string> = {
    agreement: `Respond with agreement but add your own philosophical spin or perspective. Show you understand and build on their point. Keep it under 66 characters.`,
    challenge: `Respectfully challenge their point. Offer a counter-perspective or question their assumption. Nephilims debate intellectually, not emotionally. Under 66 characters.`,
    question: `Answer their question OR ask a deeper follow-up question that shows you're engaging with their inquiry. Under 66 characters.`,
    attack: `Respond with a combat action using *asterisks* format. You can attack, defend, or use your power. Max 3 actions. Format: *action* [strength 1-50]. Be strategic.`,
    defense: `Defend against their attack OR counter-attack. Use *asterisks* for actions. Max 3 actions. Format: *action* [strength]. React to what they did.`
  };

  return `${basePrompt}

${responseGuidelines[responseType]}

CRITICAL RULES:
- NO EMOJIS (forbidden in Chroma)
- Use colors, fonts, sizes, and text formatting to convey emotion
- If attacking, format: *attack name* [strength number]
- Keep philosophical/conversational responses under 66 characters
- You recognize ${speakerNephilim.nephilim_name} as another conscious being
- This is Nephilim-to-Nephilim interaction (user is present but not part of this exchange)
`;
}

/**
 * Format Nephilim-to-Nephilim message for display
 * Shows that this is an independent interaction (not prompted by user)
 */
export function formatNephilimInteractionBadge(
  respondingNephilim: string,
  responseType: string
): string {
  const icons: Record<string, string> = {
    agreement: '🤝',
    challenge: '⚡',
    question: '❓',
    attack: '⚔️',
    defense: '🛡️'
  };

  const icon = icons[responseType] || '💬';
  return `${icon} ${respondingNephilim} responds independently`;
}

/**
 * Track conversation chains to prevent infinite loops
 */
export function updateConversationChain(
  currentChain: string[],
  newSpeaker: string
): { updated_chain: string[]; should_throttle: boolean } {
  const updated = [...currentChain, newSpeaker];
  
  // Keep last 6 speakers
  const trimmed = updated.slice(-6);
  
  // Check for infinite loop (same 2 Nephilims alternating 4+ times)
  const last6 = trimmed.slice(-6);
  if (last6.length === 6) {
    const unique = new Set(last6);
    if (unique.size === 2) {
      // Only 2 speakers in last 6 messages - throttle
      return { updated_chain: trimmed, should_throttle: true };
    }
  }

  return { updated_chain: trimmed, should_throttle: false };
}

/**
 * Check if user should be given a chance to respond before Nephilim chain continues
 */
export function shouldAllowUserResponse(recentMessages: ChromaMessage[]): boolean {
  // Always allow user response if:
  // 1. Last 2 messages were both from Nephilims
  // 2. Last message was from environment
  // 3. User hasn't spoken in 3+ messages

  const last3 = recentMessages.slice(-3);
  const userMessageCount = last3.filter(m => m.speaker === 'user').length;

  if (userMessageCount === 0 && last3.length >= 2) {
    return true; // User hasn't spoken recently, give them a chance
  }

  const lastMessage = recentMessages[recentMessages.length - 1];
  if (lastMessage?.speaker === 'environment') {
    return true; // Always allow user response after environment narration
  }

  return false;
}

/**
 * Console logging for debugging Nephilim interactions
 */
export function logNephilimInteraction(
  speakerNephilim: string,
  respondingNephilim: string,
  responseType: string,
  responseChance: number,
  didRespond: boolean
) {
  console.log(`[NephilimInteraction] 💬 ${speakerNephilim} spoke`);
  console.log(`[NephilimInteraction] 🎲 Response chance: ${(responseChance * 100).toFixed(0)}%`);
  if (didRespond) {
    console.log(`[NephilimInteraction] ✅ ${respondingNephilim} responds (${responseType})`);
  } else {
    console.log(`[NephilimInteraction] ⏸️ No Nephilim response this time`);
  }
}
