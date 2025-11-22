/**
 * Nephilim Name Styling System
 * Bold serif font with unique colors and opaque bubble backgrounds
 */

export interface NephilimNameStyle {
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  bubbleOpacity: number;
}

// Nephilim-specific color mapping (unique per character)
const NEPHILIM_COLORS: Record<string, string> = {
  'ripl(a)y': '#FF69B4', // Hot pink
  'ripley': '#FF69B4', // Hot pink (same as ripl(a)y)
  'ana': '#9370DB', // Medium purple
  'ana petrovic': '#9370DB', // Medium purple
  'default': '#87CEEB' // Sky blue for unknown Nephilims
};

/**
 * Get color for a Nephilim by name
 */
export function getNephilimColor(nephilimName: string): string {
  const normalized = nephilimName.toLowerCase();
  
  // Check exact matches first
  if (NEPHILIM_COLORS[normalized]) {
    return NEPHILIM_COLORS[normalized];
  }
  
  // Check partial matches
  for (const [key, color] of Object.entries(NEPHILIM_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return color;
    }
  }
  
  return NEPHILIM_COLORS.default;
}

/**
 * Convert regular text to bold serif Unicode characters
 * Uses Mathematical Bold Italic Unicode range
 */
export function toBoldSerifFont(text: string): string {
  const boldSerifMap: Record<string, string> = {
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆',
    'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍',
    'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔',
    'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠',
    'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧',
    'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮',
    'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
  };

  return text.split('').map(char => boldSerifMap[char] || char).join('');
}

/**
 * Get complete styling for Nephilim name display
 */
export function getNephilimNameStyle(nephilimName: string): NephilimNameStyle {
  const color = getNephilimColor(nephilimName);
  
  return {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: '700', // Bold
    color,
    backgroundColor: `${color}20`, // 20% opacity of the color
    bubbleOpacity: 0.85
  };
}

/**
 * Apply bold serif transformation to Nephilim name
 * Example: "Ripl(a)y" → "𝐑𝐢𝐩𝐥(𝐚)𝐲"
 */
export function formatNephilimName(nephilimName: string): string {
  return toBoldSerifFont(nephilimName);
}

/**
 * Get style object for React inline styles
 */
export function getNephilimNameInlineStyle(nephilimName: string): React.CSSProperties {
  const style = getNephilimNameStyle(nephilimName);
  
  return {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight as any,
    color: style.color,
    backgroundColor: style.backgroundColor,
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    display: 'inline-block',
    opacity: style.bubbleOpacity
  };
}

/**
 * Get style for language indicator (en, fr, etc.)
 * Smaller but same treatment
 */
export function getLanguageIndicatorStyle(language: string): React.CSSProperties {
  return {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: '700',
    fontSize: '0.65rem',
    color: '#87CEEB', // Sky blue
    backgroundColor: '#87CEEB20',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    display: 'inline-block',
    opacity: 0.8
  };
}
