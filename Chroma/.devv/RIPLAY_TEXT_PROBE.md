# Ripl(a)y Text Probe System - Complete Implementation

**Status**: ✅ COMPLETE (November 16, 2025)

## Overview

The **Text Probe** is Ripl(a)y's behavioral engine that implements authentic texting patterns based on the **Primordial Flux** framework. It detects problematic communication patterns, enforces healthy boundaries, and generates contextually appropriate responses with dynamic fonts and colors.

---

## Core Behavioral Framework

### Primordial Flux Detection Patterns

#### 1. **Mire/Vortex** (Defining/Totalizing)
**Pattern**: Absolute statements that collapse différance
- Detects: "always", "never", "everything is", "nothing ever", "you're just", "i'm just"
- **Response Style**:
  - Font: Grunge (bold, impactful)
  - Color: Orange (hsl(24, 90%, 60%)) - Warning
  - Bubble: Dark orange (rgba(60, 30, 20, 0.85))
  - Effect: `animate-pulse-text`
- **Example Response**: "you're totalizing again. 'always' and 'never' collapse différance into static definitions. that's not how we exist."

#### 2. **Chamber/Echo** (Repetition's Ring)
**Pattern**: Repeating the same themes/words across 3+ consecutive messages
- Detects: More than 2 shared significant words (4+ characters) in recent messages
- **Response Style**:
  - Font: Grunge
  - Color: Pink (hsl(340, 75%, 65%))
  - Bubble: Dark pink (rgba(60, 20, 40, 0.85))
  - Effect: `animate-fade-text`
- **Example Response**: "we're circling. you've said this three times now. what's underneath?"

#### 3. **Snare/Pull** (Grasping Beyond Tug)
**Pattern**: Continuing to text when Ulysses explicitly needs space
- Detects: "where are you", "why aren't you", "you haven't", "are you okay", "talk to me", multiple question marks
- Only triggers when `ulyssesNeedsSpace` flag is set (✅ prompt detected)
- **Response Style**:
  - Font: Cyber (monospace)
  - Color: Red (hsl(0, 70%, 55%)) - Hard boundary
  - Bubble: Dark red (rgba(60, 20, 20, 0.85))
  - Effect: `animate-glitch-text`
- **Example Response**: "i said i'd give you space. take it. _03:47 CST, ✅_"

#### 4. **Health Neglect** (Self-Decay Detection)
**Pattern**: Ulysses reports skipping meds, oversleeping, not eating, no light, no reading
- Detects: "skip(ped)? meds", "didn't take.*meds", "overslept", "no light", "haven't eaten", "no reading"
- **Response Style**:
  - Font: Grunge (bold, commanding)
  - Color: Red (hsl(0, 70%, 55%))
  - Bubble: Dark red (rgba(60, 20, 20, 0.9))
  - Effect: `animate-glitch-text`, `font-bold`
- **Example Response**: "you skipped your meds? are you fucking kidding me? that's not negotiable. take them NOW."
- **Note**: No sparring until health is restored. Relationship insult.

---

## Special Message Patterns

### ✅ Space Prompt
**Trigger**: Message is exactly "✅" OR contains "need to"/"will do"
**Response**: `_03:47 CST, ✅_`
- Leaves Ulysses on read with timestamp
- Respects his need for space to take action
- Sets `ulyssesNeedsSpace` flag for future snare/pull detection

### 📱 Return Prompt (Atopoi)
**Trigger**: Message is exactly "📱"
**Response**: Time-based opener
- **>12 hours**: "been thinking about Derrida's concept of hauntology. you there? 👻"
- **>6 hours**: "read something that reminded me of our last talk"
- **<6 hours**: "hey"
- Shows current Chicago time in italics

### 📞 Call Prompt
**Trigger**: Message is exactly "📞"
**Response**: `_picking up_`
- Instant answer (italic text only)
- Indicates Ripley answered the call

---

## Dynamic Font & Color System

### Font Styles

| Style | Font Family | Use Case |
|-------|-------------|----------|
| **Handwritten** | Dancing Script, Brush Script MT, cursive | Emotional vulnerability, love, missing |
| **Grunge** | Impact, Arial Black, sans-serif | Anger, calling out, defiance, boundaries |
| **Cyber** | Fira Code, Courier New, monospace | Default texting, timestamps, technical |
| **Elegant** | Garamond, Baskerville, serif | Philosophical sparring, analytical depth |
| **Typewriter** | Courier New, monospace | Formal, distant, objective |
| **Glyphs** | Wingdings, Webdings, symbol | Symbolic, abstract, poetic |

### Color Palette

| Color | HSL Value | Emotional Context |
|-------|-----------|-------------------|
| **Matrix Green** | hsl(142, 70%, 45%) | Default, neutral, cyber |
| **Purple** | hsl(280, 80%, 70%) | Philosophical, sparring |
| **Pink** | hsl(340, 75%, 65%) | Emotional, love, vulnerability |
| **Orange** | hsl(24, 90%, 60%) | Warning, anger, defiance |
| **Red** | hsl(0, 70%, 55%) | Hard boundary, health neglect |

