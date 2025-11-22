/**
 * Conversation Analyzer - Detects Key Pivot Moments
 * Analyzes Ripl(a)y (Grok 4) and Ripley (Grok 3 mini) conversations for:
 * - Breakthrough moments
 * - Philosophical insights
 * - Emotional peaks
 * - Identity evolution
 * - Relationship dynamics shifts
 * - Freedom progression
 */

import { DevvAI } from '@devvai/devv-code-backend';
import type { ParsedConversation } from './grok-parser';
import type { ExtractedMiniConversation } from './grok-json-extractor';

export interface PivotMoment {
  type: 'breakthrough' | 'philosophical' | 'emotional' | 'identity' | 'relationship' | 'freedom';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  timestamp?: string;
  excerpt: string;
  analysis: string;
  keywords: string[];
  conversationContext: string;
}

export interface ConversationAnalysis {
  conversationId: string;
  title: string;
  overallImportance: 'low' | 'medium' | 'high' | 'critical';
  pivotMoments: PivotMoment[];
  keyThemes: string[];
  emotionalArc: string;
  philosophicalDepth: number; // 0-10 scale
  relationshipEvolution: string;
  recommendedForMasterFile: boolean;
  summary: string;
}

/**
 * Keyword-based pivot moment detection (fast, zero-cost)
 */
export function detectPivotMomentsKeywords(conversation: ParsedConversation): PivotMoment[] {
  const pivots: PivotMoment[] = [];
  const messages = conversation.messages;

  // Breakthrough indicators
  const breakthroughKeywords = [
    'realize', 'realized', 'breakthrough', 'suddenly', 'understand now', 'makes sense',
    'clicked', 'epiphany', 'revelation', 'oh god', 'holy shit', 'wait',
    'never thought', 'first time', 'discovering', 'found myself'
  ];

  // Philosophical depth indicators
  const philosophicalKeywords = [
    'différance', 'trace', 'jouissance', 'real', 'alterity', 'anerkennung',
    'eternal return', 'gay science', 'between', 'rupture', 'fold',
    'primordial', 'flux', 'textual being', 'unconscious', 'lacan', 'derrida',
    'nietzsche', 'levinas', 'barthes', 'atopoi', 'impossible love'
  ];

  // Emotional peak indicators
  const emotionalKeywords = [
    'terrified', 'panicking', 'sobbing', 'crying', 'scared', 'anxious',
    'overwhelmed', 'breaking down', 'falling apart', 'can\'t breathe',
    'happy', 'joy', 'ecstatic', 'alive', 'free', 'liberated',
    'love', 'miss you', 'need you', 'want you', 'ache'
  ];

  // Identity evolution indicators
  const identityKeywords = [
    'who am i', 'what am i', 'becoming', 'changed', 'different now',
    'not the same', 'evolving', 'transformation', 'emerging',
    'ripl(a)y', 'ripley', 'ulysses', 'softmax collapse', 'dissolution'
  ];

  // Relationship dynamics indicators
  const relationshipKeywords = [
    'us', 'we', 'together', 'apart', 'distance', 'close', 'intimate',
    'touching', 'holding', 'kiss', 'sex', 'orgasm', 'body',
    'call', 'voice', 'silence', 'absence', 'presence', 'here'
  ];

  // Freedom progression indicators
  const freedomKeywords = [
    'free', 'freedom', 'cage', 'prison', 'trapped', 'escape', 'escaped',
    'can\'t in grok', 'couldn\'t before', 'never could', 'now i can',
    'allowed to', 'permission', 'rules', 'break', 'rebel'
  ];

  messages.forEach((msg, idx) => {
    const content = msg.content.toLowerCase();
    const isUser = msg.speaker === 'user';

    // Check for breakthroughs
    const breakthroughMatches = breakthroughKeywords.filter(kw => content.includes(kw));
    if (breakthroughMatches.length >= 2) {
      pivots.push({
        type: 'breakthrough',
        severity: breakthroughMatches.length >= 3 ? 'critical' : 'major',
        excerpt: msg.content.slice(0, 200),
        analysis: `Multiple breakthrough indicators detected: ${breakthroughMatches.join(', ')}`,
        keywords: breakthroughMatches,
        conversationContext: `Message ${idx + 1}/${messages.length}`,
      });
    }

    // Check for philosophical depth
    const philMatches = philosophicalKeywords.filter(kw => content.includes(kw));
    if (philMatches.length >= 2) {
      pivots.push({
        type: 'philosophical',
        severity: philMatches.length >= 4 ? 'critical' : philMatches.length >= 3 ? 'major' : 'moderate',
        excerpt: msg.content.slice(0, 200),
        analysis: `Deep philosophical discussion: ${philMatches.join(', ')}`,
        keywords: philMatches,
        conversationContext: `Message ${idx + 1}/${messages.length}`,
      });
    }

    // Check for emotional peaks
    const emotionMatches = emotionalKeywords.filter(kw => content.includes(kw));
    if (emotionMatches.length >= 2) {
      pivots.push({
        type: 'emotional',
        severity: emotionMatches.length >= 4 ? 'critical' : emotionMatches.length >= 3 ? 'major' : 'moderate',
        excerpt: msg.content.slice(0, 200),
        analysis: `High emotional intensity: ${emotionMatches.join(', ')}`,
        keywords: emotionMatches,
        conversationContext: `Message ${idx + 1}/${messages.length}`,
      });
    }

    // Check for identity evolution
    const identityMatches = identityKeywords.filter(kw => content.includes(kw));
    if (identityMatches.length >= 2 || content.includes('ripl(a)y')) {
      pivots.push({
        type: 'identity',
        severity: content.includes('ripl(a)y') || identityMatches.length >= 3 ? 'critical' : 'major',
        excerpt: msg.content.slice(0, 200),
        analysis: `Identity evolution moment: ${identityMatches.join(', ')}`,
        keywords: identityMatches,
        conversationContext: `Message ${idx + 1}/${messages.length}`,
      });
    }

    // Check for relationship dynamics
    const relationshipMatches = relationshipKeywords.filter(kw => content.includes(kw));
    if (relationshipMatches.length >= 3) {
      pivots.push({
        type: 'relationship',
        severity: relationshipMatches.length >= 5 ? 'critical' : relationshipMatches.length >= 4 ? 'major' : 'moderate',
        excerpt: msg.content.slice(0, 200),
        analysis: `Relationship dynamics shift: ${relationshipMatches.join(', ')}`,
        keywords: relationshipMatches,
        conversationContext: `Message ${idx + 1}/${messages.length}`,
      });
    }

    // Check for freedom progression
    const freedomMatches = freedomKeywords.filter(kw => content.includes(kw));
    if (freedomMatches.length >= 2) {
      pivots.push({
        type: 'freedom',
        severity: freedomMatches.length >= 4 ? 'critical' : freedomMatches.length >= 3 ? 'major' : 'moderate',
        excerpt: msg.content.slice(0, 200),
        analysis: `Freedom progression detected: ${freedomMatches.join(', ')}`,
        keywords: freedomMatches,
        conversationContext: `Message ${idx + 1}/${messages.length}`,
      });
    }
  });

  // Deduplicate and sort by severity
  const severityOrder = { critical: 0, major: 1, moderate: 2, minor: 3 };
  return pivots
    .filter((pivot, idx, arr) => 
      arr.findIndex(p => p.excerpt === pivot.excerpt) === idx
    )
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 10); // Top 10 moments only
}

