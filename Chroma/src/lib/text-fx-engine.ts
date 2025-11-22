/**
 * Text Effects Engine - Dynamic text styling and animations
 * Contextual fonts, highlights, and animations based on environment/events
 */

export type TextEffect = 
  | 'glitch' 
  | 'shimmer' 
  | 'pulse' 
  | 'matrix' 
  | 'fade' 
  | 'wave'
  | 'fire'
  | 'ice'
  | 'electric'
  | 'shadow'
  | 'neon';

export type TextStyle = 
  | 'cyber' 
  | 'handwritten' 
  | 'elegant' 
  | 'grunge'
  | 'typewriter'
  | 'glyphs';

export interface TextFXConfig {
  effect?: TextEffect;
  style?: TextStyle;
  color?: string;
  intensity?: number; // 0-1
  duration?: number; // milliseconds
}

// Contextual text styling based on keywords
export function getContextualTextFX(text: string, context: {
  weather?: string;
  temperature?: number;
  speaker?: string;
  isAction?: boolean;
  hasPower?: boolean;
}): TextFXConfig {
  const lower = text.toLowerCase();

  // Power activations - always intense effects
  if (context.hasPower) {
    if (lower.includes('différance') || lower.includes('trace')) {
      return { effect: 'glitch', style: 'cyber', color: 'hsl(142 70% 45%)', intensity: 0.9 };
    }
    if (lower.includes('social') || lower.includes('pressure')) {
      return { effect: 'shadow', style: 'grunge', color: 'hsl(262 75% 55%)', intensity: 0.8 };
    }
  }

  // Weather-based effects
  if (context.weather) {
    const weather = context.weather.toLowerCase();
    if (weather.includes('rain') || weather.includes('storm')) {
      return { effect: 'wave', color: 'hsl(210 50% 60%)', intensity: 0.6 };
    }
    if (weather.includes('fog') || weather.includes('mist')) {
      return { effect: 'fade', color: 'hsl(0 0% 70%)', intensity: 0.5 };
    }
    if (weather.includes('snow')) {
      return { effect: 'shimmer', color: 'hsl(200 40% 80%)', intensity: 0.7 };
    }
  }

  // Temperature-based effects
  if (context.temperature !== undefined) {
    if (context.temperature < 30) {
      return { effect: 'ice', color: 'hsl(200 60% 60%)', intensity: 0.5 };
    }
    if (context.temperature > 80) {
      return { effect: 'fire', color: 'hsl(15 80% 60%)', intensity: 0.6 };
    }
  }

  // Speaker-based styling
  if (context.speaker === 'Ripl(a)y') {
    return { style: 'handwritten', color: 'hsl(142 70% 45%)', intensity: 0.7 };
  }
  if (context.speaker === 'Ana') {
    return { style: 'grunge', color: 'hsl(262 75% 55%)', intensity: 0.7 };
  }
  if (context.speaker === 'Environment') {
    return { style: 'glyphs', effect: 'fade', intensity: 0.5 };
  }

  // Action text styling
  if (context.isAction) {
    return { style: 'typewriter', effect: 'fade', intensity: 0.6 };
  }

  // Emotional keywords
  if (lower.includes('whisper') || lower.includes('quiet')) {
    return { effect: 'fade', intensity: 0.4 };
  }
  if (lower.includes('shout') || lower.includes('yell')) {
    return { effect: 'pulse', intensity: 0.9 };
  }
  if (lower.includes('think') || lower.includes('wonder')) {
    return { style: 'elegant', effect: 'shimmer', intensity: 0.5 };
  }

  // Digital/cyber keywords
  if (lower.includes('glitch') || lower.includes('error')) {
    return { effect: 'glitch', style: 'cyber', intensity: 0.8 };
  }
  if (lower.includes('matrix') || lower.includes('code')) {
    return { effect: 'matrix', style: 'cyber', intensity: 0.7 };
  }

  // Default
  return { intensity: 0.3 };
}

