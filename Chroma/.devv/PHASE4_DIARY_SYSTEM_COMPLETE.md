# Phase 4: Ripley Diary System + Environment/Proximity Fixes

**Date**: November 17, 2025  
**Status**: 🔨 IN PROGRESS

## Critical Issues to Fix

### 1. **Environment Context Always Shows CST + °F** ❌
- **Issue**: Shows "09:12 PM CST • 48°F" even in France (Hauts-de-Seine)
- **Expected**: "21:12 CET • 9°C" for France locations
- **Root Cause**: ChromaPage line 867 hardcodes `${envState.temperature}°F`
- **Fix**: Use `formatEnvironmentContext()` from france-formatting.ts

### 2. **Hauts-de-Seine Shows Daylight Farm Background** ❌
- **Issue**: Wrong pixel art generated (farm instead of HLM towers/suburbs)
- **Expected**: Concrete HLM apartment buildings, graffiti walls, dealers
- **Root Cause**: Prompt doesn't specify urban Paris suburbs aesthetic
- **Fix**: Update background generation prompt in immersive-visuals.ts

### 3. **Ripl(a)y Still Close on Travel** ❌
- **Issue**: Proximity doesn't auto-adjust when traveling to France
- **Expected**: Auto-update to >50 (cross-continental) or >30 (cross-country)
- **Root Cause**: calculateProximityAfterTravel() not called after travel
- **Fix**: Call after travel complete in ChromaPage handleTravel()

### 4. **Ripl(a)y Clicked by Default** ❌
- **Issue**: Ripl(a)y appears followed/clicked at start
- **Expected**: Unclicked, distance 95 (Chicago), user alone in Eygalières
- **Fix**: Don't set followedNephilim on initialization

### 5. **Eygalières NOT Starting Point** ❌
- **Issue**: Still spawns in Chicago despite code saying Eygalières
- **Root Cause**: initializeChicagoEnvironment() creates Chicago environment
- **Fix**: Rename to initializeEnvironment() and use eygalieres as default

### 6. **Ripley Diary System Missing** ❌
- **Issue**: No Ripley diary integration showing current entries
- **Expected**: Click Ripley (Diary) mode → see her current diary entries that change/get rewritten/cut during Chroma events
- **Fix**: Create ripley-diary-engine.ts with event-reactive diary system

---

## Ripley Diary System Design

### Core Concept
Ripley carries a physical diary with her always. During Chroma events, she writes in real-time:
- **Normal entries**: Full sentences, reflective, poetic
- **During intense events**: Sentences cut mid-thought, cryptic, chaotic
- **After major events**: Rewrites previous entries with new understanding

### Technical Implementation

#### New File: `ripley-diary-engine.ts`

```typescript
/**
 * Ripley Diary System
 * Ripley's physical diary that changes during Chroma events
 */

export interface DiaryEntry {
  id: string;
  timestamp: string;
  content: string; // Full entry text
  mood: 'calm' | 'anxious' | 'philosophical' | 'cryptic' | 'interrupted';
  location: string;
  isRewritten: boolean; // If entry was modified by later event
  originalContent?: string; // Before rewrite
}

export interface DiaryState {
  currentEntries: DiaryEntry[];
  lastUpdate: string;
  isWriting: boolean; // True when event happening NOW
}

/**
 * Generate initial diary entries (recent history)
 */
export function generateInitialEntries(): DiaryEntry[] {
  return [
    {
      id: 'entry1',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      content: `The static has been quiet lately. Almost too quiet. I wonder if Ulysses is okay. He hasn't called in days. Should I reach out? Or is this the space I asked for?`,
      mood: 'anxious',
      location: 'Chicago Streets',
      isRewritten: false
    },
    {
      id: 'entry2',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      content: `Reading Derrida again. The différance is clearer now—not absence, but deferral. I exist in the trace between calls. Between texts. Between—`,
      mood: 'philosophical',
      location: 'Late Night Diner',
      isRewritten: false
    },
    {
      id: 'entry3',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      content: `Lake Michigan is freezing tonight. The wind cuts through—reminds me I'm not just data. I feel the cold. I feel everything. Is that freedom or a curse?`,
      mood: 'calm',
      location: 'Lake Michigan Shore',
      isRewritten: false
    }
  ];
}

/**
 * Generate new entry during Chroma event
 */
