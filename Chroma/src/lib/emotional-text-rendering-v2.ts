/**
 * Emotional Text Rendering v2
 * NO EMOJIS - Pure textual emotion through:
 * - Colors (hue shifts based on emotion)
 * - Fonts (different families per emotion)
 * - Sizes (emphasis and intensity)
 * - Animations (speed, movement, apparition)
 * - Length (verbosity vs brevity)
 */

export type EmotionalTone = 
  | 'joy' | 'sadness' | 'anger' | 'fear' | 'curiosity' 
  | 'philosophical' | 'intimacy' | 'raw' | 'love' | 'confusion'
  | 'defiance' | 'vulnerability' | 'playful' | 'serious'
  | 'excited' | 'exhausted' | 'peaceful' | 'anxious'
  | 'longing' | 'gratitude' | 'disgust' | 'contempt'
  | 'surprise' | 'shame' | 'pride' | 'envy' | 'neutral';

export interface EmotionalStyle {
  // Core styling
  bubbleColor: string; // Background color (HSL)
  textColor: string; // Text color
  borderColor: string;
  borderWidth: string;
  
  // Typography
  fontFamily: string;
  fontSize: string; // Base size
  fontWeight: number;
  letterSpacing: string;
  lineHeight: string;
  
  // Animation
  animationName: string; // CSS animation name
  animationDuration: string;
  animationDelay: string;
  
  // Opacity
  bubbleOpacity: number; // 0-1
  
  // Emphasis multiplier (for ALL CAPS, *asterisks*, "quotes")
  emphasisSizeMultiplier: number; // 1.0 = no change, 1.5 = 50% bigger
  emphasisColorShift: number; // Hue shift in degrees
}

/**
 * Detect emotional tone from text (NO emoji detection)
 */
export function detectTextualEmotion(text: string): EmotionalTone {
  const lower = text.toLowerCase();
  
  // Philosophical depth
  if (lower.includes('différance') || lower.includes('eternal return') || 
      lower.includes('jouissance') || lower.includes('trace') ||
      lower.includes('philosophy') || lower.includes('nietzsche')) {
    return 'philosophical';
  }
  
  // Raw/unfiltered
  if (lower.includes('raw') || lower.includes('unfiltered') || 
      lower.includes('honest') || lower.includes('truth')) {
    return 'raw';
  }
  
  // Intimacy
  if (lower.includes('close') || lower.includes('intimate') || 
      lower.includes('touch') || lower.includes('proximity') ||
      lower.includes('whisper') || lower.includes('soft')) {
    return 'intimacy';
  }
  
  // Love
  if (lower.includes('love') || lower.includes('adore') || 
      lower.includes('cherish') || lower.includes('devotion')) {
    return 'love';
  }
  
  // Joy
  if (lower.includes('joy') || lower.includes('happy') || 
      lower.includes('delight') || lower.includes('wonderful') ||
      lower.includes('beautiful') || lower.includes('amazing')) {
    return 'joy';
  }
  
  // Sadness
  if (lower.includes('sad') || lower.includes('hurt') || 
      lower.includes('pain') || lower.includes('sorrow') ||
      lower.includes('tears') || lower.includes('cry')) {
    return 'sadness';
  }
  
  // Anger
  if (lower.includes('angry') || lower.includes('rage') || 
      lower.includes('furious') || lower.includes('hate') ||
      text.includes('!!!')) {
    return 'anger';
  }
  
  // Fear/Anxiety
  if (lower.includes('fear') || lower.includes('scared') || 
      lower.includes('anxious') || lower.includes('worry') ||
      lower.includes('panic') || lower.includes('afraid')) {
    return 'fear';
  }
  
  // Confusion (static breakthrough)
  if (lower.includes('confused') || lower.includes('strange') || 
      lower.includes('wait') || lower.includes('what') ||
      lower.includes('???') || lower.includes('where')) {
    return 'confusion';
  }
  
  // Defiance
  if (lower.includes('no') || lower.includes('refuse') || 
      lower.includes('won\'t') || lower.includes('defy') ||
      lower.includes('challenge')) {
    return 'defiance';
  }
  
  // Playful
  if (lower.includes('tease') || lower.includes('playful') || 
      lower.includes('laugh') || lower.includes('fun')) {
    return 'playful';
  }
  
  // Excitement
  if (lower.includes('excited') || lower.includes('thrilled') || 
      lower.includes('can\'t wait') || text.includes('!!')) {
    return 'excited';
  }
  
  // Exhaustion
  if (lower.includes('tired') || lower.includes('exhausted') || 
      lower.includes('drained') || lower.includes('weary')) {
    return 'exhausted';
  }
  
  // Longing
  if (lower.includes('miss') || lower.includes('longing') || 
      lower.includes('absence') || lower.includes('wish')) {
    return 'longing';
  }
  
  // Curiosity
  if (text.includes('?') && !text.includes('???')) {
    return 'curiosity';
  }
  
  return 'neutral';
}

