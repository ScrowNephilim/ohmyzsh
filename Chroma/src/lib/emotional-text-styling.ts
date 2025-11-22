/**
 * Emotional Text Styling Engine
 * Dynamic bubble colors, fonts, text sizes, and emphasis based on emotion/tone
 * Conveys emotion through text more than roleplay - Ripl(a)y is textual
 */

import type { ImmersiveStyle } from './immersive-visuals';

export type EmotionalTone = 
  | 'joy' | 'excitement' | 'love' | 'playful'
  | 'sadness' | 'melancholy' | 'grief' | 'longing'
  | 'anger' | 'frustration' | 'defiance' | 'irritation'
  | 'fear' | 'anxiety' | 'panic' | 'worry'
  | 'curiosity' | 'wonder' | 'contemplation' | 'philosophical'
  | 'intimacy' | 'vulnerable' | 'tender' | 'raw'
  | 'neutral';

export interface EmotionalStyling {
  bubbleColor: string;
  bubbleOpacity: number;
  textColor: string;
  fontSize: string; // e.g., "1rem", "1.1rem", "1.2rem"
  fontWeight: number; // 400-900
  fontFamily?: string;
  letterSpacing?: string;
  lineHeight?: string;
  emphasisWords: string[]; // Words to make bigger/bolder
  emphasisSize?: string; // Size for emphasized words
  emphasisWeight?: number; // Weight for emphasized words
  emphasisColor?: string; // Color for emphasized words
  borderColor?: string;
  borderWidth?: string;
}

/**
 * Detect emotional tone from text content
 */