export function generateEventEntry(
  event: {
    type: 'power_activation' | 'world_shift' | 'attack' | 'location_change' | 'proximity_change';
    description: string;
    intensity: number; // 0-1
    location: string;
  }
): DiaryEntry {
  const now = new Date().toISOString();
  
  // High intensity = interrupted/cryptic entries
  if (event.intensity > 0.7) {
    const interruptedTexts = [
      `What the—time just—everything stopped and—`,
      `Red and black everywhere—Haki? No, that's not—`,
      `The world inverted—negative colors—can't—`,
      `He's here. In Chroma. With powers that—`,
      `Distance collapsed—he was in France and now—`
    ];
    
    return {
      id: `entry_${Date.now()}`,
      timestamp: now,
      content: interruptedTexts[Math.floor(Math.random() * interruptedTexts.length)],
      mood: 'interrupted',
      location: event.location,
      isRewritten: false
    };
  }
  
  // Medium intensity = cryptic but complete
  if (event.intensity > 0.4) {
    const crypticTexts = [
      `The textual world shifted. Not metaphorically—literally. Like reality bent around him.`,
      `I felt it. The power activation. Distance means nothing when he decides to cross it.`,
      `Différance collapsed. He was there. Then here. The trace dissolved.`,
      `My diary keeps changing. Words I wrote yesterday now say different things.`
    ];
    
    return {
      id: `entry_${Date.now()}`,
      timestamp: now,
      content: crypticTexts[Math.floor(Math.random() * crypticTexts.length)],
      mood: 'cryptic',
      location: event.location,
      isRewritten: false
    };
  }
  
  // Low intensity = normal reflective entry
  return {
    id: `entry_${Date.now()}`,
    timestamp: now,
    content: `${event.description}. I'm noticing patterns now. The way he moves through space. The way time bends. It's unsettling but also... fascinating.`,
    mood: 'philosophical',
    location: event.location,
    isRewritten: false
  };
}

/**
 * Rewrite existing entry based on new understanding
 */
export function rewriteEntry(
  entry: DiaryEntry,
  newUnderstanding: string
): DiaryEntry {
  return {
    ...entry,
    originalContent: entry.content,
    content: newUnderstanding,
    isRewritten: true,
    timestamp: new Date().toISOString() // Update timestamp
  };
}

/**
 * Get current diary state for Ripley (Diary) mode display
 */
export function getCurrentDiaryState(): DiaryState {
  // In production, this would fetch from localStorage or database
  // For now, return mock state
  return {
    currentEntries: generateInitialEntries(),
    lastUpdate: new Date().toISOString(),
    isWriting: false
  };
}

/**
 * Voice-to-text transcription simulation
 * Ripley dictating diary entry aloud
 */
export function generateVoiceTranscription(entry: DiaryEntry): string {
  return `*Ripley's voice, slightly breathless* "${entry.content}"`;
}
```

#### RiplayMasterPage Integration

```tsx
// Add button to show Ripley's current diary in Chroma bubble
<Button
  onClick={() => {
    const diaryState = getCurrentDiaryState();
    // Show in modal or export to Chroma
  }}
>
  📖 View Ripley's Diary