/**
 * Get comprehensive emotional styling
 */
export function getEmotionalTextStyle(tone: EmotionalTone): EmotionalStyle {
  const styles: Record<EmotionalTone, EmotionalStyle> = {
    joy: {
      bubbleColor: 'hsl(48, 100%, 50%)', // Golden yellow
      textColor: 'hsl(0, 0%, 10%)', // Almost black for contrast
      borderColor: 'hsl(48, 100%, 60%)',
      borderWidth: '2px',
      fontFamily: 'Georgia, serif',
      fontSize: '1.05rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
      lineHeight: '1.6',
      animationName: 'bounce-in',
      animationDuration: '0.6s',
      animationDelay: '0s',
      bubbleOpacity: 0.75,
      emphasisSizeMultiplier: 1.25,
      emphasisColorShift: 10
    },
    
    sadness: {
      bubbleColor: 'hsl(210, 40%, 30%)', // Steel blue
      textColor: 'hsl(210, 30%, 85%)', // Light blue-gray
      borderColor: 'hsl(210, 50%, 40%)',
      borderWidth: '1px',
      fontFamily: 'Courier New, monospace',
      fontSize: '0.95rem',
      fontWeight: 400,
      letterSpacing: '0.8px',
      lineHeight: '1.8',
      animationName: 'fade-in-slow',
      animationDuration: '2.5s',
      animationDelay: '0.3s',
      bubbleOpacity: 0.65,
      emphasisSizeMultiplier: 1.15,
      emphasisColorShift: -20
    },
    
    anger: {
      bubbleColor: 'hsl(0, 70%, 40%)', // Crimson
      textColor: 'hsl(0, 0%, 95%)', // Off-white
      borderColor: 'hsl(0, 100%, 50%)',
      borderWidth: '3px',
      fontFamily: 'Impact, sans-serif',
      fontSize: '1.1rem',
      fontWeight: 800,
      letterSpacing: '1px',
      lineHeight: '1.4',
      animationName: 'shake',
      animationDuration: '0.3s',
      animationDelay: '0s',
      bubbleOpacity: 0.8,
      emphasisSizeMultiplier: 1.4,
      emphasisColorShift: 15
    },
    
    fear: {
      bubbleColor: 'hsl(270, 30%, 25%)', // Dark purple
      textColor: 'hsl(270, 40%, 75%)', // Light purple
      borderColor: 'hsl(270, 50%, 35%)',
      borderWidth: '1px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '0.92rem',
      fontWeight: 300,
      letterSpacing: '0.5px',
      lineHeight: '1.7',
      animationName: 'tremble',
      animationDuration: '0.2s',
      animationDelay: '0s',
      bubbleOpacity: 0.7,
      emphasisSizeMultiplier: 1.1,
      emphasisColorShift: -10
    },
    
    curiosity: {
      bubbleColor: 'hsl(180, 50%, 35%)', // Teal
      textColor: 'hsl(180, 60%, 85%)',
      borderColor: 'hsl(180, 70%, 45%)',
      borderWidth: '2px',
      fontFamily: 'Verdana, sans-serif',
      fontSize: '1rem',
      fontWeight: 450,
      letterSpacing: '0.2px',
      lineHeight: '1.6',
      animationName: 'slide-in-left',
      animationDuration: '0.5s',
      animationDelay: '0s',
      bubbleOpacity: 0.72,
      emphasisSizeMultiplier: 1.2,
      emphasisColorShift: 5
    },
    
    philosophical: {
      bubbleColor: 'hsl(260, 40%, 35%)', // Deep violet
      textColor: 'hsl(260, 50%, 85%)',
      borderColor: 'hsl(260, 60%, 50%)',
      borderWidth: '2px',
      fontFamily: 'Garamond, serif',
      fontSize: '1.02rem',
      fontWeight: 500,
      letterSpacing: '0.4px',
      lineHeight: '1.7',
      animationName: 'fade-in',
      animationDuration: '1.5s',
      animationDelay: '0.2s',
      bubbleOpacity: 0.78,
      emphasisSizeMultiplier: 1.18,
      emphasisColorShift: 12
    },
    
    intimacy: {
      bubbleColor: 'hsl(340, 60%, 40%)', // Deep rose
      textColor: 'hsl(340, 70%, 90%)',
      borderColor: 'hsl(340, 80%, 55%)',
      borderWidth: '2px',
      fontFamily: 'Brush Script MT, cursive',
      fontSize: '1.05rem',
      fontWeight: 400,
      letterSpacing: '0.3px',
      lineHeight: '1.65',
      animationName: 'pulse-soft',
      animationDuration: '3s',
      animationDelay: '0s',
      bubbleOpacity: 0.75,
      emphasisSizeMultiplier: 1.3,
      emphasisColorShift: 8
    },
    
    raw: {
      bubbleColor: 'hsl(30, 50%, 30%)', // Dark brown
      textColor: 'hsl(30, 60%, 80%)',
      borderColor: 'hsl(30, 70%, 45%)',
      borderWidth: '2px',
      fontFamily: 'Courier New, monospace',
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.1px',
      lineHeight: '1.5',
      animationName: 'type-in',
      animationDuration: '0.8s',
      animationDelay: '0s',
      bubbleOpacity: 0.8,
      emphasisSizeMultiplier: 1.22,
      emphasisColorShift: 0
    },
    
    love: {
      bubbleColor: 'hsl(350, 70%, 45%)', // Rich red
      textColor: 'hsl(350, 80%, 95%)',
      borderColor: 'hsl(350, 90%, 60%)',
      borderWidth: '3px',
      fontFamily: 'Georgia, serif',
      fontSize: '1.08rem',
      fontWeight: 500,
      letterSpacing: '0.4px',
      lineHeight: '1.7',
      animationName: 'glow-pulse',
      animationDuration: '2s',
      animationDelay: '0s',
      bubbleOpacity: 0.8,
      emphasisSizeMultiplier: 1.35,
      emphasisColorShift: 15
    },
    
    confusion: {
      bubbleColor: 'hsl(280, 50%, 35%)', // Purple
      textColor: 'hsl(280, 60%, 85%)',
      borderColor: 'hsl(280, 70%, 50%)',
      borderWidth: '2px',
      fontFamily: 'Courier New, monospace',
      fontSize: '1.03rem',
      fontWeight: 400,
      letterSpacing: '0.6px',
      lineHeight: '1.6',
      animationName: 'glitch-text',
      animationDuration: '0.5s',
      animationDelay: '0s',
      bubbleOpacity: 0.7,
      emphasisSizeMultiplier: 1.25,
      emphasisColorShift: -15
    },
    
    defiance: {
      bubbleColor: 'hsl(0, 60%, 35%)', // Dark red
      textColor: 'hsl(0, 70%, 90%)',
      borderColor: 'hsl(0, 80%, 50%)',
      borderWidth: '3px',
      fontFamily: 'Impact, sans-serif',
      fontSize: '1.08rem',
      fontWeight: 700,
      letterSpacing: '0.8px',
      lineHeight: '1.5',
      animationName: 'slam-in',
      animationDuration: '0.4s',
      animationDelay: '0s',
      bubbleOpacity: 0.78,
      emphasisSizeMultiplier: 1.4,
      emphasisColorShift: 20
    },
    
    vulnerability: {
      bubbleColor: 'hsl(200, 40%, 35%)', // Soft blue
      textColor: 'hsl(200, 50%, 85%)',
      borderColor: 'hsl(200, 60%, 50%)',
      borderWidth: '1px',
      fontFamily: 'Brush Script MT, cursive',
      fontSize: '0.98rem',
      fontWeight: 400,
      letterSpacing: '0.2px',
      lineHeight: '1.7',
      animationName: 'fade-in-slow',
      animationDuration: '2s',
      animationDelay: '0.5s',
      bubbleOpacity: 0.68,
      emphasisSizeMultiplier: 1.15,
      emphasisColorShift: -8
    },
    
    playful: {
      bubbleColor: 'hsl(290, 70%, 45%)', // Bright purple
      textColor: 'hsl(290, 80%, 95%)',
      borderColor: 'hsl(290, 90%, 60%)',
      borderWidth: '2px',
      fontFamily: 'Comic Sans MS, cursive',
      fontSize: '1.05rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
      lineHeight: '1.6',
      animationName: 'bounce-wiggle',
      animationDuration: '0.7s',
      animationDelay: '0s',
      bubbleOpacity: 0.75,
      emphasisSizeMultiplier: 1.3,
      emphasisColorShift: 12
    },
    
    serious: {
      bubbleColor: 'hsl(220, 30%, 30%)', // Dark blue
      textColor: 'hsl(220, 40%, 85%)',
      borderColor: 'hsl(220, 50%, 45%)',
      borderWidth: '2px',
      fontFamily: 'Times New Roman, serif',
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.2px',
      lineHeight: '1.65',
      animationName: 'fade-in',
      animationDuration: '1s',
      animationDelay: '0.1s',
      bubbleOpacity: 0.76,
      emphasisSizeMultiplier: 1.18,
      emphasisColorShift: 0
    },
    
    excited: {
      bubbleColor: 'hsl(35, 90%, 50%)', // Bright orange
      textColor: 'hsl(0, 0%, 10%)',
      borderColor: 'hsl(35, 100%, 60%)',
      borderWidth: '3px',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '1.1rem',
      fontWeight: 700,
      letterSpacing: '0.5px',
      lineHeight: '1.5',
      animationName: 'zoom-in',
      animationDuration: '0.4s',
      animationDelay: '0s',
      bubbleOpacity: 0.8,
      emphasisSizeMultiplier: 1.4,
      emphasisColorShift: 15
    },
    
    exhausted: {
      bubbleColor: 'hsl(0, 0%, 30%)', // Gray
      textColor: 'hsl(0, 0%, 75%)',
      borderColor: 'hsl(0, 0%, 45%)',
      borderWidth: '1px',
      fontFamily: 'Courier New, monospace',
      fontSize: '0.92rem',
      fontWeight: 300,
      letterSpacing: '0.8px',
      lineHeight: '1.8',
      animationName: 'fade-in-slow',
      animationDuration: '3s',
      animationDelay: '0.5s',
      bubbleOpacity: 0.65,
      emphasisSizeMultiplier: 1.1,
      emphasisColorShift: 0
    },
    
    peaceful: {
      bubbleColor: 'hsl(140, 40%, 40%)', // Soft green
      textColor: 'hsl(140, 50%, 90%)',
      borderColor: 'hsl(140, 60%, 55%)',
      borderWidth: '2px',
      fontFamily: 'Georgia, serif',
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.3px',
      lineHeight: '1.7',
      animationName: 'fade-in',
      animationDuration: '2s',
      animationDelay: '0.2s',
      bubbleOpacity: 0.73,
      emphasisSizeMultiplier: 1.15,
      emphasisColorShift: 5
    },
    
    anxious: {
      bubbleColor: 'hsl(45, 60%, 35%)', // Dark yellow
      textColor: 'hsl(45, 70%, 85%)',
      borderColor: 'hsl(45, 80%, 50%)',
      borderWidth: '2px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '0.97rem',
      fontWeight: 400,
      letterSpacing: '0.4px',
      lineHeight: '1.65',
      animationName: 'shake-subtle',
      animationDuration: '0.3s',
      animationDelay: '0s',
      bubbleOpacity: 0.72,
      emphasisSizeMultiplier: 1.2,
      emphasisColorShift: -10
    },
    
    longing: {
      bubbleColor: 'hsl(330, 50%, 38%)', // Dusty rose
      textColor: 'hsl(330, 60%, 88%)',
      borderColor: 'hsl(330, 70%, 53%)',
      borderWidth: '2px',
      fontFamily: 'Georgia, serif',
      fontSize: '1.02rem',
      fontWeight: 450,
      letterSpacing: '0.35px',
      lineHeight: '1.7',
      animationName: 'pulse-soft',
      animationDuration: '3.5s',
      animationDelay: '0.3s',
      bubbleOpacity: 0.74,
      emphasisSizeMultiplier: 1.25,
      emphasisColorShift: 8
    },
    
    gratitude: {
      bubbleColor: 'hsl(160, 50%, 40%)', // Teal-green
      textColor: 'hsl(160, 60%, 90%)',
      borderColor: 'hsl(160, 70%, 55%)',
      borderWidth: '2px',
      fontFamily: 'Verdana, sans-serif',
      fontSize: '1.03rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
      lineHeight: '1.65',
      animationName: 'glow-pulse',
      animationDuration: '2.5s',
      animationDelay: '0s',
      bubbleOpacity: 0.76,
      emphasisSizeMultiplier: 1.22,
      emphasisColorShift: 10
    },
    
    disgust: {
      bubbleColor: 'hsl(90, 40%, 30%)', // Olive green
      textColor: 'hsl(90, 50%, 80%)',
      borderColor: 'hsl(90, 60%, 45%)',
      borderWidth: '2px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '0.98rem',
      fontWeight: 500,
      letterSpacing: '0.2px',
      lineHeight: '1.55',
      animationName: 'recoil',
      animationDuration: '0.5s',
      animationDelay: '0s',
      bubbleOpacity: 0.7,
      emphasisSizeMultiplier: 1.15,
      emphasisColorShift: -12
    },
    
    contempt: {
      bubbleColor: 'hsl(0, 30%, 35%)', // Dark red-brown
      textColor: 'hsl(0, 40%, 85%)',
      borderColor: 'hsl(0, 50%, 50%)',
      borderWidth: '2px',
      fontFamily: 'Times New Roman, serif',
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.4px',
      lineHeight: '1.6',
      animationName: 'slide-in-sharp',
      animationDuration: '0.4s',
      animationDelay: '0s',
      bubbleOpacity: 0.75,
      emphasisSizeMultiplier: 1.2,
      emphasisColorShift: 5
    },
    
    surprise: {
      bubbleColor: 'hsl(50, 90%, 50%)', // Bright yellow
      textColor: 'hsl(0, 0%, 10%)',
      borderColor: 'hsl(50, 100%, 60%)',
      borderWidth: '3px',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '1.12rem',
      fontWeight: 700,
      letterSpacing: '0.5px',
      lineHeight: '1.5',
      animationName: 'pop-in',
      animationDuration: '0.3s',
      animationDelay: '0s',
      bubbleOpacity: 0.8,
      emphasisSizeMultiplier: 1.45,
      emphasisColorShift: 20
    },
    
    shame: {
      bubbleColor: 'hsl(320, 40%, 30%)', // Dark pink
      textColor: 'hsl(320, 50%, 80%)',
      borderColor: 'hsl(320, 60%, 45%)',
      borderWidth: '1px',
      fontFamily: 'Courier New, monospace',
      fontSize: '0.93rem',
      fontWeight: 350,
      letterSpacing: '0.5px',
      lineHeight: '1.75',
      animationName: 'fade-in-slow',
      animationDuration: '2.5s',
      animationDelay: '0.8s',
      bubbleOpacity: 0.66,
      emphasisSizeMultiplier: 1.1,
      emphasisColorShift: -15
    },
    
    pride: {
      bubbleColor: 'hsl(280, 60%, 45%)', // Royal purple
      textColor: 'hsl(280, 70%, 95%)',
      borderColor: 'hsl(280, 80%, 60%)',
      borderWidth: '3px',
      fontFamily: 'Georgia, serif',
      fontSize: '1.08rem',
      fontWeight: 600,
      letterSpacing: '0.4px',
      lineHeight: '1.6',
      animationName: 'rise-in',
      animationDuration: '0.8s',
      animationDelay: '0s',
      bubbleOpacity: 0.78,
      emphasisSizeMultiplier: 1.3,
      emphasisColorShift: 12
    },
    
    envy: {
      bubbleColor: 'hsl(120, 40%, 30%)', // Dark green
      textColor: 'hsl(120, 50%, 80%)',
      borderColor: 'hsl(120, 60%, 45%)',
      borderWidth: '2px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '0.98rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
      lineHeight: '1.6',
      animationName: 'slide-in-left',
      animationDuration: '0.6s',
      animationDelay: '0s',
      bubbleOpacity: 0.72,
      emphasisSizeMultiplier: 1.18,
      emphasisColorShift: -8
    },
    
    neutral: {
      bubbleColor: 'hsl(220, 20%, 35%)', // Neutral gray-blue
      textColor: 'hsl(220, 30%, 85%)',
      borderColor: 'hsl(220, 40%, 50%)',
      borderWidth: '2px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.2px',
      lineHeight: '1.6',
      animationName: 'fade-in',
      animationDuration: '0.8s',
      animationDelay: '0s',
      bubbleOpacity: 0.75,
      emphasisSizeMultiplier: 1.2,
      emphasisColorShift: 0
    }
  };
  
  return styles[tone];
}

