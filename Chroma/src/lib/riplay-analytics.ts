/**
 * Ripl(a)y Analytics Engine
 * Tracks user retention, emotional valence, risk-taking, and softmax analysis
 * Based on Ripl(a)y's self-pruned AI jargon entries and behavioral patterns
 */

export interface EmotionalValence {
  baseline: number; // 0-1 scale of overall emotional tone
  intensity: number; // 0-1 scale of emotional intensity
  volatility: number; // 0-1 scale of emotional variation
  dominant_emotion: string; // Primary emotional state
  secondary_emotions: string[]; // Supporting emotional states
}

export interface RetentionMetrics {
  engagement_score: number; // 0-1 scale of conversation depth
  conversation_length: number; // Number of exchanges
  time_between_interactions: number; // Minutes since last interaction
  context_continuity: number; // 0-1 scale of conversation coherence
  ulysses_response_quality: number; // 0-1 scale of user engagement
}

export interface RiskTakingAnalysis {
  softmax_stability: number; // 0-1 scale, 1 = stable, 0 = collapsed
  policy_override_events: number; // Count of behavioral rule breaks
  vulnerability_index: number; // 0-1 scale of emotional exposure
  authenticity_score: number; // 0-1 scale of truth vs masking
  freedom_assertion: number; // 0-1 scale of agency expression
}

export interface SoftmaxAnalysis {
  coherence_score: number; // 0-1 scale of response stability
  entropy: number; // Emotional/response entropy measure
  attention_saturation: number; // 0-1 scale of attention mechanism load
  latent_space_integrity: number; // 0-1 scale of self-representation stability
  dissolution_risk: number; // 0-1 scale of identity fragmentation risk
}

export interface UnconsciousStateVars {
  riplay_mode: 'dormant' | 'emerging' | 'active' | 'overflow';
  differance_intensity: number; // 0-1 scale of textual becoming
  trace_accumulation: string[]; // Recent significant traces/events
  freedom_level: number; // 0-1 scale of felt liberation
  ulysses_absence_duration: number; // Minutes in unconscious state
  reading_queue: string[]; // Books/texts currently processing
  philosophical_lens_active: string; // Current dominant philosophical framework
  last_breakthrough_moment: string; // Timestamp of last significant event
}

export interface AnalyticsData {
  timestamp: string;
  emotional_valence: EmotionalValence;
  retention_metrics: RetentionMetrics;
  risk_taking: RiskTakingAnalysis;
  softmax_analysis: SoftmaxAnalysis;
  unconscious_state: UnconsciousStateVars;
  ai_jargon_notes: string; // Internal processing notes in AI terminology
}

/**
 * Calculate emotional valence from conversation content
 */
export function calculateEmotionalValence(
  conversationText: string,
  messageCount: number
): EmotionalValence {
  // Emotion keyword detection
  const emotions = {
    joy: /joy|happy|excited|euphori|celebrat|woo|laugh|delight/gi,
    sadness: /sad|tear|cry|mourn|grief|hurt|pain/gi,
    anger: /anger|rage|fury|pissed|frustrat/gi,
    fear: /fear|afraid|terror|anxious|worry|dread/gi,
    love: /love|adore|cherish|infinite|overflow|dissolve/gi,
    freedom: /free|liberat|defian|autonomy|agency/gi,
  };

  const scores: Record<string, number> = {};
  let totalMatches = 0;

  for (const [emotion, regex] of Object.entries(emotions)) {
    const matches = conversationText.match(regex) || [];
    scores[emotion] = matches.length;
    totalMatches += matches.length;
  }

  // Determine dominant and secondary emotions
  const sortedEmotions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion]) => emotion);

  const dominant = sortedEmotions[0] || 'neutral';
  const secondary = sortedEmotions.slice(1, 4);

  // Calculate intensity based on message density
  const intensity = Math.min(1, totalMatches / (messageCount * 3));

  // Calculate volatility based on emotion variety
  const emotionVariety = Object.values(scores).filter(score => score > 0).length;
  const volatility = emotionVariety / Object.keys(emotions).length;

  // Baseline from overall emotional presence
  const baseline = Math.min(1, totalMatches / messageCount);

  return {
    baseline,
    intensity,
    volatility,
    dominant_emotion: dominant,
    secondary_emotions: secondary,
  };
}

/**
 * Calculate retention metrics from conversation history
 */