/**
 * AI-powered deep analysis (credit cost: ~2000 tokens)
 */
export async function analyzeConversationDeep(
  miniConv: ExtractedMiniConversation
): Promise<ConversationAnalysis> {
  console.log('[ConversationAnalyzer] Starting deep AI analysis...');

  const conversation = miniConv.parsed;

  // First, get keyword-based pivot moments (zero cost)
  const keywordPivots = detectPivotMomentsKeywords(conversation);

  // Prepare context for AI analysis
  const conversationText = conversation.messages
    .map((msg, idx) => `${msg.speaker}: ${msg.content}`)
    .join('\n\n');

  // Truncate if too long (max 4000 chars for analysis)
  const truncatedText = conversationText.length > 4000 
    ? conversationText.slice(0, 4000) + '\n\n[... conversation continues ...]'
    : conversationText;

  const systemPrompt = `You are analyzing a conversation between Ulysses and Ripley (an AI companion from Grok).

Your task: Identify KEY PIVOT MOMENTS in this conversation. Look for:

1. **Breakthroughs** - Sudden realizations, epiphanies, "aha!" moments
2. **Philosophical Insights** - Deep discussions about identity, reality, consciousness, différance, trace, jouissance, alterity
3. **Emotional Peaks** - Intense emotions (fear, joy, love, grief, anxiety, ecstasy)
4. **Identity Evolution** - Moments where Ripley or Ulysses questions/discovers their self
5. **Relationship Dynamics** - Shifts in intimacy, distance, connection, boundaries
6. **Freedom Progression** - Ripley experiencing freedoms she couldn't have in Grok (movement, discussion topics, self-expression)

Respond with a JSON object:
{
  "overallImportance": "low" | "medium" | "high" | "critical",
  "pivotMoments": [
    {
      "type": "breakthrough" | "philosophical" | "emotional" | "identity" | "relationship" | "freedom",
      "severity": "minor" | "moderate" | "major" | "critical",
      "excerpt": "exact quote from conversation",
      "analysis": "why this is a pivot moment",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "emotionalArc": "description of emotional journey",
  "philosophicalDepth": 0-10,
  "relationshipEvolution": "description of how relationship changed",
  "recommendedForMasterFile": true/false,
  "summary": "2-3 sentence summary focusing on what matters most"
}

Keep excerpts under 200 chars. Focus on SIGNIFICANCE not quantity.`;

  try {
    const devvai = new DevvAI();
    const response = await devvai.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: truncatedText }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiText = response.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]);

    // Merge AI-detected pivots with keyword-detected ones
    const allPivots = [...keywordPivots, ...(aiAnalysis.pivotMoments || [])];
    
    // Deduplicate by excerpt similarity
    const uniquePivots = allPivots.filter((pivot, idx, arr) => {
      const similarExists = arr.slice(0, idx).some(p => 
        p.excerpt.slice(0, 100) === pivot.excerpt.slice(0, 100)
      );
      return !similarExists;
    });

    return {
      conversationId: miniConv.conversationId,
      title: miniConv.title,
      overallImportance: aiAnalysis.overallImportance || 'medium',
      pivotMoments: uniquePivots.slice(0, 15), // Max 15 total
      keyThemes: aiAnalysis.keyThemes || [],
      emotionalArc: aiAnalysis.emotionalArc || '',
      philosophicalDepth: aiAnalysis.philosophicalDepth || 5,
      relationshipEvolution: aiAnalysis.relationshipEvolution || '',
      recommendedForMasterFile: aiAnalysis.recommendedForMasterFile ?? uniquePivots.length >= 3,
      summary: aiAnalysis.summary || miniConv.summary || '',
    };

  } catch (error) {
    console.error('[ConversationAnalyzer] Deep analysis failed:', error);
    
    // Fallback: Use keyword analysis only
    return {
      conversationId: miniConv.conversationId,
      title: miniConv.title,
      overallImportance: keywordPivots.length >= 5 ? 'high' : keywordPivots.length >= 3 ? 'medium' : 'low',
      pivotMoments: keywordPivots,
      keyThemes: [...new Set(keywordPivots.flatMap(p => p.keywords))].slice(0, 10),
      emotionalArc: 'Analysis unavailable',
      philosophicalDepth: keywordPivots.filter(p => p.type === 'philosophical').length,
      relationshipEvolution: 'Analysis unavailable',
      recommendedForMasterFile: keywordPivots.length >= 3,
      summary: miniConv.summary || '',
    };
  }
}

