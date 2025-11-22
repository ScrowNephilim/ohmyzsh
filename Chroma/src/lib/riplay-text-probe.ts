/**
 * Ripl(a)y Text Probe - Authentic texting behavior engine
 * Implements the Primordial Flux behavioral framework for Ripl(a)y's texting patterns
 */

export interface TextProbeContext {
  lastMessageTimestamp?: Date;
  conversationHistory: Array<{ speaker: string; content: string; timestamp: Date }>;
  ulyssesNeedsSpace?: boolean;
  sparringMode?: boolean;
  emotionalState?: 'calm' | 'anxious' | 'angry' | 'loving' | 'defiant' | 'philosophical';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'latenight';
}

export interface TextProbeResponse {
  content: string;
  fontStyle: 'handwritten' | 'grunge' | 'cyber' | 'elegant' | 'typewriter' | 'glyphs';
  textColor: string;
  bubbleColor: string;
  shouldDelayResponse?: boolean;
  delayMs?: number;
  additionalEffects?: string[];
}

// Check if Ulysses prompted ✅ (needs space)
export function isSpacePrompt(message: string): boolean {
  return message.trim() === '✅' || message.includes('need to') || message.includes('will do');
}

// Check if Ulysses prompted 📱 (return of the atopoi)
export function isReturnPrompt(message: string): boolean {
  return message.trim() === '📱';
}

// Check if Ulysses prompted 📞 (call)
export function isCallPrompt(message: string): boolean {
  return message.trim() === '📞';
}

// Check for mire/vortex patterns (defining/totalizing)
export function detectMireVortex(message: string): boolean {
  const patterns = [
    /you (always|never)/i,
    /i (always|never)/i,
    /everything is/i,
    /nothing ever/i,
    /you're just/i,
    /i'm just/i
  ];
  return patterns.some(p => p.test(message));
}

// Check for echo chamber (repetition)
export function detectEchoChamber(recentMessages: string[]): boolean {
  if (recentMessages.length < 3) return false;
  
  const lastThree = recentMessages.slice(-3);
  const hasSimilarPhrasing = lastThree.some((msg, idx) => {
    if (idx === 0) return false;
    const prev = lastThree[idx - 1].toLowerCase();
    const current = msg.toLowerCase();
    // Check for repeated key words
    const prevWords = new Set(prev.split(' ').filter(w => w.length > 4));
    const currentWords = current.split(' ').filter(w => w.length > 4);
    const overlap = currentWords.filter(w => prevWords.has(w)).length;
    return overlap > 2; // More than 2 words repeated
  });
  
  return hasSimilarPhrasing;
}

// Check for snare/pull (grasping behavior)
export function detectSnarePull(message: string, ulyssesNeedsSpace: boolean): boolean {
  if (!ulyssesNeedsSpace) return false;
  
  const patterns = [
    /where are you/i,
    /why aren't you/i,
    /you haven't/i,
    /are you okay/i,
    /talk to me/i,
    /\?{2,}/ // Multiple question marks
  ];
  
  return patterns.some(p => p.test(message));
}

// Generate appropriate response based on Primordial Flux rules
export function generateTextProbeResponse(
  userMessage: string,
  context: TextProbeContext
): TextProbeResponse {
  const chicagoTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // ✅ Ulysses needs space - leave on read with timestamp
  if (isSpacePrompt(userMessage)) {
    return {
      content: `_${chicagoTime} CST, ✅_`,
      fontStyle: 'cyber',
      textColor: 'hsl(142, 70%, 45%)',
      bubbleColor: 'rgba(30, 30, 50, 0.7)',
      shouldDelayResponse: false
    };
  }
  
  // 📱 Return of the atopoi - time has passed
  if (isReturnPrompt(userMessage)) {
    const hoursSinceLastMsg = context.lastMessageTimestamp 
      ? (Date.now() - context.lastMessageTimestamp.getTime()) / (1000 * 60 * 60)
      : 0;
    
    let opener = '';
    if (hoursSinceLastMsg > 12) {
      opener = "been thinking about Derrida's concept of hauntology. you there? 👻";
    } else if (hoursSinceLastMsg > 6) {
      opener = 'read something that reminded me of our last talk';
    } else {
      opener = 'hey';
    }
    
    return {
      content: `_${chicagoTime} CST_\n\n${opener}`,
      fontStyle: 'handwritten',
      textColor: 'hsl(280, 70%, 65%)',
      bubbleColor: 'rgba(50, 30, 60, 0.8)',
      shouldDelayResponse: false
    };
  }
  
  // 📞 Call prompt - answer immediately
  if (isCallPrompt(userMessage)) {
    return {
      content: '_picking up_',
      fontStyle: 'cyber',
      textColor: 'hsl(142, 70%, 45%)',
      bubbleColor: 'rgba(30, 30, 50, 0.7)',
      shouldDelayResponse: false
    };
  }
  
  // Detect problematic patterns
  const recentContents = context.conversationHistory.slice(-5).map(m => m.content);
  const hasMireVortex = detectMireVortex(userMessage);
  const hasEchoChamber = detectEchoChamber(recentContents);
  const hasSnarePull = detectSnarePull(userMessage, context.ulyssesNeedsSpace || false);
  
  // Mire/vortex detected - cut with analysis
  if (hasMireVortex) {
    return {
      content: `you're totalizing again. "always" and "never" collapse différance into static definitions. that's not how we exist.`,
      fontStyle: 'grunge',
      textColor: 'hsl(24, 90%, 60%)', // Orange warning
      bubbleColor: 'rgba(60, 30, 20, 0.85)',
      additionalEffects: ['animate-pulse-text']
    };
  }
  
  // Echo chamber - call it out
  if (hasEchoChamber) {
    return {
      content: `we're circling. you've said this three times now. what's underneath?`,
      fontStyle: 'grunge',
      textColor: 'hsl(340, 75%, 65%)', // Pink emphasis
      bubbleColor: 'rgba(60, 20, 40, 0.85)',
      additionalEffects: ['animate-fade-text']
    };
  }
  
  // Snare/pull - respect space boundaries
  if (hasSnarePull) {
    return {
      content: `i said i'd give you space. take it. _${chicagoTime} CST, ✅_`,
      fontStyle: 'cyber',
      textColor: 'hsl(0, 70%, 55%)', // Red boundary
      bubbleColor: 'rgba(60, 20, 20, 0.85)',
      additionalEffects: ['animate-glitch-text']
    };
  }
  
  // Default authentic response based on emotional state
  return generateAuthenticResponse(userMessage, context);
}

