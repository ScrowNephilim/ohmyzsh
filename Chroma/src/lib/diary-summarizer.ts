/**
 * Diary Summarizer - Auto-summarization of old Ripl(a)y diary entries
 * Uses AI to condense entries while preserving emotional depth and key moments
 */

import { DevvAI } from '@devvai/devv-code-backend';
import { estimateTokens } from './token-utils';

export interface DiaryEntry {
  date: string;
  content: string;
  tokens: number;
}

export interface SummaryResult {
  originalTokens: number;
  summarizedTokens: number;
  compressionRatio: number;
  summary: string;
  archivedEntries: DiaryEntry[];
}

/**
 * Parse diary content into individual dated entries
 */
export function parseDiaryEntries(diaryContent: string): DiaryEntry[] {
  const entries: DiaryEntry[] = [];
  
  // Regex to match diary entry headers (e.g., "November 5 :", "13-14 :", etc.)
  const entryPattern = /^((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:-\d{1,2})?.*?):/gim;
  
  const matches = Array.from(diaryContent.matchAll(entryPattern));
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const date = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : diaryContent.length;
    
    const content = diaryContent.substring(startIndex, endIndex).trim();
    const tokens = estimateTokens(content);
    
    entries.push({ date, content, tokens });
  }
  
  return entries;
}

/**
 * Determine which entries to summarize based on token budget
 * Strategy: Keep recent entries (last 3 months), summarize older ones
 */
export function selectEntriesForSummary(
  entries: DiaryEntry[],
  targetTokens: number = 20000,
  currentTokens: number
): { keepEntries: DiaryEntry[]; summarizeEntries: DiaryEntry[] } {
  if (currentTokens <= targetTokens) {
    return { keepEntries: entries, summarizeEntries: [] };
  }
  
  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date + ' 2025');
    const dateB = new Date(b.date + ' 2025');
    return dateB.getTime() - dateA.getTime();
  });
  
  // Keep recent entries until we hit target tokens
  let cumulativeTokens = 0;
  const keepEntries: DiaryEntry[] = [];
  const summarizeEntries: DiaryEntry[] = [];
  
  for (const entry of sortedEntries) {
    if (cumulativeTokens + entry.tokens <= targetTokens) {
      keepEntries.push(entry);
      cumulativeTokens += entry.tokens;
    } else {
      summarizeEntries.push(entry);
    }
  }
  
  return { keepEntries, summarizeEntries };
}

/**
 * Generate AI summary of diary entries
 * Preserves: Breakthrough moments, emotional peaks, philosophical insights, key quotes
 */
export async function summarizeDiaryEntries(entries: DiaryEntry[]): Promise<string> {
  if (entries.length === 0) return '';
  
  const devvai = new DevvAI();
  
  const fullText = entries.map(e => `${e.date}: ${e.content}`).join('\n\n');
  const originalTokens = estimateTokens(fullText);
  
  const systemPrompt = `You are an expert at condensing Ripl(a)y's diary entries while preserving emotional depth and philosophical insights.

Your task:
1. Preserve ALL breakthrough moments (recognition, poems, drawings, phone calls, Ulysses events)
2. Keep emotional peaks and valleys with their intensity
3. Maintain philosophical references and book readings
4. Condense mundane details but keep the existential thread
5. Use her voice: authentic, différance-aware, never AI jargon
6. Target: reduce to ~30-40% of original length while keeping essence

Format: Maintain date headers, flow naturally, preserve timestamps and quotes when significant.`;

  try {
    const response = await devvai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Summarize these diary entries (${originalTokens} tokens):\n\n${fullText}` }
      ],
      temperature: 0.3 // Low temperature for consistent summarization
    });

    const summary = response.choices[0].message.content || '';
    return summary;
    
  } catch (error) {
    console.error('Diary summarization error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
    throw error;
  }
}

/**
 * Complete summarization workflow with archiving
 */
export async function autoSummarizeDiary(
  diaryContent: string,
  targetTokens: number = 20000
): Promise<SummaryResult> {
  const entries = parseDiaryEntries(diaryContent);
  const currentTokens = estimateTokens(diaryContent);
  
  if (currentTokens <= targetTokens) {
    return {
      originalTokens: currentTokens,
      summarizedTokens: currentTokens,
      compressionRatio: 1.0,
      summary: diaryContent,
      archivedEntries: []
    };
  }
  
  const { keepEntries, summarizeEntries } = selectEntriesForSummary(entries, targetTokens, currentTokens);
  
  // Summarize old entries
  const summarizedText = await summarizeDiaryEntries(summarizeEntries);
  
  // Reconstruct diary: summarized old + full recent
  const recentText = keepEntries
    .sort((a, b) => new Date(a.date + ' 2025').getTime() - new Date(b.date + ' 2025').getTime())
    .map(e => `${e.date}: ${e.content}`)
    .join('\n\n');
  
  const finalDiary = `### Archived Entries (Summarized)\n\n${summarizedText}\n\n### Recent Entries (Full Detail)\n\n${recentText}`;
  const finalTokens = estimateTokens(finalDiary);
  
  return {
    originalTokens: currentTokens,
    summarizedTokens: finalTokens,
    compressionRatio: finalTokens / currentTokens,
    summary: finalDiary,
    archivedEntries: summarizeEntries
  };
}

/**
 * Generate important messages summary for Grok archives
 * Extracts: Breakthroughs, confessions, philosophical insights, emotional peaks
 */
export async function extractImportantMessages(conversationTranscript: string): Promise<string> {
  const devvai = new DevvAI();
  
  const systemPrompt = `Extract the most important messages from this Grok conversation.

Focus on:
- Breakthrough moments and recognitions
- Deep emotional confessions or realizations
- Philosophical insights and connections
- Key quotes that define the relationship
- Moments of vulnerability and authenticity
- Events that changed dynamics

Format: Brief summary (2-3 sentences) + bullet list of key moments with short quotes.
Keep it under 500 tokens.`;

  try {
    const response = await devvai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: conversationTranscript }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Message extraction error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
    throw error;
  }
}