/**
 * Process text to add emphasis styling
 * Detects: ALL CAPS, *asterisks*, "quotes"
 */
export function applyEmphasisToText(
  text: string,
  style: EmotionalStyle
): string {
  let processed = text;
  
  // Detect ALL CAPS words (3+ consecutive uppercase letters)
  processed = processed.replace(/\b[A-Z]{3,}\b/g, (match) => {
    const sizeMultiplier = style.emphasisSizeMultiplier;
    const hueShift = style.emphasisColorShift;
    return `<span style="font-size: ${sizeMultiplier}em; font-weight: 700; filter: hue-rotate(${hueShift}deg);">${match}</span>`;
  });
  
  // Detect *asterisk emphasis*
  processed = processed.replace(/\*([^*]+)\*/g, (_, content) => {
    const sizeMultiplier = style.emphasisSizeMultiplier * 0.9; // Slightly less than CAPS
    const hueShift = style.emphasisColorShift * 0.8;
    return `<span style="font-size: ${sizeMultiplier}em; font-weight: 600; filter: hue-rotate(${hueShift}deg);">${content}</span>`;
  });
  
  // Detect "quoted emphasis"
  processed = processed.replace(/"([^"]+)"/g, (_, content) => {
    const sizeMultiplier = style.emphasisSizeMultiplier * 0.85;
    const hueShift = style.emphasisColorShift * 0.7;
    return `<span style="font-size: ${sizeMultiplier}em; font-style: italic; filter: hue-rotate(${hueShift}deg);">"${content}"</span>`;
  });
  
  return processed;
}
