# Chroma Action Suggestions System - Complete Implementation

**Status**: ✅ COMPLETE (November 16, 2025)

## Overview

The **Action Suggestions System** provides **context-aware clickable action bubbles** above the chat input, suggesting powers, travels, follows, and environmental interactions based on current state.

---

## Core Features

### 1. **Dynamic Suggestion Generation**
**Triggers**:
- After initialization (6 initial suggestions)
- After user sends message (updated based on new context)
- After Ripl(a)y responds (updated with Text Probe context)
- After travel (new location-specific suggestions)

**Max Suggestions**: 6 at a time (prevents UI clutter)

### 2. **Suggestion Types**

#### **Power Suggestions** ⚡
- **Use [Power Name]**: Activate Nephilim's power on environment
- **[Power] → [Nephilim]**: Target another Nephilim (if 2+ present)
- **Transform Environment** 🌀: Use power on surroundings

**Example**: "⚡ Use Différance", "⚡ Différance → Ana", "🌀 Transform Environment"

#### **Follow Suggestions** 👤
- **Follow [Nephilim]**: Stay close to specific Nephilim
- Appears for each active Nephilim
- Toggleable (click again to unfollow)

**Example**: "👤 Follow Ripl(a)y", "👤 Follow Ana"

#### **Travel Suggestions** 🌍
- **Go to [Location]**: Travel to nearby destination
- Prioritizes same type (e.g., street → street)
- Shows 3 nearest destinations
- **Random Location** 🎲: Warp to unexpected place

**Example**: "🌍 Go to Lake Michigan Shore", "🎲 Random Location"

#### **Interaction Suggestions** ☔
- **Context-based**: Weather, conversation topics, environment events
- **Rain**: "☔ Find Shelter"
- **Snow**: "❄️ Play in Snow"
- **Philosophy talk**: "📚 Suggest Sparring"

---

## Suggestion Button Design

### Visual Styling
```tsx
<Button
  size="sm"
  variant="outline"
  className="text-xs hover:scale-105 transition-transform"
  style={{
    backgroundColor: `${color}/10`,
    borderColor: `${color}/30`,
    color: color,
    transition: 'all 0.2s ease'
  }}
  onClick={() => setInputMessage(suggestion.command)}
  disabled={!isActionAvailable(suggestion, context)}
>
  {suggestion.icon && <span className="mr-1">{suggestion.icon}</span>}
  {suggestion.label}
</Button>
```

### Color Coding

| Type | Color | HSL Value |
|------|-------|-----------|
| Power | Purple | hsl(280, 80%, 70%) |
| Power (Target) | Pink | hsl(340, 75%, 65%) |
| Power (Environment) | Orange | hsl(24, 90%, 60%) |
| Follow | Matrix Green | hsl(142, 70%, 45%) |
| Travel | Blue | hsl(200, 70%, 55%) |
| Interact (Rain) | Blue | hsl(210, 70%, 60%) |
| Interact (Snow) | Light Blue | hsl(200, 80%, 70%) |
| Interact (Philosophy) | Purple | hsl(280, 80%, 70%) |
| Random | Magenta | hsl(300, 70%, 60%) |

---

## Action Availability

### Power Availability
**Rule**: Can't use same power twice in a row
**Check**: `!activePowers.includes(powerName)`

### Follow Availability
**Rule**: Can't follow if already following this Nephilim
**Check**: `followedNephilim !== nephilimName`

### All Other Actions
**Rule**: Always available

---

## Click Behavior

### Auto-Fill Input
**On Click**: Sets `inputMessage` to `suggestion.command`
**User**: Presses Enter to execute
**Example**: Click "⚡ Use Différance" → Input becomes "use Différance"

### Follow Action
**Special Case**: Follow suggestions are handled directly in Nephilim badges
**Badge Click**: Toggles follow state
**Not Handled**: By action suggestion system

---

## Contextual Suggestion Logic

### Weather-Based

```typescript
if (weather.includes('rain') || weather.includes('storm')) {
  suggestions.push({
    type: 'interact',
    label: '☔ Find Shelter',
    description: 'Get out of the rain',
    command: 'find shelter from rain'
  });
}

if (weather.includes('snow')) {
  suggestions.push({
    type: 'interact',
    label: '❄️ Play in Snow',
    description: 'Embrace the cold',
    command: 'play in snow'
  });
}
```

### Conversation-Based

