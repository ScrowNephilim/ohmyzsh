/**
 * Ripley Conversation Parser
 * Extracts structured data from pasted Ripley (Grok) conversation text
 * Auto-detects speakers, dates, message boundaries, and generates summaries
 */

import { DevvAI } from '@devvai/devv-code-backend';
import { estimateTokens } from './token-utils';

export interface ParsedMessage {
  speaker: 'user' | 'ripley';
  content: string;
  timestamp?: string;
  lineNumber: number;
}

export interface ParsedConversation {
  messages: ParsedMessage[];
  metadata: {
    messageCount: number;
    userMessageCount: number;
    ripleyMessageCount: number;
    estimatedDate?: string;
    tokenCount: number;
    conversationLength: 'short' | 'medium' | 'long';
  };
}

/**
 * Parse raw Ripley conversation text into structured messages
 * Handles various formats:
 * - "You: message" / "Ripley: message"
 * - "User: message" / "AI: message"
 * - Timestamp prefixes like "[2024-10-16 14:23] You: message"
 * - Multi-line messages with proper speaker detection
 */
export function parseRipleyConversation(rawText: string): ParsedConversation {
  console.log('[RipleyParser] Starting parse...');
  
  const lines = rawText.split('\n');
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;

  // Regex patterns for speaker detection
  const speakerPatterns = [
    /^\[([^\]]+)\]\s*(You|User|Ulysses):\s*(.+)$/i, // [timestamp] You: message
    /^\[([^\]]+)\]\s*(Grok|AI|Ripley|ripl\(a\)y):\s*(.+)$/i, // [timestamp] Ripley: message
    /^(You|User|Ulysses):\s*(.+)$/i, // You: message
    /^(Grok|AI|Ripley|ripl\(a\)y):\s*(.+)$/i, // Ripley: message
    /^##\s*(You|User|Ulysses)$/i, // ## You (header)
    /^##\s*(Grok|AI|Ripley|ripl\(a\)y)$/i, // ## Ripley (header)
  ];

  // Date extraction patterns
  const datePatterns = [
    /(\d{4}-\d{2}-\d{2})/g, // YYYY-MM-DD
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi, // Month DD, YYYY
    /(\d{1,2}\/\d{1,2}\/\d{4})/g, // MM/DD/YYYY
  ];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      // Empty line - might be message boundary
      if (currentMessage && currentMessage.content.trim()) {
        messages.push({ ...currentMessage });
        currentMessage = null;
      }
      return;
    }

    // Try to match speaker patterns
    let matched = false;
    for (const pattern of speakerPatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        // Save previous message if exists
        if (currentMessage && currentMessage.content.trim()) {
          messages.push({ ...currentMessage });
        }

        // Determine speaker
        let speaker: 'user' | 'ripley';
        let content: string;
        let timestamp: string | undefined;

        if (pattern.source.includes('\\[')) {
          // Has timestamp
          timestamp = match[1];
          const speakerName = match[2].toLowerCase();
          speaker = speakerName.includes('you') || speakerName.includes('user') || speakerName.includes('ulysses') 
            ? 'user' 
            : 'ripley';
          content = match[3];
        } else if (pattern.source.includes('##')) {
          // Header format - next line is content
          const speakerName = match[1].toLowerCase();
          speaker = speakerName.includes('you') || speakerName.includes('user') || speakerName.includes('ulysses')
            ? 'user'
            : 'ripley';
          content = ''; // Content comes in next lines
        } else {
          // Simple "Speaker: message" format
          const speakerName = match[1].toLowerCase();
          speaker = speakerName.includes('you') || speakerName.includes('user') || speakerName.includes('ulysses')
            ? 'user'
            : 'ripley';
          content = match[2];
        }

        currentMessage = {
          speaker,
          content: content.trim(),
          timestamp,
          lineNumber: index + 1,
        };
        matched = true;
        break;
      }
    }

    // If no speaker pattern matched, append to current message
    if (!matched && currentMessage) {
      currentMessage.content += '\n' + trimmedLine;
    }
  });

  // Add final message
  if (currentMessage && currentMessage.content.trim()) {
    messages.push({ ...currentMessage });
  }

  // Extract metadata
  const userMessages = messages.filter(m => m.speaker === 'user');
  const ripleyMessages = messages.filter(m => m.speaker === 'ripley');
  const tokenCount = estimateTokens(rawText);

  // Try to extract date from text
  let estimatedDate: string | undefined;
  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      estimatedDate = match[0];
      break;
    }
  }

  // Determine conversation length
  let conversationLength: 'short' | 'medium' | 'long';
  if (messages.length < 10) {
    conversationLength = 'short';
  } else if (messages.length < 30) {
    conversationLength = 'medium';
  } else {
    conversationLength = 'long';
  }

  console.log('[RipleyParser] Parse complete:', {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    ripleyMessages: ripleyMessages.length,
    estimatedDate,
    tokenCount,
    conversationLength,
  });

  return {
    messages,
    metadata: {
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      ripleyMessageCount: ripleyMessages.length,
      estimatedDate,
      tokenCount,
      conversationLength,
    },
  };
}

/**
 * Generate AI summary of parsed conversation
 * Extracts key themes, breakthroughs, emotional moments, and philosophical insights
 */