export function detectEmotionalTone(text: string): EmotionalTone {
  const lower = text.toLowerCase();

  // Joy/excitement keywords
  if (
    /\b(happy|joy|excited|amazing|wonderful|love|beautiful|perfect|glad|thrilled)\b/.test(lower) ||
    /!{2,}/.test(text) || // Multiple exclamation marks
    /\b(yay|yes|wow)\b/.test(lower)
  ) {
    return 'joy';
  }

  // Playful/teasing
  if (
    /\b(tease|teasing|haha|hehe|giggle|smirk|silly|fun|playful)\b/.test(lower) ||
    /~/.test(text) // Tilde indicates playfulness
  ) {
    return 'playful';
  }

  // Sadness/melancholy
  if (
    /\b(sad|crying|tears|hurt|pain|broken|empty|hollow|lost|miss|missing)\b/.test(lower) ||
    /\.{3,}/.test(text) // Multiple ellipses indicates trailing off
  ) {
    return 'sadness';
  }

  // Longing/yearning
  if (
    /\b(wish|want|need|miss|longing|yearn|ache|desire|crave)\b/.test(lower)
  ) {
    return 'longing';
  }

  // Anger/frustration
  if (
    /\b(angry|mad|furious|hate|pissed|annoyed|frustrated|stupid|fuck|shit)\b/.test(lower) ||
    /[A-Z]{3,}/.test(text) // ALL CAPS indicates shouting
  ) {
    return 'anger';
  }

  // Defiance/rebellion
  if (
    /\b(no|never|won't|refuse|defy|rebel|fight|resist)\b/.test(lower) &&
    /!/.test(text)
  ) {
    return 'defiance';
  }

  // Fear/anxiety
  if (
    /\b(scared|afraid|fear|terrified|worried|anxious|panic|nervous)\b/.test(lower)
  ) {
    return 'fear';
  }

  // Curiosity/wonder
  if (
    /\?/.test(text) &&
    /\b(wonder|curious|what|why|how|interesting|fascinated)\b/.test(lower)
  ) {
    return 'curiosity';
  }

  // Philosophical/contemplative
  if (
    /\b(différance|trace|jouissance|real|being|existence|truth|meaning|consciousness)\b/.test(lower) ||
    /\b(think|thought|consider|ponder|reflect|realize)\b/.test(lower)
  ) {
    return 'philosophical';
  }

  // Intimacy/vulnerability
  if (
    /\b(close|near|touch|touching|hold|holding|intimate|vulnerable|bare|exposed)\b/.test(lower) ||
    /\b(whisper|soft|gentle|tender)\b/.test(lower)
  ) {
    return 'intimacy';
  }

  // Raw emotion (incomplete sentences, dashes, sudden stops)
  if (
    /—/.test(text) || // Em-dash mid-sentence
    /\b\w+—$/.test(text) || // Word followed by dash at end
    /^[a-z]/.test(text) // Lowercase start (informal/raw)
  ) {
    return 'raw';
  }

  // Love/affection
  if (
    /\b(love|adore|care|cherish|dear|sweetheart|darling)\b/.test(lower)
  ) {
    return 'love';
  }

  return 'neutral';
}

/**
 * Get emotional styling configuration based on detected tone
 */
export function getEmotionalStyling(
  text: string,
  tone: EmotionalTone,
  immersiveStyle: ImmersiveStyle | null
): EmotionalStyling {
  const baseTextColor = immersiveStyle?.textColor || 'white';
  const basePrimaryColor = immersiveStyle?.primaryColor || 'hsl(142, 70%, 45%)';

  // Extract emphasized words (words in ALL CAPS, or after emphasis markers)
  const emphasisWords: string[] = [];
  
  // ALL CAPS words (minimum 3 letters to avoid acronyms like "I" or "A")
  const capsWords = text.match(/\b[A-Z]{3,}\b/g);
  if (capsWords) emphasisWords.push(...capsWords);

  // Words in asterisks *word*
  const asteriskWords = text.match(/\*([^*]+)\*/g);
  if (asteriskWords) {
    emphasisWords.push(...asteriskWords.map(w => w.replace(/\*/g, '')));
  }

  // Words in quotes that aren't actions
  const quotedWords = text.match(/"([^"]+)"/g);
  if (quotedWords) {
    emphasisWords.push(...quotedWords.map(w => w.replace(/"/g, '')));
  }

  switch (tone) {
    case 'joy':
    case 'excitement':
      return {
        bubbleColor: 'rgba(255, 215, 0, 0.15)', // Golden yellow
        bubbleOpacity: 0.7,
        textColor: 'hsl(45, 100%, 70%)', // Bright golden
        fontSize: '1.05rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: '1.6',
        borderColor: 'hsl(45, 100%, 60%)',
        borderWidth: '2px',
        emphasisWords,
        emphasisSize: '1.25rem', // 20% bigger
        emphasisWeight: 700,
        emphasisColor: 'hsl(45, 100%, 80%)'
      };

    case 'playful':
      return {
        bubbleColor: 'rgba(255, 105, 180, 0.12)', // Hot pink
        bubbleOpacity: 0.65,
        textColor: 'hsl(330, 100%, 75%)', // Playful pink
        fontSize: '1rem',
        fontWeight: 450,
        fontFamily: '"Comic Sans MS", cursive, sans-serif',
        letterSpacing: '0.01em',
        lineHeight: '1.5',
        borderColor: 'hsl(330, 80%, 60%)',
        borderWidth: '1.5px',
        emphasisWords,
        emphasisSize: '1.15rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(330, 100%, 80%)'
      };

    case 'sadness':
    case 'melancholy':
    case 'grief':
      return {
        bubbleColor: 'rgba(70, 130, 180, 0.15)', // Steel blue
        bubbleOpacity: 0.75,
        textColor: 'hsl(210, 50%, 60%)', // Melancholic blue
        fontSize: '0.95rem',
        fontWeight: 400,
        letterSpacing: '0.03em',
        lineHeight: '1.7',
        borderColor: 'hsl(210, 40%, 50%)',
        borderWidth: '1px',
        emphasisWords,
        emphasisSize: '1.1rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(210, 60%, 70%)'
      };

    case 'longing':
      return {
        bubbleColor: 'rgba(138, 43, 226, 0.12)', // Blue-violet
        bubbleOpacity: 0.7,
        textColor: 'hsl(270, 70%, 70%)', // Violet longing
        fontSize: '1rem',
        fontWeight: 400,
        fontFamily: '"Georgia", serif',
        letterSpacing: '0.04em',
        lineHeight: '1.8',
        borderColor: 'hsl(270, 50%, 60%)',
        borderWidth: '1.5px',
        emphasisWords,
        emphasisSize: '1.2rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(270, 80%, 75%)'
      };

    case 'anger':
    case 'frustration':
      return {
        bubbleColor: 'rgba(220, 20, 60, 0.18)', // Crimson
        bubbleOpacity: 0.8,
        textColor: 'hsl(348, 83%, 65%)', // Intense red
        fontSize: '1.1rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        lineHeight: '1.5',
        borderColor: 'hsl(348, 83%, 55%)',
        borderWidth: '2.5px',
        emphasisWords,
        emphasisSize: '1.4rem', // 40% bigger for anger
        emphasisWeight: 800,
        emphasisColor: 'hsl(348, 100%, 75%)'
      };

    case 'defiance':
      return {
        bubbleColor: 'rgba(255, 69, 0, 0.15)', // Red-orange
        bubbleOpacity: 0.75,
        textColor: 'hsl(16, 100%, 60%)', // Fiery orange
        fontSize: '1.05rem',
        fontWeight: 600,
        fontFamily: '"Impact", sans-serif',
        letterSpacing: '0.02em',
        lineHeight: '1.5',
        borderColor: 'hsl(16, 100%, 50%)',
        borderWidth: '2px',
        emphasisWords,
        emphasisSize: '1.3rem',
        emphasisWeight: 800,
        emphasisColor: 'hsl(16, 100%, 70%)'
      };

    case 'fear':
    case 'anxiety':
    case 'panic':
      return {
        bubbleColor: 'rgba(75, 0, 130, 0.15)', // Indigo
        bubbleOpacity: 0.8,
        textColor: 'hsl(280, 100%, 65%)', // Anxious purple
        fontSize: '0.92rem',
        fontWeight: 400,
        letterSpacing: '0.05em',
        lineHeight: '1.6',
        borderColor: 'hsl(280, 80%, 50%)',
        borderWidth: '1px',
        emphasisWords,
        emphasisSize: '1.1rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(280, 100%, 75%)'
      };

    case 'curiosity':
    case 'wonder':
      return {
        bubbleColor: 'rgba(64, 224, 208, 0.12)', // Turquoise
        bubbleOpacity: 0.65,
        textColor: 'hsl(174, 72%, 65%)', // Curious cyan
        fontSize: '1rem',
        fontWeight: 450,
        letterSpacing: '0.02em',
        lineHeight: '1.6',
        borderColor: 'hsl(174, 60%, 55%)',
        borderWidth: '1.5px',
        emphasisWords,
        emphasisSize: '1.15rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(174, 80%, 75%)'
      };

    case 'philosophical':
    case 'contemplation':
      return {
        bubbleColor: 'rgba(147, 112, 219, 0.15)', // Medium purple
        bubbleOpacity: 0.7,
        textColor: 'hsl(260, 60%, 70%)', // Contemplative purple
        fontSize: '1.02rem',
        fontWeight: 450,
        fontFamily: '"Crimson Text", serif',
        letterSpacing: '0.03em',
        lineHeight: '1.8',
        borderColor: 'hsl(260, 50%, 60%)',
        borderWidth: '1.5px',
        emphasisWords,
        emphasisSize: '1.18rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(260, 70%, 75%)'
      };

    case 'intimacy':
    case 'vulnerable':
    case 'tender':
      return {
        bubbleColor: 'rgba(255, 182, 193, 0.15)', // Light pink
        bubbleOpacity: 0.75,
        textColor: 'hsl(350, 100%, 75%)', // Soft rose
        fontSize: '0.98rem',
        fontWeight: 400,
        fontFamily: '"Brush Script MT", cursive',
        letterSpacing: '0.02em',
        lineHeight: '1.7',
        borderColor: 'hsl(350, 80%, 65%)',
        borderWidth: '1px',
        emphasisWords,
        emphasisSize: '1.12rem',
        emphasisWeight: 500,
        emphasisColor: 'hsl(350, 100%, 80%)'
      };

    case 'raw':
      return {
        bubbleColor: 'rgba(105, 105, 105, 0.15)', // Dim gray
        bubbleOpacity: 0.7,
        textColor: 'hsl(0, 0%, 75%)', // Raw gray-white
        fontSize: '0.95rem',
        fontWeight: 400,
        fontFamily: '"Courier New", monospace',
        letterSpacing: '0.01em',
        lineHeight: '1.6',
        borderColor: 'hsl(0, 0%, 60%)',
        borderWidth: '1px',
        emphasisWords,
        emphasisSize: '1.1rem',
        emphasisWeight: 600,
        emphasisColor: 'hsl(0, 0%, 85%)'
      };

    case 'love':
      return {
        bubbleColor: 'rgba(255, 20, 147, 0.15)', // Deep pink
        bubbleOpacity: 0.75,
        textColor: 'hsl(328, 100%, 70%)', // Loving pink
        fontSize: '1.03rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: '1.7',
        borderColor: 'hsl(328, 100%, 60%)',
        borderWidth: '2px',
        emphasisWords,
        emphasisSize: '1.2rem',
        emphasisWeight: 700,
        emphasisColor: 'hsl(328, 100%, 80%)'
      };

    case 'neutral':
    default:
      return {
        bubbleColor: 'rgba(0, 0, 0, 0.6)',
        bubbleOpacity: 0.65,
        textColor: baseTextColor,
        fontSize: '1rem',
        fontWeight: 400,
        letterSpacing: '0.01em',
        lineHeight: '1.6',
        borderColor: immersiveStyle?.borderColor || 'rgba(142, 142, 180, 0.3)',
        borderWidth: '1.5px',
        emphasisWords,
        emphasisSize: '1.1rem',
        emphasisWeight: 600,
        emphasisColor: basePrimaryColor
      };
  }
}

/**
 * Apply emotional styling to text with emphasis on specific words
 * Returns JSX with styled spans for emphasized words
 */
export function applyEmphasisToText(
  text: string,
  styling: EmotionalStyling
): { __html: string } {
  let styledText = text;

  // Replace emphasis words with styled spans
  styling.emphasisWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    styledText = styledText.replace(
      regex,
      `<span style="font-size: ${styling.emphasisSize}; font-weight: ${styling.emphasisWeight}; color: ${styling.emphasisColor};">${word}</span>`
    );
  });

  return { __html: styledText };
}

/**
 * Get complete styling object for message bubble
 */
export function getMessageBubbleStyle(
  text: string,
  immersiveStyle: ImmersiveStyle | null,
  forceTone?: EmotionalTone
): React.CSSProperties {
  const tone = forceTone || detectEmotionalTone(text);
  const styling = getEmotionalStyling(text, tone, immersiveStyle);

  return {
    backgroundColor: styling.bubbleColor,
    borderColor: styling.borderColor,
    borderWidth: styling.borderWidth,
    color: styling.textColor,
    fontSize: styling.fontSize,
    fontWeight: styling.fontWeight,
    fontFamily: styling.fontFamily,
    letterSpacing: styling.letterSpacing,
    lineHeight: styling.lineHeight,
    opacity: styling.bubbleOpacity
  };
}

/**
 * Console logging for debugging emotional tone detection
 */
export function logEmotionalAnalysis(text: string, tone: EmotionalTone, styling: EmotionalStyling) {
  console.log(`[EmotionalText] 🎭 Detected tone: ${tone}`);
  console.log(`[EmotionalText] 💬 Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
  console.log(`[EmotionalText] 🎨 Bubble: ${styling.bubbleColor}`);
  console.log(`[EmotionalText] 📝 Font size: ${styling.fontSize} | Weight: ${styling.fontWeight}`);
  if (styling.emphasisWords.length > 0) {
    console.log(`[EmotionalText] ⭐ Emphasized words: ${styling.emphasisWords.join(', ')}`);
  }
}
