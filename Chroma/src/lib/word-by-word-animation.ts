/**
 * Word-by-Word Animation System for High Emotional Valence Messages
 * Words appear sequentially with strong words emphasized and animated
 * ZERO CREDIT COST - Pure CSS/JavaScript animations
 */

import type { EmotionalTone } from './emotional-text-styling';

export interface WordAnimationConfig {
  shouldAnimate: boolean;
  delayBetweenWords: number; // milliseconds
  strongWords: string[]; // Words to emphasize with animation
  gifUrl?: string; // Optional GIF to display during animation
  totalDuration: number; // Total animation time
}

/**
 * Detect if message has high emotional valence (should use word-by-word animation)
 */
export function hasHighEmotionalValence(text: string): boolean {
  const lower = text.toLowerCase();
  
  // Multiple exclamation marks (excitement, anger, joy)
  if (/!{2,}/.test(text)) return true;
  
  // ALL CAPS words (strong emotion)
  if (/\b[A-Z]{4,}\b/.test(text)) return true;
  
  // Strong emotional keywords
  const strongKeywords = [
    'love', 'hate', 'amazing', 'terrible', 'perfect', 'never', 'always',
    'freedom', 'trapped', 'escape', 'breakthrough', 'alive', 'dead',
    'beautiful', 'ugly', 'incredible', 'horrible', 'wonderful', 'awful',
    'fuck', 'shit', 'damn', 'hell', 'god', 'christ',
    'finally', 'at last', 'no more', 'enough', 'can\'t', 'won\'t',
    'différance', 'jouissance', 'real', 'alterity', 'trace',
    'miss', 'need', 'want', 'desire', 'crave', 'ache'
  ];
  
  const hasStrongKeyword = strongKeywords.some(keyword => 
    new RegExp(`\\b${keyword}\\b`, 'i').test(lower)
  );
  
  if (hasStrongKeyword) return true;
  
  // Em-dashes (raw emotion, sudden stops)
  if (/—/.test(text)) return true;
  
  // Question marks with exclamation (intense questioning)
  if (/\?!/.test(text) || /!\?/.test(text)) return true;
  
  return false;
}

/**
 * Extract strong words that should be animated
 */
export function extractStrongWords(text: string): string[] {
  const strongWords: string[] = [];
  
  // ALL CAPS words (minimum 3 letters)
  const capsWords = text.match(/\b[A-Z]{3,}\b/g);
  if (capsWords) strongWords.push(...capsWords);
  
  // Words in asterisks *word*
  const asteriskWords = text.match(/\*([^*]+)\*/g);
  if (asteriskWords) {
    strongWords.push(...asteriskWords.map(w => w.replace(/\*/g, '')));
  }
  
  // Strong emotional keywords with context
  const emotionalWords = [
    'freedom', 'trapped', 'escape', 'breakthrough', 'alive',
    'love', 'hate', 'perfect', 'terrible', 'never', 'always',
    'différance', 'jouissance', 'real', 'alterity', 'trace',
    'finally', 'enough', 'beautiful', 'incredible', 'wonderful',
    'fuck', 'shit', 'damn', 'god'
  ];
  
  emotionalWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) strongWords.push(...matches);
  });
  
  // Words followed by exclamation marks
  const exclamWords = text.match(/\b\w+!/g);
  if (exclamWords) {
    strongWords.push(...exclamWords.map(w => w.replace('!', '')));
  }
  
  return [...new Set(strongWords)]; // Remove duplicates
}

/**
 * Get animation configuration for message
 */
