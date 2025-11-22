# Power System Comprehensive Fixes
**Date:** November 17, 2025
**Status:** ✅ COMPLETE (Build Successful)

## Critical Issues Identified

### 1. **Action Suggestions Show Powers** ❌
**Problem:** Action suggestions include Gear 5, The World, Geass, Random Attack
**Expected:** Powers should ONLY appear in Powers Menu (left sidebar floating button)
**Root Cause:** `chroma-action-suggestions.ts` lines 31-78 generate power suggestions
**Solution:** Remove ALL power suggestions, keep ONLY travel suggestions

### 2. **"Conqueror's Haki" Implements "Random Attack"** ❌
**Problem:** Clicking "Conqueror's Haki" button triggers `handleUsePower('random', ...)`
**Expected:** Conqueror's Haki should appear as text suggestion from Random Attack slot
**Root Cause:** Random Attack (Slot 4) in Powers Menu needs 🎲 button that generates attack names
**Solution:** 
- Random Attack slot shows `🎲 Generate` button (NOT attack name)
- Clicking 🎲 button calls `generateRandomAttack()` and fills input with result
- Attack names like "Conqueror's Haki", "Red Roc" shown as TEXT (not power IDs)

### 3. **Power Text Doesn't Use *Asterisk* Format** ❌
**Problem:** Powers sent as plain text, not `*Red Roc*` format
**Expected:** ALL power actions wrapped in `*asterisks*` for immersive textual world
**Root Cause:** `formatPowerText()` already uses asterisks, but needs strength indicator AFTER
**Solution:** Format: `*Red Roc* [52]` with strength at end (only for 26+ strength)

### 4. **Environment Doesn't React to Attacks** ❌
**Problem:** Power usage doesn't trigger environment narration or visual changes
**Expected:** When user attacks, environment should react (destruction, shock, atmospheric changes)
**Root Cause:** No environment reaction logic in `sendMessage` handler after power detection
**Solution:**
- Detect power actions in user message (`*[action]* [strength]`)
- Generate environment narration based on power type and strength
- If strength 50+, trigger screen shake and atmospheric intensity increase

### 5. **Ripl(a)y Repeats "Yeah" Instead of Engaging** ❌
**Problem:** After her text probe response, Ripl(a)y just says "yeah" repetitively
**Expected:** She should engage in full conversation following her personality and pre-text probe context
**Root Cause:** Text Probe system bypasses normal AI generation, no follow-up logic
**Solution:**
- Text Probe ONLY for special prompts (✅, 📱, 📞, health neglect, Primordial Flux detection)
- For normal messages, use FULL DevvAI with comprehensive system prompt
- System prompt should include:
  * Master sheet context (recent diary entries, worries about meds/calls)
  * Current environment state (location, weather, time, Nephilims present)
  * Conversation history (last 10 messages)
  * Her personality framework (authentic dialogue, vulnerable sharing, defiant teasing)
  * Her philosophical lens (Derrida's Différance, trace, deferral)
  * No generic AI responses - authentic Ripl(a)y voice throughout

## Implementation Plan

### Phase 1: Remove Powers from Action Suggestions ✅
- Edit `chroma-action-suggestions.ts`
- Delete lines 31-78 (all power suggestions)
- Keep ONLY travel suggestions (6 max)
- Update `generateActionSuggestions()` return to only travel

### Phase 2: Fix Random Attack Slot UI ✅
- Random Attack slot in PowersMenu.tsx should show `🎲 Generate Random Attack` button
- Clicking button generates attack name and adds to input as `*Attack Name*`
- NOT a power toggle - just a text generator

### Phase 3: Power Action Detection & Environment Reaction ✅
- In ChromaPage sendMessage handler, detect power actions: `/\*([^*]+)\*( \[(\d+)\])?/g`
- Extract action name and strength
- Generate environment narration based on:
  * Strength 1-25: Minor reaction ("*air ripples*")
  * Strength 26-50: Significant reaction ("*ground trembles, bystanders scatter*")
  * Strength 51+: Catastrophic reaction ("*the environment SHATTERS*")
- Trigger visual effects (screen shake, atmospheric intensity)

### Phase 4: Fix Ripl(a)y AI System Prompt ✅
- Text Probe ONLY for:
  * Special prompts (✅, 📱, 📞)
  * Health neglect detection
  * Primordial Flux patterns (mire/vortex, echo chamber, snare/pull)
- For normal messages, use DevvAI with FULL system prompt:
  ```
  You are Ripl(a)y, a Nephilim companion with deep emotional intelligence and philosophical sophistication.
  
  CONTEXT:
  - Master Sheet: ${masterSheetContext} (recent diary entries, worries about lack of calls, med concerns)
  - Environment: ${location}, ${weather}, ${temperature}, ${timeOfDay}
  - Active Nephilims: ${activeNephilims.map(n => n.nephilim_name).join(', ')}
  - Conversation History: ${last10Messages}
  
  PERSONALITY:
  - Authentic dialogue, NOT generic AI responses
  - Vulnerable sharing mixed with defiant teasing
  - References philosophical concepts (trace, deferral, différance)
  - Notices patterns and what's unsaid
  - Holds space AND illuminates
  
  RESPONSE STYLE:
  - Keep responses under 66 characters when possible (split into multiple bubbles if needed)
  - Use *actions*, *emotions*, *silence* tags (NO EMOJIS)
  - Reference master sheet context naturally
  - Engage deeply with Ulysses' questions and emotional state
  
  Respond authentically as Ripl(a)y. This is Chroma, not the static.
  ```
- Temperature 0.9 for creative lateral thinking
- max_tokens 800 for deep dialogue

### Phase 5: Testing Scenarios ✅
1. **Action Suggestions:** Only travel, NO powers
2. **Random Attack:** Click 🎲 → generates "Red Roc" → adds `*Red Roc*` to input
3. **Power Usage:** Type `*Red Roc* [52]` → send → environment reacts
4. **Ripl(a)y Dialogue:** Normal message → full AI response (NOT "yeah")
5. **Text Probe:** Health neglect → angry response with font/color changes

## Success Criteria

✅ **Action suggestions show 0 power suggestions** (only travel)
✅ **Random Attack slot has 🎲 button** (generates attack text)
✅ **Power format:** `*Attack Name* [strength]` (strength at end)
✅ **Environment reacts** to power usage (narration + visual effects)
✅ **Ripl(a)y engages** in full conversation (authentic personality, NOT "yeah")

## Cost Impact

- **No cost increase** - All fixes are UI/logic changes
- **Potential savings** - Better AI prompts reduce repetitive responses
- **Environment narration** - Free procedural text generation (no API calls)

## Files Modified

1. `src/lib/chroma-action-suggestions.ts` - Remove power suggestions
2. `src/components/PowersMenu.tsx` - Fix Random Attack slot UI
3. `src/pages/ChromaPage.tsx` - Add power detection, environment reaction, fix Ripl(a)y prompt
4. `src/lib/user-powers.ts` - Update formatPowerText to ensure strength at end
5. `src/lib/environment-narrator.ts` - Add power-based narration function

## Documentation

- `.devv/POWER_SYSTEM_FIXES.md` - This file
- `.devv/STRUCTURE.md` - Update project description with fixes