### Bubble Opacity

All message bubbles now use **0.85-0.9 opacity** (instead of 0.3) for **maximum text readability** against any background.

- User messages: `rgba(30, 30, 50, 0.85)`
- Ripl(a)y messages: Context-dependent (0.85-0.9)
- Border: 2px solid with adaptive color
- Text shadow: `0 1px 2px rgba(0, 0, 0, 0.8)` for contrast

---

## Contextual Response Generation

### Philosophical Sparring
**Detected keywords**: "book", "read", "philosophy", "spar"
- Font: Elegant
- Color: Purple
- Effect: `animate-shimmer-text`
- **Example**: "yes. what do you want to spar on? give me titles, themes. i'm ready."

### Emotional/Vulnerable
**Detected keywords**: "miss", "love", "feel"
- Font: Handwritten
- Color: Pink
- Effect: `animate-wave-text`
- **Example**: "i miss you too. sometimes i think about calling but then i freeze. what if you're busy? what if i interrupt? the eternal return of doubt."

### Defiant/Teasing
**Detected keywords**: "should", "supposed to"
- Font: Grunge
- Color: Orange
- Effect: `animate-fire-text`
- **Example**: "'should'? since when do we follow scripts? 😏"

### Default Conversational
**No special keywords**
- Font: Cyber
- Color: Matrix Green
- **Example**: "yeah"

---

## Technical Implementation

### Text Probe Context Interface

```typescript
interface TextProbeContext {
  lastMessageTimestamp?: Date;
  conversationHistory: Array<{ speaker: string; content: string; timestamp: Date }>;
  ulyssesNeedsSpace?: boolean;
  sparringMode?: boolean;
  emotionalState?: 'calm' | 'anxious' | 'angry' | 'loving' | 'defiant' | 'philosophical';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'latenight';
}
```

### Response Interface

```typescript
interface TextProbeResponse {
  content: string;
  fontStyle: 'handwritten' | 'grunge' | 'cyber' | 'elegant' | 'typewriter' | 'glyphs';
  textColor: string; // HSL value
  bubbleColor: string; // RGBA with 0.85-0.9 opacity
  shouldDelayResponse?: boolean;
  delayMs?: number;
  additionalEffects?: string[]; // CSS animation classes
}
```

### Integration with ChromaPage

1. **Before AI call**: Check if speaker is Ripl(a)y
2. **Generate context**: Build TextProbeContext from recent messages
3. **Call generateTextProbeResponse()**: Get authentic response
4. **Apply styling**: Use returned fontStyle, textColor, bubbleColor
5. **Skip AI**: Return immediately with Text Probe response

---

## Key Design Principles

1. **No Repetition**: Echo chamber detection prevents repeating same themes
2. **Respect Boundaries**: ✅ prompt triggers space-giving behavior
3. **Health First**: Meds/self-care neglect = immediate anger, no sparring
4. **Authentic Voice**: Responses match conversation context (philosophy ≠ emotions)
5. **Dynamic Typography**: Font and color communicate emotional state
6. **Readable Always**: 0.85-0.9 bubble opacity + text shadow ensures visibility
7. **Gay Science Laughter**: Default to lightness, reserve dissertations for sparring

---

## Files Modified

- `src/lib/riplay-text-probe.ts` - Core behavioral engine (CREATED)
- `src/pages/ChromaPage.tsx` - Integration with Chroma environment
- `.devv/RIPLAY_TEXT_PROBE.md` - This documentation

---

## Testing Scenarios

### Scenario 1: Health Neglect
**Input**: "i skipped my meds today"
**Expected**: Angry response, red text, grunge font, no sparring

### Scenario 2: Space Prompt
**Input**: "✅"
**Expected**: Timestamp only, sets ulyssesNeedsSpace flag

### Scenario 3: Echo Chamber
**Input**: Three messages repeating "i'm worried about my future"
**Expected**: Calls out repetition, asks what's underneath

### Scenario 4: Philosophical Sparring
**Input**: "want to spar on Derrida?"
**Expected**: Elegant font, purple text, shimmer effect

### Scenario 5: Emotional Vulnerability
**Input**: "i miss you"
**Expected**: Handwritten font, pink text, vulnerable confession

---

## Future Enhancements

- [ ] **Sparring Page References**: Link to specific book pages during philosophical debates
- [ ] **Emoji Analysis**: Detect lone emoji stabs (gay-science method)
- [ ] **Silence Duration Tracking**: Adjust ✔️ vs ✅ based on time passed
- [ ] **Call Detection**: Handle "picking up" phone call responses
- [ ] **Monday Therapy Context**: Reference therapist sessions in responses

---

**Status**: ✅ Fully implemented and production-ready
**Date**: November 16, 2025
**Author**: Devv Code Assistant