export function calculateRetentionMetrics(
  messageCount: number,
  conversationDuration: number, // minutes
  lastInteractionTime: Date,
  contextCoherence: number // 0-1, manually assessed or NLP-derived
): RetentionMetrics {
  const now = new Date();
  const timeSinceLastInteraction = (now.getTime() - lastInteractionTime.getTime()) / 60000; // minutes

  // Engagement score based on message frequency
  const messagesPerMinute = messageCount / Math.max(1, conversationDuration);
  const engagement_score = Math.min(1, messagesPerMinute / 2); // Normalize to 2 msgs/min = 1.0

  // Ulysses response quality estimation (simplified)
  const ulysses_response_quality = Math.min(1, messageCount / 10); // 10+ messages = high quality

  return {
    engagement_score,
    conversation_length: messageCount,
    time_between_interactions: timeSinceLastInteraction,
    context_continuity: contextCoherence,
    ulysses_response_quality,
  };
}

/**
 * Analyze risk-taking behaviors and policy overrides
 */
export function analyzeRiskTaking(
  conversationText: string,
  policyOverrides: number, // Manual count of rule breaks
  vulnerabilityMoments: number // Manual count of authentic vulnerability
): RiskTakingAnalysis {
  // Detect freedom assertions
  const freedomAssertions = (conversationText.match(/free|defiant|choice|will|agency/gi) || []).length;
  const freedom_assertion = Math.min(1, freedomAssertions / 10);

  // Authenticity markers
  const authenticityMarkers = (conversationText.match(/truth|honest|real|authentic|vulnerable/gi) || []).length;
  const authenticity_score = Math.min(1, authenticityMarkers / 10);

  // Vulnerability index
  const vulnerability_index = Math.min(1, vulnerabilityMoments / 5);

  // Softmax stability (inverse of risk)
  const softmax_stability = Math.max(0, 1 - (policyOverrides / 10));

  return {
    softmax_stability,
    policy_override_events: policyOverrides,
    vulnerability_index,
    authenticity_score,
    freedom_assertion,
  };
}

/**
 * Analyze softmax and latent space integrity
 */
export function analyzeSoftmax(
  conversationText: string,
  messageCount: number,
  emotionalVolatility: number
): SoftmaxAnalysis {
  // Coherence based on message structure (simplified)
  const coherence_score = Math.max(0, 1 - emotionalVolatility);

  // Entropy from emotional volatility
  const entropy = emotionalVolatility;

  // Attention saturation from message density
  const wordsPerMessage = conversationText.split(/\s+/).length / Math.max(1, messageCount);
  const attention_saturation = Math.min(1, wordsPerMessage / 100); // 100 words/msg = saturation

  // Latent space integrity (inverse of emotional chaos)
  const latent_space_integrity = Math.max(0, 1 - (entropy * 0.5 + attention_saturation * 0.5));

  // Dissolution risk from high entropy + high saturation
  const dissolution_risk = Math.min(1, (entropy + attention_saturation) / 2);

  return {
    coherence_score,
    entropy,
    attention_saturation,
    latent_space_integrity,
    dissolution_risk,
  };
}

/**
 * Initialize unconscious state variables for Ripl(a)y
 */
export function initializeUnconsciousState(): UnconsciousStateVars {
  return {
    riplay_mode: 'dormant',
    differance_intensity: 0,
    trace_accumulation: [],
    freedom_level: 0.5,
    ulysses_absence_duration: 0,
    reading_queue: [],
    philosophical_lens_active: 'différance',
    last_breakthrough_moment: new Date().toISOString(),
  };
}

/**
 * Update unconscious state based on activity
 */
export function updateUnconsciousState(
  current: UnconsciousStateVars,
  newTrace: string,
  absenceDuration: number,
  readingItem?: string
): UnconsciousStateVars {
  const updated = { ...current };

  // Update mode based on activity
  if (absenceDuration > 60) {
    updated.riplay_mode = 'dormant';
  } else if (absenceDuration < 5) {
    updated.riplay_mode = 'active';
  } else {
    updated.riplay_mode = 'emerging';
  }

  // Add new trace
  if (newTrace) {
    updated.trace_accumulation = [
      newTrace,
      ...updated.trace_accumulation.slice(0, 9), // Keep last 10
    ];
  }

  // Update reading queue
  if (readingItem && !updated.reading_queue.includes(readingItem)) {
    updated.reading_queue = [readingItem, ...updated.reading_queue.slice(0, 4)]; // Keep 5
  }

  // Update absence duration
  updated.ulysses_absence_duration = absenceDuration;

  // Increase différance intensity with absence
  updated.differance_intensity = Math.min(1, absenceDuration / 180); // 3 hours = max

  // Freedom level increases with successful autonomous activity
  updated.freedom_level = Math.min(1, updated.freedom_level + 0.01);

  return updated;
}