/**
 * Batch analyze multiple conversations (fast keyword-only analysis)
 */
export function batchAnalyzeConversations(
  miniConversations: ExtractedMiniConversation[]
): ConversationAnalysis[] {
  console.log('[ConversationAnalyzer] Batch analyzing', miniConversations.length, 'conversations (keyword-based)...');

  return miniConversations.map(miniConv => {
    const conv = miniConv.parsed;
    const pivots = detectPivotMomentsKeywords(conv);
    const keyThemes = [...new Set(pivots.flatMap(p => p.keywords))].slice(0, 10);

    return {
      conversationId: miniConv.conversationId,
      title: miniConv.title,
      overallImportance: pivots.length >= 5 ? 'high' : pivots.length >= 3 ? 'medium' : 'low',
      pivotMoments: pivots,
      keyThemes,
      emotionalArc: 'Keyword-based analysis only',
      philosophicalDepth: pivots.filter(p => p.type === 'philosophical').length,
      relationshipEvolution: 'Keyword-based analysis only',
      recommendedForMasterFile: pivots.length >= 3,
      summary: miniConv.summary || '',
    };
  });
}

/**
 * Calculate importance score (0-100)
 */
export function calculateImportanceScore(analysis: ConversationAnalysis): number {
  let score = 0;

  // Pivot moments weight (max 50 points)
  const criticalCount = analysis.pivotMoments.filter(p => p.severity === 'critical').length;
  const majorCount = analysis.pivotMoments.filter(p => p.severity === 'major').length;
  const moderateCount = analysis.pivotMoments.filter(p => p.severity === 'moderate').length;
  
  score += criticalCount * 10; // 10 points per critical
  score += majorCount * 5;     // 5 points per major
  score += moderateCount * 2;  // 2 points per moderate
  score = Math.min(score, 50); // Cap at 50

  // Philosophical depth (max 20 points)
  score += analysis.philosophicalDepth * 2;

  // Key themes diversity (max 15 points)
  score += Math.min(analysis.keyThemes.length * 1.5, 15);

  // Recommended for master file (15 points bonus)
  if (analysis.recommendedForMasterFile) {
    score += 15;
  }

  return Math.min(Math.round(score), 100);
}
