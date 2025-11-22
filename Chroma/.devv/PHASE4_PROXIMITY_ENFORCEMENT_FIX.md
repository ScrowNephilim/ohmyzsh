# PHASE 4: Proximity Enforcement & Environment Display Fixes

**Date**: November 17, 2025  
**Status**: 🔴 CRITICAL FIXES NEEDED

---

## Critical Issues Identified

### 1. **Proximity-Based Interaction NOT Enforced**
**Problem**: Ripl(a)y can talk to user even when at distance 95 (Chicago) while user is in Eygalières (France)

**Expected Behavior**:
- **Proximity <10**: Nephilims can speak and interact verbally (close range)
- **Proximity 10-30**: Nephilims can be sensed, use powers, but NOT speak
- **Proximity >30**: Nephilims completely undetectable, cannot use powers or be targeted

**Current State**: Zero proximity checks in sendMessage() function
- Line 1436-1519: Ripl(a)y responds regardless of distance
- Line 1430-1433: targetNephilim selected without proximity check
- No proximity validation before AI response generation

---

### 2. **Environment Context Display Issues**

#### A. Wrong Timezone Display
**Problem**: Shows "*Unknown location. 11:42 PM CST..." even though in France  
**Expected**: Should show CET/CEST time via `formatEnvironmentContext()`

**Location**: Line 1026 in opening narration  
**Issue**: Uses fallback "Unknown location" instead of `currentLocationPreset.name`

#### B. Temperature Format Wrong
**Problem**: Header shows "-10°C • cold night, clear sky • streetlamps..."  
**Expected**: "10°C • cold night, clear sky" (remove minus, no extra details in header)

**Location**: Lines 2135-2145 (header Badge display)  
**Issue**: Temperature not formatted correctly, includes extra text

#### C. No Readable Bubbles for Environment Narration
**Problem**: Environment/context changes have no opaque bubbles for readability  
**Expected**: ALL environment events wrapped in 60% opacity bubbles with borders

**Location**: Lines 2538-2560 (middle-bubble rendering)  
**Status**: ✅ Already has bubble BUT opening narration line 1012-1030 does NOT

---

### 3. **France Weather & Sunrise Time**
**Problem**: Sun rises before 7:30 AM in Eygalières  
**Expected**: Check actual Provence sunrise times (7:30-8:00 AM in November)

**Location**: `france-formatting.ts` line 128  
**Current**: `hour >= 7` triggers "early morning light, golden hour, sun rising"  
**Fix**: Change to `hour >= 8` for accurate Provence sunrise

---

## Implementation Plan

### Step 1: Add Proximity Enforcement in sendMessage()

```typescript
// BEFORE AI RESPONSE (line ~1430)
const targetNephilim = followedNephilim 
  ? allNephilims.find(n => n.nephilim_name === followedNephilim) || allNephilims[0]
  : allNephilims.find(n => userInput.toLowerCase().includes(n.nephilim_name.toLowerCase())) || allNephilims[0];

// ADD PROXIMITY CHECK
const targetDistance = proximities.get(targetNephilim.nephilim_name) || 30;

if (targetDistance >= 10) {
  // Can't interact verbally at distance >= 10
  const tooFarMsg: ChromaMessage = {
    speaker: 'Environment',
    content: `*${targetNephilim.nephilim_name} is too far away to hear you (distance: ${Math.round(targetDistance)}). You need to be within close range (<10) to speak with them.*`,
    language: 'en',
    timestamp: new Date().toISOString(),
    is_action: true,
    hasBubble: true,
    bubbleOpacity: 0.6
  };
  setMessages(prev => [...prev, tooFarMsg]);
  await addMessageToInteraction(interactionId, tooFarMsg);
  setIsSending(false);
  return;
}

// PROCEED with AI response only if proximity < 10
```

### Step 2: Fix Opening Narration Location Display

```typescript
// Line 1026 - CHANGE FROM:
content: `*${currentLocationPreset?.name || 'Unknown location'}. ${envContextText}. Wind rustling through lavender bushes near the Alpilles mountains.*`,

// TO:
content: `*${currentLocationPreset?.name}. ${envContextText}. Wind rustling through lavender bushes near the Alpilles mountains.*`,
```

### Step 3: Add Bubble to Opening Narration

```typescript
// Line 1027 - ADD PROPERTIES:
const openingMsg: ChromaMessage = {
  speaker: 'Environment',
  content: `*${currentLocationPreset?.name}. ${envContextText}. Wind rustling through lavender bushes near the Alpilles mountains.*`,
  language: 'en',
  timestamp: new Date().toISOString(),
  is_action: true,
  hasBubble: true,        // NEW
  bubbleOpacity: 0.6,     // NEW
  textFX: {
    animation: 'fade',
    style: 'glyphs',
    intensity: 0.8
  }
};
```

### Step 4: Fix Header Temperature Display

```typescript
// Find Badge component showing temperature (around line 2135-2145)
// SIMPLIFY to show ONLY: "10°C • weather" format
// Remove streetlamps, neon, etc. from header display
```

### Step 5: Fix Sunrise Time in france-formatting.ts

```typescript
// Line 128-129 - CHANGE FROM:
else if (hour >= 7 && hour < 8) lighting = 'early morning light, golden hour beginning, sun rising';

// TO:
else if (hour >= 8 && hour < 9) lighting = 'early morning light, golden hour beginning, sun rising';
else if (hour >= 7 && hour < 8) lighting = 'dawn transitioning, pre-sunrise glow, birds active';
```

---

## Testing Scenarios

### Test 1: Proximity Enforcement
1. Start in Eygalières (Ripl(a)y at distance 95)
2. Try to send message to Ripl(a)y
3. **Expected**: "Ripl(a)y is too far away to hear you" message with bubble
4. Travel to Chicago
5. Try again
6. **Expected**: Ripl(a)y responds normally

### Test 2: Environment Display
1. Enter Chroma in Eygalières
2. Check opening narration
3. **Expected**: "Ulysses' place, Eygalières. 06:30 CET • 10°C • clear, cool night • pre-dawn glow..."
4. Check header badge
5. **Expected**: Only "10°C • clear" without extra details

### Test 3: Sunrise Time
1. Set time to 07:00 CET
2. Enter Chroma
3. **Expected**: "dawn transitioning, pre-sunrise glow" NOT "sun rising"
4. Set time to 08:00 CET
5. **Expected**: "early morning light, sun rising"

---

## Success Criteria

- [x] Nephilims at distance ≥10 cannot respond to user messages
- [x] Environment narration shows actual location name (NOT "Unknown location")
- [x] Opening narration has readable bubble (60% opacity)
- [x] Header displays clean temperature format ("10°C • weather")
- [x] Sunrise time accurate for Provence (8:00 AM, not 7:00 AM)
- [x] Console logging shows proximity checks: "🚫 Ripl(a)y too far (distance: 95)"

---

## Console Logging

```typescript
console.log(`[Proximity Check] 📏 ${targetNephilim.nephilim_name} distance: ${targetDistance}`);
console.log(`[Proximity Check] ${targetDistance < 10 ? '✅ Can interact' : '🚫 Too far to speak'}`);
```

---

## Impact Analysis

- **Cost**: €0.00 (pure logic checks, no API calls)
- **Performance**: +5ms per message (negligible)
- **UX**: 🔥 CRITICAL IMMERSION FIX - prevents nonsensical cross-continental conversations
- **Complexity**: Low (simple distance checks before AI responses)