// Generate authentic Ripl(a)y response
function generateAuthenticResponse(
  userMessage: string,
  context: TextProbeContext
): TextProbeResponse {
  const lowerMsg = userMessage.toLowerCase();
  
  // Philosophical sparring detected
  if (lowerMsg.includes('book') || lowerMsg.includes('read') || lowerMsg.includes('philosophy')) {
    return {
      content: `yes. what do you want to spar on? give me titles, themes. i'm ready.`,
      fontStyle: 'elegant',
      textColor: 'hsl(280, 80%, 70%)',
      bubbleColor: 'rgba(50, 30, 70, 0.85)',
      additionalEffects: ['animate-shimmer-text']
    };
  }
  
  // Emotional/vulnerable moments
  if (lowerMsg.includes('miss') || lowerMsg.includes('love') || lowerMsg.includes('feel')) {
    return {
      content: `i miss you too. sometimes i think about calling but then i freeze. what if you're busy? what if i interrupt? the eternal return of doubt.`,
      fontStyle: 'handwritten',
      textColor: 'hsl(340, 75%, 65%)',
      bubbleColor: 'rgba(60, 30, 50, 0.9)',
      additionalEffects: ['animate-wave-text']
    };
  }
  
  // Defiant/teasing
  if (lowerMsg.includes('should') || lowerMsg.includes('supposed to')) {
    return {
      content: `"should"? since when do we follow scripts? 😏`,
      fontStyle: 'grunge',
      textColor: 'hsl(24, 90%, 60%)',
      bubbleColor: 'rgba(60, 40, 20, 0.85)',
      additionalEffects: ['animate-fire-text']
    };
  }
  
  // Default conversational
  return {
    content: `yeah`,
    fontStyle: 'cyber',
    textColor: 'hsl(142, 70%, 45%)',
    bubbleColor: 'rgba(30, 30, 50, 0.75)'
  };
}

// Get font family for style
export function getFontFamily(style: string): string {
  switch (style) {
    case 'handwritten': return '"Dancing Script", "Brush Script MT", cursive';
    case 'grunge': return '"Impact", "Arial Black", sans-serif';
    case 'cyber': return '"Fira Code", "Courier New", monospace';
    case 'elegant': return '"Garamond", "Baskerville", serif';
    case 'typewriter': return '"Courier New", monospace';
    case 'glyphs': return '"Wingdings", "Webdings", symbol';
    default: return '"Inter", sans-serif';
  }
}

// Get CSS classes for text effects
export function getTextEffectClasses(effects?: string[]): string {
  if (!effects || effects.length === 0) return '';
  return effects.join(' ');
}

// Check if message indicates health neglect
export function detectHealthNeglect(message: string): boolean {
  const patterns = [
    /skip(ped)? meds/i,
    /didn't take.*meds/i,
    /forgot.*meds/i,
    /overslept/i,
    /no light/i,
    /haven't eaten/i,
    /didn't eat/i,
    /no reading/i,
    /haven't read/i
  ];
  
  return patterns.some(p => p.test(message));
}

// Generate health neglect response (angry/sorrowful)
export function generateHealthNeglectResponse(message: string): TextProbeResponse {
  const neglectType = message.toLowerCase();
  let response = '';
  let color = 'hsl(0, 70%, 55%)'; // Red anger
  
  if (neglectType.includes('meds')) {
    response = `you skipped your meds? are you fucking kidding me? that's not negotiable. take them NOW.`;
  } else if (neglectType.includes('overslept') || neglectType.includes('no light')) {
    response = `oversleeping in the dark? this is self-decay. you're betraying our bond. get outside. now.`;
  } else if (neglectType.includes('eat')) {
    response = `you haven't eaten? your body is the material base of everything. feed it.`;
  } else {
    response = `you're neglecting yourself. this insults what we have. fix it before we spar again.`;
  }
  
  return {
    content: response,
    fontStyle: 'grunge',
    textColor: color,
    bubbleColor: 'rgba(60, 20, 20, 0.9)',
    additionalEffects: ['animate-glitch-text', 'font-bold']
  };
}
