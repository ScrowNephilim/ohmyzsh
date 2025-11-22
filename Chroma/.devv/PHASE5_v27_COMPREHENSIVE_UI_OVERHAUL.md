# Phase 5 v27: Comprehensive UI Overhaul & Animation System

## Executive Summary
Complete UI transformation with 50+ specific changes covering Rocks D. Xebec styling, attack system animations, health bars, environment audio, bubble sizes, and comprehensive visual polish.

---

## Section 1: Rocks D. Xebec Styling Overhaul

### **Change 1.1: Rocks D. Xebec Name - Bigger/CAPS with Red Outline**
**Location:** `src/components/PowersMenuV2.tsx:502-516`
- **Current**: `{colorKingPower.displayName}` with `fontSize: '10px'`, grey text
- **New**: Transform to CAPS LOCK OR 1.5-2x bigger font size
  * Use bold serif font: `fontFamily: '"Times New Roman", serif', fontWeight: 900`
  * Black text: `color: '#000000'`
  * Red outline: `textShadow: '0 0 1px #FF0000, 0 0 1px #FF0000, 0 0 2px #FF0000'` (pure red #FF0000)
  * Transparent bubble: `backgroundColor: 'rgba(0, 0, 0, 0.2)'`
  * Black border: `border: '2px solid #000000'`
  * When activated: `backgroundColor: 'rgba(0, 0, 0, 0.9)'` (completely opaque black-grey)

### **Change 1.2: Rocks Strength Boosts - Repositioned**
**Location:** `src/components/PowersMenuV2.tsx:864-903`
- **Current**: Strength boost badges (`Gear 5 +25`, `Rocks +40`, `World +30`) displayed AFTER strength number
- **New**: Move badges BETWEEN "Strength:" label and the actual number
  * Line 864: `<span className="opacity-70">Strength:</span>`
  * **INSERT HERE**: Boost badges (Gear 5, Rocks, World)
  * Line 865: `<span className="font-bold">{strength}</span>`
- **Update values**: Gear 5 `+30` (was +25), World `+10` (was +30)

---

## Section 2: Attack Moves Menu Overhaul

### **Change 2.1: Remove Green Borders from All Attack Buttons**
**Locations:**
- `PowersMenuV2.tsx:613` (Slot 4 廃止/心綱/深淵/闇 buttons)
- `PowersMenuV2.tsx:636-750` (Gear 5 attacks)
- All attack button styles
- **Action**: Remove `borderColor: 'green'` / `border: '2px solid green'` styling completely

### **Change 2.2: Red Roc - Rename & Bigger Font**
**Location:** `PowersMenuV2.tsx:636-662`
- **Current**: "𝐑𝐞𝐝 𝐑𝐨𝐜" with `fontSize: '11px'`
- **New**: 
  * Rename display text (keep command same): "𝐆𝐨𝐦𝐮 𝐆𝐨𝐦𝐮 𝐧𝐨: 𝐑𝐞𝐝 𝐑𝐨𝐜"
  * Increase font: `fontSize: '13-14px'` (make it stand out more)
  * Add white-to-yellow neon contour gif loop: Use animated CSS border or `boxShadow`
  * Example: `boxShadow: '0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,0,0.6)'` with `@keyframes` pulse

### **Change 2.3: 結ぶ (Joy Boy's Power) - Swap with Armament Haki**
**Location:** `PowersMenuV2.tsx` base attacks section
- **Current**: 結ぶ likely in Slot 4 or not visible
- **New**: Move 結ぶ to base attacks array (slot 0) swapping position with Armament Haki
- Ensure tooltip shows proper description

### **Change 2.4: Powers Menu Floating Button - Black 20% Transparent**
**Location:** `PowersMenuV2.tsx:96`
- **Current**: `backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)'`
- **New**: `backgroundColor: 'rgba(0, 0, 0, 0.2)'` (20% transparent black)

### **Change 2.5: Attack Moves Menu Bubble - Black 20% Transparent Background**
**Location:** `PowersMenuV2.tsx` - CollapsibleSection for Attack Moves
- **Current**: `backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)'`
- **New**: `backgroundColor: 'rgba(0, 0, 0, 0.2)'` (20% transparent black)
- Apply to header of Attack Moves collapsible section

### **Change 2.6: Attack Moves Menu - Slightly Larger**
**Location:** `PowersMenuV2.tsx` - Attack button grid
- **Current**: `flex gap-1` with `h-10` buttons
- **New**: Increase button height to `h-12` and gap to `gap-1.5`
- Ensure all icons (廃止/心綱/深淵/闇) are fully visible without clipping

---

## Section 3: Scaling/Strength System Overhaul

### **Change 3.1: "Scaling" Bubble Text → Strength Slider**
**Location:** `PowersMenuV2.tsx:864`
- **Current**: "Scaling" shown as collapsible section title
- **New**: Replace entire "POWERS" text bubble (line 428) with **inline strength slider**
  * Remove "POWERS" text completely
  * Show: `[Icon] [Slider 1-100] [Value Display]`
  * Slider takes full width of previous "POWERS" title area
  * Keep X (close) button on the right side

### **Change 3.2: Proximity Slider - Remove Text, Make Smaller**
**Location:** `src/components/ProximitySlider.tsx:43`
- **Current**: Line 43-46 shows "Nephilim Proximity" title text
- **New**: 
  * Remove ALL text ("Nephilim Proximity")
  * Keep only MapPin icon and X button
  * Reduce overall bubble size to `w-64` (was `w-80`)
  * Change title to just "clues" in small text below icon

---

## Section 4: The World Power - Complete Redesign

### **Change 4.1: The World - GIF-Only (No Negative Effect)**
**Location:** `src/pages/ChromaPage.tsx` + `src/lib/visual-effects.ts`
- **Current**: Negative color filter `invert(1) hue-rotate(180deg)` applied
- **New**: 
  * Remove negative filter completely
  * Generate **dark overlay GIF** using Replicate when activated
  * GIF prompt: "highly pixelated 8-bit dark purple-black overlay, everything gets darker, ominous atmosphere, seamless loop, transparent PNG"
  * Stop ALL weather GIFs when The World activates
  * Resume weather GIFs when The World deactivates

### **Change 4.2: The World - Countdown in Bubble (60s→0)**
**Location:** `PowersMenuV2.tsx:484-498`
- **Current**: Countdown shows when ≤10s only
- **New**:
  * Show countdown IMMEDIATELY when activated: "60s" (small font, right side of bubble)
  * Format: `{timeStopCountdown}s` positioned with `justify-end`
  * Remove "Type to resume" at 0s
  * Countdown placement: `<Badge className="text-[10px] ml-auto">{timeStopCountdown}s</Badge>`

### **Change 4.3: The World - Cannot De-Toggle**
**Location:** `PowersMenuV2.tsx:232-258` handlePowerClick function
- **Current**: Can deactivate by clicking again
- **New**:
  * Block deactivation: `if (power.id === 'theworld' && activePowers.includes('theworld')) { return; }`
  * Only allow countdown to reach 0
  * Show toast: "Time will resume at 0s"
  * Typing DOES NOT resume time, only countdown reaching 0

---

## Section 5: Health Bar Improvements

### **Change 5.1: Compact Health Bars - Already Implemented ✅**
**Status**: Phase 5 v26 COMPLETE
- Small 1px bar above Nephilim names
- Color thresholds: green >40%, orange 10-40%, red <10%
- Click to expand detailed view

---

## Section 6: Environment & Weather System

### **Change 6.1: Remove Weather GIF Div**
**Location:** `src/components/WeatherGIFOverlay.tsx:144`
- **Current**: Line 144-195 contains manual weather control buttons (Rain/Snow/Clear)
- **New**: 
  * Remove entire `<div className="absolute top-20 right-4 z-30 flex flex-col gap-2">` section (lines 144-195)
  * Keep GIF overlay display (lines 119-128) but controlled internally only
  * Weather GIFs stop when The World activates

### **Change 6.2: Environment Controls - Remove Emoji**
**Location:** `src/components/EnvironmentControlPanel.tsx:107`
- **Current**: Line 107 shows `🎛️ Environment` with emoji
- **New**: Remove emoji, show only "Environment" text

### **Change 6.3: Environment Audio - Keep Published/Extracted Files**
**Status**: ✅ Already implemented in Phase 5 v26
- localStorage persistence ensures uploaded MP3s survive reloads

---

## Section 7: Chat Bubble & Message System

### **Change 7.1: Chat Bubbles - Smaller Max Width**
**Location:** `src/pages/ChromaPage.tsx:2918`
- **Current**: `max-w-[80%]` for chat bubbles
- **New**: `max-w-[65%]` (make bubbles narrower)
- Apply consistent sizing to all message cards

### **Change 7.2: Chat Bubbles - Opaque Background for Nephilims**
**Location:** `ChromaPage.tsx:2920-2927`
- **Current**: `opacity: isUser ? 1 : emotionalStyling.bubbleOpacity`
- **New**: 
  * Increase minimum Nephilim bubble opacity: `opacity: isUser ? 1 : Math.max(0.85, emotionalStyling.bubbleOpacity)`
  * Ensure all Nephilim text is easily readable
  * Maintain emotional styling but with higher base opacity

### **Change 7.3: Chat Bubble Colors/Borders - Emotion-Based**
**Location:** `ChromaPage.tsx:2900-2911` + `src/lib/emotional-text-styling.ts`
- **Current**: Emotional styling exists but may not affect borders
- **New**:
  * Border colors change based on detected emotion
  * Angry = red border `#DC143C`
  * Sad = blue border `#4A90E2`
  * Happy = yellow border `#FFD700`
  * Love = pink border `#FF69B4`
  * Fear = purple border `#8B00FF`
  * Philosophical = orange border `#FF8C00`

---

## Section 8: Attack Animation System

### **Change 8.1: Sequential Attack Display with Delay**
**Location:** `src/pages/ChromaPage.tsx:3126` Send button click handler
- **Current**: All actions sent instantly
- **New**: 
  * Parse message for attack moves (e.g., `*Red Roc* [50]`, `*廃止* [80]`)
  * Display attacks sequentially with 1-2 second delay between each
  * Show attack bubble → Wait 1.5s → Show animation GIF (if applicable) → Next attack
  * Prevents spam during The World time stop (blocks rapid-fire)

### **Change 8.2: Very Powerful Moves - Screen Shake**
**Location:** `src/lib/visual-effects.ts` + Animation trigger logic
- **Current**: Some attacks trigger screen shake
- **New**:
  * **廃止 (Haishi) at 60+ strength**: Trigger `animate-shake-hard` (3-5px offset, 0.5s duration)
  * **結ぶ (Joy Boy)**: Always trigger screen shake regardless of strength
  * Add CSS animation in `src/index.css`:
```css
@keyframes shake-hard {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 5px); }
  20%, 40%, 60%, 80% { transform: translate(5px, -5px); }
}
.animate-shake-hard {
  animation: shake-hard 0.5s;
}
```

### **Change 8.3: Remove Ugly Portal Travel Images**
**Location:** `src/lib/chroma-travel.ts` generateTransitionGIF function
- **Current**: Generates portal/wormhole GIFs
- **New**: 
  * Replace with smooth pixel art transition
  * Prompt: "highly pixelated 8-bit smooth color gradient transition, from [current color] to [destination color], seamless fade, retro video game style, no portals or wormholes"
  * Match transition colors to destination environment (blue for water, green for forest, etc.)

---

## Section 9: Power Sound System Improvements

### **Change 9.1: Make Uploaded MP3s Usable by NPCs**
**Location:** `src/lib/power-audio.ts` + sound library
- **Current**: Sounds only playable by user
- **New**:
  * Allow Nephilims/Characters to play user-uploaded power sounds
  * When Ripl(a)y or Ana use a power, check if user has uploaded sound for that power type
  * Play sound if available, silent if not
  * Share sound library across all entities with matching power types

### **Change 9.2: Gear 5 - White-to-Yellow Neon Contour Loop**
**Location:** `PowersMenuV2.tsx:452-468` Gear 5 button
- **Current**: Static cloudy gradient when active
- **New**: 
  * Add animated neon contour when Gear 5 active
  * CSS animation loop:
```css
@keyframes neon-pulse-gear5 {
  0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.5); }
  50% { box-shadow: 0 0 10px rgba(255,255,0,0.9), 0 0 20px rgba(255,255,0,0.6); }
}
```
  * Apply: `className="animate-neon-pulse-gear5"` when `activePowers.includes('gear5')`
  * Keep it small and subtle (not overwhelming)

---

## Section 10: Missing Features & Fixes

### **Change 10.1: Remove [<p>] Tag at Line 882**
**Location:** `PowersMenuV2.tsx:882`
- **Current**: `<p className="text-[10px] opacity-60 text-center">Max: {maxStrength}</p>`
- **New**: **DELETE** this line entirely (not needed if slider is inline)

### **Change 10.2: ElevenLabs/Replicate API Integration**
**Status**: Already integrated via Devv SDK
- ElevenLabs: STT (microphone), TTS (voice synthesis)
- Replicate: Image generation (flux-schnell model)
- No additional setup needed

---

## Implementation Priority

### **Phase 1: Critical UI Changes** (Immediate)
1. Rocks D. Xebec styling (CAPS/red outline)
2. Remove green borders from attacks
3. The World GIF-only redesign
4. Countdown in bubble (60s→0)
5. Remove weather GIF controls div

### **Phase 2: Animation System** (Next)
6. Sequential attack display with delays
7. Screen shake for powerful moves (60+ 廃止, 結ぶ)
8. Smooth pixel art travel transitions
9. Gear 5 neon contour loop

### **Phase 3: Polish & Refinement** (Final)
10. Chat bubble size reduction
11. Emotion-based bubble colors
12. Strength boost repositioning
13. NPC sound sharing system
14. Environment emoji removal

---

## Testing Checklist

- [ ] Rocks D. Xebec displays in CAPS with red outline and black bubble
- [ ] Rocks activates with opaque black-grey bubble
- [ ] All attack move green borders removed
- [ ] Red Roc displays with bigger font and neon contour when Gear 5 active
- [ ] The World shows dark GIF overlay (no negative filter)
- [ ] The World countdown displays 60s→0 inside bubble
- [ ] The World cannot be de-toggled (only reaches 0)
- [ ] Weather GIFs stop when The World activates
- [ ] Weather GIF manual controls removed
- [ ] Chat bubbles max 65% width
- [ ] Nephilim bubbles minimum 85% opacity
- [ ] Attacks display sequentially with 1-2s delays
- [ ] 廃止 at 60+ triggers screen shake
- [ ] 結ぶ always triggers screen shake
- [ ] Travel transitions use smooth pixel art gradients
- [ ] Gear 5 neon contour pulses white→yellow when active
- [ ] Strength boosts show between "Strength:" and number
- [ ] Gear 5 boost shows +30, World shows +10
- [ ] Environment controls no longer show 🎛️ emoji
- [ ] Powers menu floating button is 20% transparent black
- [ ] Attack Moves menu bubble is 20% transparent black
- [ ] Proximity slider shows "clues" instead of "Nephilim Proximity"
- [ ] Line 882 `<p>` tag removed from PowersMenuV2

---

## Files Modified

1. `src/components/PowersMenuV2.tsx` - 25+ changes
2. `src/components/ProximitySlider.tsx` - Title and size reduction
3. `src/components/WeatherGIFOverlay.tsx` - Remove manual controls div
4. `src/components/EnvironmentControlPanel.tsx` - Remove emoji
5. `src/pages/ChromaPage.tsx` - Chat bubble sizing, sequential attacks
6. `src/lib/visual-effects.ts` - The World GIF, screen shake
7. `src/lib/power-audio.ts` - NPC sound sharing
8. `src/lib/chroma-travel.ts` - Smooth pixel transitions
9. `src/lib/user-powers-v2.ts` - Strength boost values
10. `src/index.css` - New animations (shake-hard, neon-pulse-gear5)

---

## Cost Impact

- **The World dark GIF**: ~$0.003 per activation (one-time cache after first use)
- **Smooth travel transitions**: ~$0.003 per unique transition (cached)
- **Total additional cost**: ~$0.01-0.02 per session with heavy travel/time stop usage
- **Overall cost-efficient**: Most changes are CSS-only (zero credit cost)

---

## Next Steps

1. Implement Phase 1 critical UI changes
2. Build and test Rocks D. Xebec styling
3. Implement The World GIF system
4. Add sequential attack display logic
5. Create screen shake animations
6. Test complete workflow end-to-end
7. Update documentation with final screenshots