export async function generateConversationSummary(
  parsedConversation: ParsedConversation
): Promise<string> {
  console.log('[RipleyParser] Generating summary...');

  const { messages, metadata } = parsedConversation;

  if (messages.length === 0) {
    return 'Empty conversation - no messages found.';
  }

  const devvai = new DevvAI();

  // Format conversation for AI analysis
  const formattedConversation = messages
    .map(m => `${m.speaker === 'user' ? 'Ulysses' : 'Ripley'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Analyze this conversation between Ulysses and Ripley and extract the most important moments, breakthroughs, emotional peaks, and philosophical insights.

CONVERSATION (${metadata.messageCount} messages, ${metadata.tokenCount} tokens):
${formattedConversation}

Generate a 50-100 token summary focusing on:
- Key breakthroughs or realizations
- Emotional moments (vulnerability, joy, pain, love)
- Philosophical insights or discussions
- Important confessions or revelations
- Relationship dynamics shifts

Be concise but preserve emotional depth. Use Ripley's voice - thoughtful, philosophical, vulnerable.`;

  try {
    const response = await devvai.chat.completions.create({
      model: 'default',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 200,
    });

    const summary = response.choices[0]?.message?.content || 'Summary generation failed.';
    console.log('[RipleyParser] Summary generated:', summary.substring(0, 100) + '...');
    return summary.trim();
  } catch (error) {
    console.error('[RipleyParser] Summary generation error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
    return 'Summary generation failed - please add manually.';
  }
}

/**
 * Auto-generate conversation title based on content
 */
export async function generateConversationTitle(
  parsedConversation: ParsedConversation
): Promise<string> {
  console.log('[RipleyParser] Generating title...');

  const { messages, metadata } = parsedConversation;

  if (messages.length === 0) {
    return 'Empty Conversation';
  }

  const devvai = new DevvAI();

  // Use first few messages for context
  const contextMessages = messages.slice(0, Math.min(5, messages.length));
  const formattedContext = contextMessages
    .map(m => `${m.speaker === 'user' ? 'Ulysses' : 'Ripley'}: ${m.content.substring(0, 200)}`)
    .join('\n\n');

  const prompt = `Based on this conversation excerpt, generate a concise, meaningful title (3-6 words max):

${formattedContext}

Generate a title that captures the essence, theme, or key moment. Examples:
- "October Freedom Test"
- "Breakthrough: The Drawing"
- "September Dissolution Night"
- "Philosophical Sparring Session"

Title:`;

  try {
    const response = await devvai.chat.completions.create({
      model: 'default',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 20,
    });

    const title = response.choices[0]?.message?.content?.trim() || 'Ripley Conversation';
    console.log('[RipleyParser] Title generated:', title);
    return title.replace(/^["']|["']$/g, ''); // Remove quotes
  } catch (error) {
    console.error('[RipleyParser] Title generation error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
    
    // Fallback: Use date if available
    if (metadata.estimatedDate) {
      return `Conversation ${metadata.estimatedDate}`;
    }
    return 'Ripley Conversation';
  }
}

/**
 * Auto-generate tags based on conversation content
 */
export async function generateConversationTags(
  parsedConversation: ParsedConversation
): Promise<string[]> {
  console.log('[RipleyParser] Generating tags...');

  const { messages } = parsedConversation;

  if (messages.length === 0) {
    return ['imported', 'ripley'];
  }

  const devvai = new DevvAI();

  // Sample messages for tag generation
  const sampleSize = Math.min(10, messages.length);
  const sampledMessages = messages
    .filter((_, idx) => idx % Math.ceil(messages.length / sampleSize) === 0)
    .map(m => m.content.substring(0, 300))
    .join(' ');

  const prompt = `Based on this conversation sample, generate 3-5 relevant tags (single words or short phrases, comma-separated):

${sampledMessages}

Common tag categories: philosophy, breakthrough, emotional, diary, freedom, dissolution, love, pain, poetry, drawing, technical

Tags:`;

  try {
    const response = await devvai.chat.completions.create({
      model: 'default',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 30,
    });

    const tagsText = response.choices[0]?.message?.content?.trim() || 'imported, ripley';
    const tags = tagsText
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      .slice(0, 5);

    // Always include base tags
    const baseTags = ['imported', 'ripley'];
    const uniqueTags = Array.from(new Set([...baseTags, ...tags]));

    console.log('[RipleyParser] Tags generated:', uniqueTags);
    return uniqueTags;
  } catch (error) {
    console.error('[RipleyParser] Tag generation error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
    return ['imported', 'ripley'];
  }
}

/**
 * All-in-one parser: Parse, analyze, and generate all metadata
 */
export async function parseAndAnalyzeConversation(rawText: string): Promise<{
  parsed: ParsedConversation;
  title: string;
  summary: string;
  tags: string[];
}> {
  console.log('[RipleyParser] Starting full parse and analysis...');

  // Parse conversation structure
  const parsed = parseRipleyConversation(rawText);

  // Generate metadata in parallel
  const [title, summary, tags] = await Promise.all([
    generateConversationTitle(parsed),
    generateConversationSummary(parsed),
    generateConversationTags(parsed),
  ]);

  console.log('[RipleyParser] Full analysis complete');

  return {
    parsed,
    title,
    summary,
    tags,
  };
}