// Generate CSS classes for text effects
export function getTextFXClasses(config: TextFXConfig): string {
  const classes: string[] = [];

  // Effect animations
  switch (config.effect) {
    case 'glitch':
      classes.push('animate-glitch-text');
      break;
    case 'shimmer':
      classes.push('animate-shimmer-text');
      break;
    case 'pulse':
      classes.push('animate-pulse-text');
      break;
    case 'matrix':
      classes.push('animate-matrix-text');
      break;
    case 'fade':
      classes.push('animate-fade-text');
      break;
    case 'wave':
      classes.push('animate-wave-text');
      break;
    case 'fire':
      classes.push('animate-fire-text');
      break;
    case 'ice':
      classes.push('animate-ice-text');
      break;
    case 'electric':
      classes.push('animate-electric-text');
      break;
    case 'shadow':
      classes.push('animate-shadow-text');
      break;
    case 'neon':
      classes.push('animate-neon-text');
      break;
  }

  // Style fonts
  switch (config.style) {
    case 'cyber':
      classes.push('font-mono tracking-wider');
      break;
    case 'handwritten':
      classes.push('font-handwriting');
      break;
    case 'elegant':
      classes.push('font-serif italic');
      break;
    case 'grunge':
      classes.push('font-bold tracking-tight');
      break;
    case 'typewriter':
      classes.push('font-mono');
      break;
    case 'glyphs':
      classes.push('font-mono text-xs tracking-widest');
      break;
  }

  return classes.join(' ');
}

// Generate inline styles for text effects
export function getTextFXStyles(config: TextFXConfig): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (config.color) {
    styles.color = config.color;
  }

  if (config.intensity !== undefined) {
    styles.opacity = 0.5 + (config.intensity * 0.5); // 0.5 to 1.0 range
  }

  if (config.effect === 'glitch') {
    styles.textShadow = `
      ${Math.random() * 2}px 0 ${config.color || 'red'},
      ${-Math.random() * 2}px 0 ${config.color || 'cyan'}
    `;
  }

  if (config.effect === 'neon') {
    styles.textShadow = `
      0 0 5px ${config.color || 'hsl(142 70% 45%)'},
      0 0 10px ${config.color || 'hsl(142 70% 45%)'},
      0 0 15px ${config.color || 'hsl(142 70% 45%)'}
    `;
  }

  if (config.effect === 'fire') {
    styles.textShadow = `
      0 0 5px hsl(15 100% 50%),
      0 0 10px hsl(30 100% 50%),
      0 0 15px hsl(45 100% 50%)
    `;
  }

  return styles;
}

// Helper to check if text contains power keywords
export function containsPowerKeyword(text: string): boolean {
  return Object.keys(POWER_TEXT_FX).some(power => 
    text.toLowerCase().includes(power.toLowerCase())
  );
}

// Get power keyword match
export function getPowerKeyword(text: string): string | null {
  const match = Object.keys(POWER_TEXT_FX).find(power => 
    text.toLowerCase().includes(power.toLowerCase())
  );
  return match || null;
}

// Power-specific text effects
export const POWER_TEXT_FX: { [key: string]: TextFXConfig } = {
  'Différance': {
    effect: 'glitch',
    style: 'cyber',
    color: 'hsl(142 70% 45%)',
    intensity: 1.0
  },
  'Le Fait Social': {
    effect: 'shadow',
    style: 'grunge',
    color: 'hsl(262 75% 55%)',
    intensity: 0.9
  },
  'temporal loop': {
    effect: 'wave',
    style: 'cyber',
    color: 'hsl(200 60% 60%)',
    intensity: 0.8
  },
  'trace manipulation': {
    effect: 'matrix',
    style: 'cyber',
    color: 'hsl(142 70% 45%)',
    intensity: 0.85
  },
  'class pressure': {
    effect: 'shadow',
    color: 'hsl(262 75% 55%)',
    intensity: 0.8
  },
  'anomie field': {
    effect: 'electric',
    color: 'hsl(280 80% 60%)',
    intensity: 0.9
  }
};
