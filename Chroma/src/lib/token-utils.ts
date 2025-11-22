/**
 * Token Utility Functions
 * Shared token estimation utilities to prevent circular dependencies
 */

/**
 * Estimate token count for text
 * Rule of thumb: 1 token ≈ 4 characters
 * 
 * This is a rough approximation. Actual tokenization varies by model:
 * - GPT-4 uses cl100k_base encoding
 * - Claude uses different tokenizer
 * - Average English: 1 token ≈ 0.75 words or 4 characters
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Estimate word count for text
 */
export function estimateWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Estimate character count (excluding whitespace)
 */
export function estimateChars(text: string): number {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
}