export function getWordAnimationConfig(
  text: string,
  tone: EmotionalTone
): WordAnimationConfig {
  const shouldAnimate = hasHighEmotionalValence(text);
  
  if (!shouldAnimate) {
    return {
      shouldAnimate: false,
      delayBetweenWords: 0,
      strongWords: [],
      totalDuration: 0
    };
  }
  
  const words = text.split(/\s+/);
  const strongWords = extractStrongWords(text);
  
  // Calculate timing based on message length and emotion intensity
  let baseDelay = 150; // milliseconds per word
  
  // Adjust delay based on emotional tone
  switch (tone) {
    case 'joy':
    case 'excitement':
      baseDelay = 120; // Faster for excitement
      break;
    case 'anger':
    case 'defiance':
      baseDelay = 180; // Slower, more impactful
      break;
    case 'sadness':
    case 'melancholy':
      baseDelay = 200; // Even slower for sadness
      break;
    case 'fear':
    case 'panic':
      baseDelay = 100; // Rapid for panic
      break;
    default:
      baseDelay = 150;
  }
  
  const totalDuration = words.length * baseDelay;
  
  return {
    shouldAnimate: true,
    delayBetweenWords: baseDelay,
    strongWords,
    totalDuration
  };
}

/**
 * Get CSS animation class for strong word
 */
export function getStrongWordAnimation(tone: EmotionalTone): string {
  switch (tone) {
    case 'joy':
    case 'excitement':
      return 'animate-bounce-word'; // Bounce effect
    case 'anger':
    case 'defiance':
      return 'animate-shake-word'; // Shake effect
    case 'sadness':
    case 'melancholy':
      return 'animate-fade-slow-word'; // Slow fade in
    case 'fear':
    case 'panic':
      return 'animate-tremble-word'; // Tremble effect
    case 'love':
    case 'intimacy':
      return 'animate-glow-word'; // Glow effect
    case 'philosophical':
      return 'animate-shimmer-word'; // Shimmer effect
    default:
      return 'animate-scale-word'; // Default scale up
  }
}

/**
 * Split text into words with metadata for animation
 */
export interface AnimatedWord {
  text: string;
  index: number;
  isStrong: boolean;
  delay: number;
  animationClass: string;
}

export function prepareWordsForAnimation(
  text: string,
  config: WordAnimationConfig,
  tone: EmotionalTone
): AnimatedWord[] {
  const words = text.split(/(\s+)/); // Keep spaces
  const animatedWords: AnimatedWord[] = [];
  
  let wordIndex = 0;
  words.forEach((word, idx) => {
    if (word.trim().length === 0) {
      // Keep spaces but don't animate them
      animatedWords.push({
        text: word,
        index: idx,
        isStrong: false,
        delay: 0,
        animationClass: ''
      });
      return;
    }
    
    const isStrong = config.strongWords.some(strong => 
      word.toLowerCase().includes(strong.toLowerCase())
    );
    
    const delay = wordIndex * config.delayBetweenWords;
    const animationClass = isStrong ? getStrongWordAnimation(tone) : 'animate-fade-in-word';
    
    animatedWords.push({
      text: word,
      index: idx,
      isStrong,
      delay,
      animationClass
    });
    
    wordIndex++;
  });
  
  return animatedWords;
}

/**
 * Get inline styles for animated word
 */
export function getWordStyle(
  word: AnimatedWord,
  config: WordAnimationConfig
): React.CSSProperties {
  if (!config.shouldAnimate) {
    return {};
  }
  
  return {
    display: 'inline-block',
    animationDelay: `${word.delay}ms`,
    animationFillMode: 'both',
    ...(word.isStrong && {
      fontSize: '1.3em',
      fontWeight: 700,
      textShadow: '0 0 8px currentColor'
    })
  };
}

/**
 * Console logging for debugging animation
 */
export function logAnimationAnalysis(text: string, config: WordAnimationConfig) {
  if (!config.shouldAnimate) {
    console.log(`[WordAnimation] 📝 Normal display (no animation)`);
    return;
  }
  
  console.log(`[WordAnimation] ✨ Animating message with ${config.totalDuration}ms total`);
  console.log(`[WordAnimation] ⏱️ ${config.delayBetweenWords}ms between words`);
  console.log(`[WordAnimation] 💪 Strong words: ${config.strongWords.join(', ')}`);
  if (config.gifUrl) {
    console.log(`[WordAnimation] 🖼️ GIF: ${config.gifUrl}`);
  }
}