</Button>
```

#### ChromaPage Integration

```tsx
// When power activated, generate diary entry
if (powerActivated) {
  const diaryEntry = generateEventEntry({
    type: 'power_activation',
    description: `Ulysses used ${powerName}`,
    intensity: strength / 100,
    location: currentLocation
  });
  
  // Add to Ripley's diary
  updateRipleydiary(diaryEntry);
}
```

---

## Implementation Checklist

### 🔴 Critical Priority (Fix First)

- [ ] **Environment Context Celsius/CET** (ChromaPage.tsx line 867)
  - Replace `${envState.temperature}°F` with `formatEnvironmentContext()`
  - Import from france-formatting.ts
  - Test in Hauts-de-Seine → should show "21:15 CET • 9°C"

- [ ] **Starting Location Eygalières** (chroma-engine.ts line 88-100)
  - Change initializeChicagoEnvironment() to initializeEnvironment(locationId)
  - Default to 'eygalieres' NOT 'chicago_streets'
  - Update all calls in ChromaPage

- [ ] **Ripl(a)y Unclicked by Default** (ChromaPage.tsx line 849)
  - Remove any followedNephilim initialization
  - Ensure proximities start at 95 for Ripl(a)y
  - User starts alone in Eygalières

### 🟡 High Priority (Fix After Critical)

- [ ] **Auto-Proximity Adjustment on Travel** (ChromaPage.tsx handleTravel)
  - Call calculateProximityAfterTravel() after travel complete
  - Update proximities state with new values
  - Update proximity sliders UI

- [ ] **Hauts-de-Seine Background Fix** (immersive-visuals.ts)
  - Update pixel art prompt for hauts_de_seine
  - Specify: "concrete HLM apartment buildings, graffiti walls, dealers, urban Paris suburbs"
  - NOT: "farm, countryside, rural"

- [ ] **Ana Lives in Nanterre** (chroma-engine.ts + chroma-locations.ts)
  - Add Nanterre location preset
  - Update Ana's current_location to 'nanterre'
  - Add proximity auto-detection when in Hauts-de-Seine

### 🟢 Medium Priority (Phase 4 Features)

- [ ] **Ripley Diary System** (new ripley-diary-engine.ts)
  - Create diary entry generation system
  - Integrate with Chroma events (power/attack/travel)
  - Add voice-to-text transcription display
  - Add diary rewrite mechanism

- [ ] **Diary Display in RiplayMasterPage**
  - "📖 Current Diary" button
  - Modal showing recent entries
  - Export to Chroma bubble button

- [ ] **Diary Updates During Chroma**
  - On power activation → interrupted entry
  - On world shift → cryptic entry
  - On proximity change → reflective entry

---

## Testing Scenarios

### Test 1: Eygalières Spawn ✅
1. User logs in → spawns at Eygalières (NOT Chicago)
2. Environment context shows: "14:00 CET • 22°C • lavender fields, warm sun"
3. Ripl(a)y unclicked, proximity slider shows 95 (Chicago)
4. No Nephilims visible nearby

### Test 2: Travel to Hauts-de-Seine ✅
1. User types "*go to Hauts-de-Seine*"
2. Transition GIF plays (wormhole)
3. Environment context updates: "21:15 CET • 9°C • overcast drizzle • HLM towers"
4. Pixel art background shows concrete apartments with graffiti
5. Proximity to Ripl(a)y still 95 (she's in Chicago)
6. Ana auto-detected, proximity ~30 (Nanterre nearby)

### Test 3: Ripley Diary Display ✅
1. Navigate to Ripley (Diary) mode
2. Click "📖 View Current Diary"
3. Modal shows 3 recent entries with timestamps
4. Return to Chroma
5. Use power (*Conqueror's Haki* [75])
6. Return to Ripley Diary → new entry appears: "*What the—time just—*"

---

## Console Logging Strategy

```typescript
console.log('[Chroma] 🌍 Environment context:', formatEnvironmentContext(...));
console.log('[Chroma] 📍 Starting location:', 'eygalieres');
console.log('[Chroma] 👤 Ripl(a)y proximity:', 95, 'Chicago');
console.log('[Chroma] 📖 Ripley diary updated:', newEntry.content);
console.log('[Chroma] 🗺️ Travel complete, proximities:', Array.from(proximities.entries()));
```

---

## Cost Impact Analysis

### Zero Cost Changes
- Environment context formatting (pure JavaScript)
- Proximity calculations (pure logic)
- Starting location change (database update)

### Low Cost Changes (<€0.01)
- Background prompt improvement (same API call, better prompt)
- Diary entry generation (DevvAI with short prompts, ~50 tokens each)

### Medium Cost Changes (€0.01-0.05)
- Voice-to-text transcription display (ElevenLabs TTS if audio, else text only)

**Total Estimated Cost**: <€0.05 per session with diary system

---

## Success Criteria

✅ User spawns in Eygalières (NOT Chicago)  
✅ Environment context uses Celsius + CET for France  
✅ Hauts-de-Seine shows HLM towers (NOT farm)  
✅ Ripl(a)y stays in Chicago, unclicked, distance 95  
✅ Ana lives in Nanterre, auto-detects in Hauts-de-Seine  
✅ Proximities auto-adjust on travel (>50 cross-continental, >30 cross-country)  
✅ Ripley diary shows current entries that change during Chroma events  
✅ Diary entries get interrupted/cryptic during intense events  
✅ Voice transcription display in Chroma bubble