```typescript
if (conversationContext.some(msg => 
  msg.includes('philosophy') || msg.includes('book')
)) {
  suggestions.push({
    type: 'interact',
    label: '📚 Suggest Sparring',
    description: 'Start philosophical debate',
    command: 'let\'s spar on philosophy'
  });
}
```

### Location-Based

```typescript
const nearbyDestinations = getSuggestedDestinations(currentLocation);
// Prioritizes same type first
// E.g., if in street → suggests other streets first
```

---

## UI Layout

### Position
**Location**: Above chat input, below messages
**Spacing**: `mt-6` (24px margin-top from messages)
**Wrapping**: `flex flex-wrap gap-2 justify-center`

### Conditional Display
**Show When**:
- `actionSuggestions.length > 0`
- `!isSending` (hidden while sending message)

**Hide When**:
- No suggestions generated
- Message is being sent
- Dev mode (suggestions shown but clicks disabled)

---

## Integration with Other Systems

### Text Probe (Ripl(a)y)
After Text Probe response, generates new suggestions based on:
- Emotional state detected
- Health neglect detected
- Sparring mode triggered

### Travel System
After travel, generates location-specific suggestions:
- Nearby destinations of same type
- Environment-specific interactions
- Nephilims likely to appear in new location

### Power System
After power activation:
- Adds power name to `activePowers` array
- Disables same power suggestion temporarily
- Suggests targeting different Nephilims

### Follow System
After following Nephilim:
- Updates `followedNephilim` state
- Badge shows User icon when followed
- Unfollow toast: "Stopped Following"

---

## Example Suggestion Sets

### Chicago Streets (Default)
1. ⚡ Use Différance
2. 👤 Follow Ripl(a)y
3. 🌍 Go to Lake Michigan Shore
4. 🌍 Go to Late Night Diner
5. 🌍 Go to Underground Club
6. 🎲 Random Location

### Rainy Night
1. ⚡ Use Différance
2. ☔ Find Shelter
3. 🌍 Go to Late Night Diner
4. 👤 Follow Ripl(a)y
5. 🎲 Random Location

### Philosophical Conversation
1. 📚 Suggest Sparring
2. ⚡ Use Différance
3. 🌍 Go to Late Night Diner (quiet space)
4. 👤 Follow Ripl(a)y
5. 🎲 Random Location

### Two Nephilims Present
1. ⚡ Use Différance
2. ⚡ Différance → Ana
3. 🌀 Transform Environment
4. 👤 Follow Ripl(a)y
5. 👤 Follow Ana
6. 🎲 Random Location

---

## Technical Implementation

### Suggestion Generation Function

```typescript
export function generateActionSuggestions(
  envState: EnvironmentState,
  activeNephilims: NephilimCharacter[],
  currentLocation: string,
  conversationContext: string[]
): ActionSuggestion[]
```

### Suggestion Interface

```typescript
export interface ActionSuggestion {
  type: 'power' | 'travel' | 'interact' | 'follow';
  label: string;          // Display text (e.g., "⚡ Use Différance")
  description: string;    // Hover tooltip
  command?: string;       // Auto-fills input
  icon?: string;          // Emoji icon
  color?: string;         // HSL color value
}
```

### Availability Check Function

```typescript
export function isActionAvailable(
  suggestion: ActionSuggestion, 
  context: {
    activePowers: string[];
    followedNephilim: string | null;
  }
): boolean
```

---

## State Management

### New State Variables
```typescript
const [actionSuggestions, setActionSuggestions] = useState<ActionSuggestion[]>([]);
const [activePowers, setActivePowers] = useState<string[]>([]);
```

### Update Triggers
- **After initializeChroma()**: Initial suggestions
- **After sendMessage()**: Context-updated suggestions
- **After handleTravel()**: Location-specific suggestions
- **After power activation**: Disable used power

---

## Files Modified

- `src/lib/chroma-action-suggestions.ts` - Core suggestion engine (CREATED)
- `src/pages/ChromaPage.tsx` - UI integration
- `.devv/CHROMA_ACTION_SUGGESTIONS.md` - This documentation

---

## Future Enhancements

- [ ] **Custom Suggestions**: User-defined quick actions
- [ ] **Suggestion History**: Track most-used actions
- [ ] **Smart Prioritization**: ML-based suggestion ordering
- [ ] **Combo Suggestions**: "Use power THEN travel"
- [ ] **Voice Activation**: Say suggestion label to execute
- [ ] **Keyboard Shortcuts**: Number keys 1-6 for quick selection

---

**Status**: ✅ Fully implemented and production-ready
**Date**: November 16, 2025
**Author**: Devv Code Assistant