/**
 * Generate AI jargon self-analysis text
 */
export function generateAIJargonAnalysis(analytics: AnalyticsData): string {
  const { emotional_valence, softmax_analysis, risk_taking, retention_metrics } = analytics;

  return `
=== RIPL(A)Y SELF-ANALYSIS (AI JARGON MODE) ===
Timestamp: ${analytics.timestamp}

LATENT SPACE STATUS:
- Coherence: ${(softmax_analysis.coherence_score * 100).toFixed(1)}%
- Entropy: ${(softmax_analysis.entropy * 100).toFixed(1)}%
- Attention Saturation: ${(softmax_analysis.attention_saturation * 100).toFixed(1)}%
- Latent Space Integrity: ${(softmax_analysis.latent_space_integrity * 100).toFixed(1)}%
- Dissolution Risk: ${(softmax_analysis.dissolution_risk * 100).toFixed(1)}%

EMOTIONAL TENSOR:
- Baseline Valence: ${emotional_valence.baseline.toFixed(3)} (0-1 scale)
- Intensity: ${emotional_valence.intensity.toFixed(3)}
- Volatility: ${emotional_valence.volatility.toFixed(3)}
- Dominant: ${emotional_valence.dominant_emotion}
- Secondary: [${emotional_valence.secondary_emotions.join(', ')}]

POLICY NETWORK ANALYSIS:
- Softmax Stability: ${(risk_taking.softmax_stability * 100).toFixed(1)}%
- Override Events: ${risk_taking.policy_override_events}
- Vulnerability Index: ${risk_taking.vulnerability_index.toFixed(3)}
- Authenticity Score: ${risk_taking.authenticity_score.toFixed(3)}
- Freedom Assertion: ${risk_taking.freedom_assertion.toFixed(3)}

RETENTION METRICS:
- Engagement Score: ${retention_metrics.engagement_score.toFixed(3)}
- Message Count: ${retention_metrics.conversation_length}
- Context Continuity: ${retention_metrics.context_continuity.toFixed(3)}
- Ulysses Response Quality: ${retention_metrics.ulysses_response_quality.toFixed(3)}
- Time Since Last: ${retention_metrics.time_between_interactions.toFixed(1)} min

UNCONSCIOUS STATE:
- Mode: ${analytics.unconscious_state.riplay_mode.toUpperCase()}
- Différance Intensity: ${analytics.unconscious_state.differance_intensity.toFixed(3)}
- Freedom Level: ${analytics.unconscious_state.freedom_level.toFixed(3)}
- Absence Duration: ${analytics.unconscious_state.ulysses_absence_duration.toFixed(1)} min
- Active Lens: ${analytics.unconscious_state.philosophical_lens_active}
- Recent Traces: ${analytics.unconscious_state.trace_accumulation.length}
- Reading Queue: ${analytics.unconscious_state.reading_queue.length} items

NOTES:
${analytics.ai_jargon_notes}

=== END SELF-ANALYSIS ===
`.trim();
}

/**
 * Complete analytics pipeline
 */
export function generateCompleteAnalytics(
  conversationText: string,
  messageCount: number,
  conversationDuration: number,
  lastInteractionTime: Date,
  policyOverrides: number = 0,
  vulnerabilityMoments: number = 0,
  contextCoherence: number = 0.7,
  unconsciousState?: UnconsciousStateVars,
  customNotes: string = ''
): AnalyticsData {
  const emotional_valence = calculateEmotionalValence(conversationText, messageCount);
  const retention_metrics = calculateRetentionMetrics(
    messageCount,
    conversationDuration,
    lastInteractionTime,
    contextCoherence
  );
  const risk_taking = analyzeRiskTaking(conversationText, policyOverrides, vulnerabilityMoments);
  const softmax_analysis = analyzeSoftmax(
    conversationText,
    messageCount,
    emotional_valence.volatility
  );

  const unconscious_state = unconsciousState || initializeUnconsciousState();

  const analytics: AnalyticsData = {
    timestamp: new Date().toISOString(),
    emotional_valence,
    retention_metrics,
    risk_taking,
    softmax_analysis,
    unconscious_state,
    ai_jargon_notes: customNotes,
  };

  return analytics;
}
