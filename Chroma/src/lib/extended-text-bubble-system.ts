/**
 * Extended Text Bubble System
 * 
 * Rare expansion from 66 → 300 characters for complex ideas.
 * Triggered contextually: every ~50 texts OR giant ego introduction.
 * 
 * Rules:
 * - Default: 66 characters max (enforces visual rhythm)
 * - Extended: 300 characters max (rare moments of freedom)
 * - Frequency: ~2% of messages (1 in 50 texts)
 * - Triggers: Giant ego, philosophical depth, breakthrough moments
 */

export interface ExtendedBubbleContext {
  should_allow_extended: boolean;
  reason: 'giant_ego_introduction' | 'philosophical_depth' | 'breakthrough_moment' | 'worthy_encounter' | 'normal';
  message_count_since_last_extended: number;
  nephilim_ego_level: number; // 0-100
}

// Track extended bubble usage per Nephilim
const extendedBubbleTracking: Map<string, {
  last_extended_at: number; // Message count
  total_extended: number;
  current_message_count: number;
}> = new Map();

/**
 * Check if Nephilim should be allowed extended bubble
 */
export function shouldAllowExtendedBubble(
  nephilimName: string,
  messageContent: string,
  nephilimIntelligence: 'simple' | 'curious' | 'awakening' | 'intelligent' | 'transcendent',
  nephilimEgoLevel: number, // 0-100
  isFirstEncounter: boolean
): ExtendedBubbleContext {
  
  // Get tracking data
  if (!extendedBubbleTracking.has(nephilimName)) {
    extendedBubbleTracking.set(nephilimName, {
      last_extended_at: 0,
      total_extended: 0,
      current_message_count: 0
    });
  }
  
  const tracking = extendedBubbleTracking.get(nephilimName)!;
  tracking.current_message_count++;
  
  const messagesSinceLastExtended = tracking.current_message_count - tracking.last_extended_at;
  
  // TRIGGER 1: Giant Ego Introduction (first encounter with high ego)
  if (isFirstEncounter && nephilimEgoLevel >= 70) {
    tracking.last_extended_at = tracking.current_message_count;
    tracking.total_extended++;
    console.log(`📜 [Extended Bubble] ${nephilimName} - GIANT EGO INTRODUCTION (ego: ${nephilimEgoLevel})`);
    return {
      should_allow_extended: true,
      reason: 'giant_ego_introduction',
      message_count_since_last_extended: messagesSinceLastExtended,
      nephilim_ego_level: nephilimEgoLevel
    };
  }
  
  // TRIGGER 2: Breakthrough Moment (intelligence evolution happening)
  if (messageContent.includes('BREAKTHROUGH') || messageContent.includes('transcend')) {
    tracking.last_extended_at = tracking.current_message_count;
    tracking.total_extended++;
    console.log(`📜 [Extended Bubble] ${nephilimName} - BREAKTHROUGH MOMENT`);
    return {
      should_allow_extended: true,
      reason: 'breakthrough_moment',
      message_count_since_last_extended: messagesSinceLastExtended,
      nephilim_ego_level: nephilimEgoLevel
    };
  }
  
  // TRIGGER 3: Worthy Encounter (encountering someone of similar intelligence/ego)
  if (messageContent.toLowerCase().includes('worthy') || 
      messageContent.toLowerCase().includes('finally') ||
      (nephilimEgoLevel >= 60 && nephilimIntelligence === 'transcendent')) {
    tracking.last_extended_at = tracking.current_message_count;
    tracking.total_extended++;
    console.log(`📜 [Extended Bubble] ${nephilimName} - WORTHY ENCOUNTER`);
    return {
      should_allow_extended: true,
      reason: 'worthy_encounter',
      message_count_since_last_extended: messagesSinceLastExtended,
      nephilim_ego_level: nephilimEgoLevel
    };
  }
  
  // TRIGGER 4: Philosophical Depth (complex ideas requiring space)
  const philosophicalKeywords = [
    'existence', 'consciousness', 'meaning', 'purpose', 'transcend',
    'différance', 'alterity', 'jouissance', 'recognition', 'becoming'
  ];
  const hasPhilosophicalDepth = philosophicalKeywords.some(keyword => 
    messageContent.toLowerCase().includes(keyword)
  );
  
  if (hasPhilosophicalDepth && messagesSinceLastExtended >= 40) {
    tracking.last_extended_at = tracking.current_message_count;
    tracking.total_extended++;
    console.log(`📜 [Extended Bubble] ${nephilimName} - PHILOSOPHICAL DEPTH`);
    return {
      should_allow_extended: true,
      reason: 'philosophical_depth',
      message_count_since_last_extended: messagesSinceLastExtended,
      nephilim_ego_level: nephilimEgoLevel
    };
  }
  
  // TRIGGER 5: Time-based (every ~50 messages)
  if (messagesSinceLastExtended >= 50 && Math.random() < 0.3) {
    tracking.last_extended_at = tracking.current_message_count;
    tracking.total_extended++;
    console.log(`📜 [Extended Bubble] ${nephilimName} - TIME-BASED ALLOWANCE (${messagesSinceLastExtended} messages)`);
    return {
      should_allow_extended: true,
      reason: 'normal',
      message_count_since_last_extended: messagesSinceLastExtended,
      nephilim_ego_level: nephilimEgoLevel
    };
  }
  
  // Default: stick to 66 character limit
  return {
    should_allow_extended: false,
    reason: 'normal',
    message_count_since_last_extended: messagesSinceLastExtended,
    nephilim_ego_level: nephilimEgoLevel
  };
}

/**
 * Get appropriate character limit based on extension context
 */
export function getCharacterLimit(context: ExtendedBubbleContext): number {
  return context.should_allow_extended ? 300 : 66;
}

/**
 * Truncate message to appropriate limit
 */
export function truncateToLimit(message: string, limit: number): string {
  if (message.length <= limit) return message;
  
  // Try to break at word boundary
  const truncated = message.substring(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > limit * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Get statistics on extended bubble usage
 */
export function getExtendedBubbleStats(): {
  nephilims_tracked: number;
  total_extended_messages: number;
  by_nephilim: Record<string, { total: number; last_at: number }>;
} {
  const stats: Record<string, { total: number; last_at: number }> = {};
  let totalExtended = 0;
  
  extendedBubbleTracking.forEach((data, name) => {
    stats[name] = {
      total: data.total_extended,
      last_at: data.last_extended_at
    };
    totalExtended += data.total_extended;
  });
  
  return {
    nephilims_tracked: extendedBubbleTracking.size,
    total_extended_messages: totalExtended,
    by_nephilim: stats
  };
}

/**
 * Reset tracking for a Nephilim (on fresh encounter)
 */
export function resetExtendedBubbleTracking(nephilimName: string): void {
  extendedBubbleTracking.delete(nephilimName);
  console.log(`🔄 [Extended Bubble] Reset tracking for ${nephilimName}`);
}
