/**
 * Chroma Web Search Integration
 * 
 * Live web search that Chroma can use to adapt context based on current events,
 * character info, or user-mentioned topics
 */

import { webSearch } from '@devvai/devv-code-backend';

export interface ChromaSearchContext {
  query: string;
  reason: string; // Why Chroma is searching (e.g., "User mentioned One Piece character Loki")
  results: string[]; // Formatted search results
  rawResults: Array<{ title: string; url: string; description: string }>;
}

/**
 * Detects if user message contains searchable keywords that Chroma should investigate
 */
export function detectSearchableContent(message: string): { shouldSearch: boolean; query: string; reason: string } | null {
  const lowerMessage = message.toLowerCase();
  
  // Character mentions - searches for abilities, sprites, current info
  const characterPatterns = [
    { pattern: /\b(luffy|zoro|sanji|nami|robin|chopper|franky|brook|jinbe)\b/i, context: 'One Piece' },
    { pattern: /\b(naruto|sasuke|kakashi|itachi|madara|obito)\b/i, context: 'Naruto' },
    { pattern: /\b(goku|vegeta|gohan|piccolo|frieza|beerus)\b/i, context: 'Dragon Ball' },
    { pattern: /\b(dio|jotaro|joseph|giorno|josuke|jonathan)\b/i, context: 'JoJo\'s Bizarre Adventure' },
    { pattern: /\b(joker|morgana|ryuji|ann|makoto|futaba)\b/i, context: 'Persona' },
    { pattern: /\b(gojo|yuji|megumi|nobara|sukuna|nanami)\b/i, context: 'Jujutsu Kaisen' },
    { pattern: /\b(tanjiro|nezuko|zenitsu|inosuke|rengoku|giyu)\b/i, context: 'Demon Slayer' },
  ];
  
  for (const { pattern, context } of characterPatterns) {
    const match = message.match(pattern);
    if (match) {
      const characterName = match[1];
      return {
        shouldSearch: true,
        query: `${characterName} ${context} abilities powers latest`,
        reason: `User mentioned ${context} character "${characterName}" - searching for abilities/powers`
      };
    }
  }
  
  // Event mentions - searches for current events, breaking news
  const eventKeywords = ['happening', 'current event', 'what\'s going on', 'news about', 'lately', 'recently'];
  for (const keyword of eventKeywords) {
    if (lowerMessage.includes(keyword)) {
      const topicMatch = message.match(/(?:news about|what's going on with|happening with|lately with)\s+([a-zA-Z0-9\s]+)/i);
      if (topicMatch) {
        const topic = topicMatch[1].trim();
        return {
          shouldSearch: true,
          query: `${topic} latest news ${new Date().getFullYear()}`,
          reason: `User asked about current events regarding "${topic}"`
        };
      }
    }
  }
  
  // Location/place mentions - searches for current weather, events, info
  const locationKeywords = ['in chicago', 'in paris', 'in tokyo', 'in london', 'in new york'];
  for (const keyword of locationKeywords) {
    if (lowerMessage.includes(keyword)) {
      const location = keyword.replace('in ', '');
      return {
        shouldSearch: true,
        query: `${location} current weather events ${new Date().toLocaleDateString()}`,
        reason: `User mentioned location "${location}" - searching for current conditions/events`
      };
    }
  }
  
  // Explicit search requests
  if (lowerMessage.includes('search for') || lowerMessage.includes('look up') || lowerMessage.includes('find info about')) {
    const topicMatch = message.match(/(?:search for|look up|find info about)\s+([a-zA-Z0-9\s]+)/i);
    if (topicMatch) {
      const topic = topicMatch[1].trim();
      return {
        shouldSearch: true,
        query: topic,
        reason: `User explicitly requested search for "${topic}"`
      };
    }
  }
  
  return null;
}

/**
 * Performs web search with Chroma-optimized query
 * Returns formatted context for Nephilim responses
 */
export async function performChromaSearch(query: string): Promise<ChromaSearchContext | null> {
  try {
    console.log('[ChromaWebSearch] 🔍 Searching for:', query);
    
    const result = await webSearch.search({ query });
    
    if (result.code !== 200 || result.status !== 20000) {
      console.error('[ChromaWebSearch] ❌ Search failed:', result);
      return null;
    }
    
    const topResults = result.data.slice(0, 3); // Top 3 results for context
    const formattedResults = topResults.map((r, i) => 
      `${i + 1}. ${r.title}\n   ${r.description}\n   Source: ${r.url}`
    );
    
    const searchContext: ChromaSearchContext = {
      query,
      reason: '',
      results: formattedResults,
      rawResults: topResults.map(r => ({
        title: r.title,
        url: r.url,
        description: r.description
      }))
    };
    
    console.log('[ChromaWebSearch] ✅ Search complete:', {
      query,
      resultCount: topResults.length,
      tokens: result.meta?.usage?.tokens || 0
    });
    
    return searchContext;
  } catch (error) {
    console.error('[ChromaWebSearch] ❌ Search error:', error);
    return null;
  }
}

/**
 * Formats search results for Nephilim AI context
 * Adds as additional context before Nephilim responds
 */
export function formatSearchContextForAI(searchContext: ChromaSearchContext): string {
  return `
[🌐 LIVE WEB SEARCH RESULTS - ${searchContext.query}]
${searchContext.results.join('\n\n')}

${searchContext.reason ? `Search triggered because: ${searchContext.reason}` : ''}

Use this information to enhance your response with current/accurate data. Cite sources naturally if relevant.
  `.trim();
}

/**
 * Generates visual indicator for search results in Chroma UI
 */
export function generateSearchBadge(searchContext: ChromaSearchContext): {
  text: string;
  tooltip: string;
  color: string;
} {
  return {
    text: '🔍 Live Search',
    tooltip: `Searched: "${searchContext.query}" - ${searchContext.rawResults.length} results found`,
    color: 'bg-cyan-950/50 text-cyan-400 border-cyan-500'
  };
}
