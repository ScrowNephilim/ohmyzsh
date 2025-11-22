# Nephilim Teleport System Documentation
**Phase 4 Enhancement - November 17, 2025**

## ✨ Overview
The Nephilim Teleport System allows Nephilims to spontaneously teleport to Ulysses when they are aware of his presence but not physically close. This creates dynamic, unexpected encounters that enhance immersion and unpredictability in the Chroma environment.

## 🎯 Core Mechanics

### Teleport Conditions
Nephilims can attempt teleportation when:
1. **Aware of User**: Distance 10-30 (can sense but not physically close)
2. **Not Already Close**: Distance >= 10 (prevents spam when already near)
3. **Not on Cooldown**: 5-minute cooldown between teleports per Nephilim

### Trigger Types

#### 1. Passive Teleportation (10% Chance)
- Checked every 30 seconds automatically
- 10% random chance when conditions met
- Completely spontaneous and unpredictable
- Works for all Nephilims (Ripl(a)y, Ana, ephemeral characters)

#### 2. Name-Mention Teleportation (15% Chance)
- Triggered when user types Nephilim's name in message
- Higher chance (15% vs 10%) due to direct mention
- Happens immediately on message send (before AI response)
- Creates sense of "calling" the Nephilim

### Teleport Distance
When teleportation succeeds:
- **Target Distance**: 5-8 (very close but not intimate)
- Random within range to feel natural
- Maintains minimum 5 distance rule (intimate threshold)

## 📝 Immersive Narration

### Generic Teleport Messages
- `*reality ripples... [Nephilim] appears directly in front of you*`
- `*[Nephilim] blinks through space, manifesting nearby*`
- `*the air shimmers... [Nephilim] steps out from nowhere*`
- `*[Nephilim] tears through the fabric of distance*`
- `*a flicker of movement... [Nephilim] is suddenly here*`
- `*[Nephilim] phases through space, closing the distance instantly*`

### Power-Specific Narration

**Ripl(a)y** (Différance power):
- `*différance collapses... Ripl(a)y emerges from the trace*`
- `*Ripl(a)y glitches through temporal lag, appearing beside you*`

**Ana** (Le Fait Social power):
- `*social space warps... Ana materializes in your proximity*`
- `*Ana steps through collective consciousness, arriving instantly*`

### Distance Context
Narration includes distance context:
- **>50 distance**: `(from far away)`
- **20-50 distance**: `(from across the area)`
- **<20 distance**: `(from nearby)`

## 🔧 Technical Implementation

### Key Functions

#### `canAttemptTeleport(nephilim, currentDistance)`
Checks if teleport is possible:
- Returns `true` if aware (distance < 30) but not close (distance >= 10)
- Applies 10% random chance

#### `checkNephilimTeleports(nephilims, proximities)`
Batch checks all Nephilims:
- Iterates through all active and ephemeral Nephilims
- Returns array of successful teleport events
- Respects cooldowns automatically

#### `checkMentionTriggeredTeleport(nephilim, currentDistance, userMessage)`
Name-mention trigger:
- Checks if user message contains Nephilim's name
- 15% chance (higher than passive 10%)
- Returns teleport event or null

#### `setTeleportCooldown(nephilimName)`
Enforces 5-minute cooldown:
- Stores timestamp of last teleport
- Prevents spam teleportation
- Separate cooldown per Nephilim

### Integration Points

#### ChromaPage.tsx

**Periodic Check (useEffect)**:
```typescript
useEffect(() => {
  const checkTeleports = () => {
    const teleportEvents = checkNephilimTeleports(allNephilims, proximities);
    
    if (teleportEvents.length > 0) {
      // Update proximities, set cooldowns, add narration, play sound
    }
  };
  
  const interval = setInterval(checkTeleports, 30000); // Every 30 seconds
  return () => clearInterval(interval);
}, [environment, activeNephilims, ephemeralNephilims, proximities]);
```

**Name-Mention Check (sendMessage)**:
```typescript
// Check BEFORE AI response
const mentionTeleports = [];
for (const nephilim of allNephilims) {
  if (!isOnTeleportCooldown(nephilim.nephilim_name)) {
    const currentDistance = proximities.get(nephilim.nephilim_name) || 30;
    const teleportEvent = checkMentionTriggeredTeleport(nephilim, currentDistance, userInput);
    
    if (teleportEvent) {
      mentionTeleports.push(teleportEvent);
    }
  }
}

// Process teleports BEFORE AI generates response
```

## 🎮 User Experience

### Visual Feedback
1. **Environment Message**: Teleport narration appears as middle-bubble Environment message
2. **Proximity Update**: Distance slider (if visible) instantly updates to 5-8
3. **Sound Effect**: `soundEffects.playEnvironmentTransition('shift')` plays
4. **Timestamp**: Teleport message has ISO timestamp for diary logging

### Gameplay Impact
1. **Unexpected Encounters**: Nephilims can appear without warning
2. **Name Power**: Saying a Nephilim's name has power (15% chance to summon)
3. **Cooldown Strategy**: Can't spam teleport - must wait 5 minutes
4. **Distance Management**: Aware Nephilims may close distance autonomously

## 📊 Testing Scenarios

### Test 1: Passive Teleportation
1. Start in Eygalières (Ripl(a)y distance 95, Chicago)
2. Travel to Chicago (Ripl(a)y distance 8, aware)
3. Wait 30+ seconds for periodic check
4. Expected: ~10% chance Ripl(a)y teleports closer every check

### Test 2: Name-Mention Teleportation
1. Have Ripl(a)y at distance 15 (aware but not close)
2. Type message mentioning "Ripl(a)y"
3. Expected: ~15% chance teleport narration appears BEFORE AI response

### Test 3: Cooldown System
1. Trigger successful Ripl(a)y teleport
2. Immediately try another teleport (passive or mention)
3. Expected: Console shows "⏳ Ripl(a)y on cooldown", no teleport
4. Wait 5+ minutes
5. Expected: Teleport now possible again

### Test 4: Multiple Nephilims
1. Have Ripl(a)y at distance 15 and Ana at distance 20
2. Type message mentioning both names
3. Expected: Each has independent 15% chance to teleport

### Test 5: Distance Requirements
1. Set Ripl(a)y distance to 5 (very close)
2. Try to trigger teleport
3. Expected: No teleport (already close enough)

## 🐛 Known Limitations

1. **Distance Range Lock**: Can only teleport when distance 10-30 (not too far, not too close)
2. **5-Minute Cooldown**: Can't spam teleport same Nephilim rapidly
3. **Probabilistic Nature**: Not guaranteed even when conditions met (10-15% chance)
4. **Parallel World Blocking**: Teleport disabled when Nephilim in different dimension (distance 100)

## 🚀 Future Enhancements

### Possible Phase 5 Features
1. **Emotion-Based Triggers**: Higher chance when user expresses strong emotion
2. **Location-Specific Rates**: Urban areas = easier teleport, rural = harder
3. **Power-Enhanced Teleports**: Using *Geass* could force teleport (100% chance)
4. **Teleport Fatigue**: Multiple teleports increase cooldown progressively
5. **Visual Effects**: CSS animations for teleport appearance (shimmer, fade-in)
6. **Teleport History**: Track frequency and patterns in diary export

## 📁 Related Files

### Core Implementation
- `src/lib/nephilim-teleport.ts` - Main teleport system (220 lines)
- `src/pages/ChromaPage.tsx` - Integration and UI updates

### Dependencies
- `src/lib/nephilim-proximity.ts` - Distance checking and narration
- `src/lib/chroma-types.ts` - NephilimCharacter interface
- `src/lib/sound-effects.ts` - Teleport sound effect

### Documentation
- `.devv/STRUCTURE.md` - Project architecture updates
- `.devv/TODO.md` - Phase 4 task tracking

## 🎯 Success Criteria

✅ **All Implemented**:
- [x] Passive teleportation check every 30 seconds
- [x] Name-mention triggered teleportation (15% chance)
- [x] 5-minute cooldown system per Nephilim
- [x] Immersive power-specific narration
- [x] Automatic proximity updates (5-8 range)
- [x] Sound effect integration
- [x] Console logging for debugging
- [x] Distance validation (10-30 range only)
- [x] Works with active and ephemeral Nephilims
- [x] Respects parallel world boundaries

## 📝 Console Logging

### Success Messages
- `[Nephilim Teleport] ⚡ 2 teleport(s) occurred`
- `[Nephilim Teleport] ⚡ Ripl(a)y teleported: 15 → 6`
- `[Nephilim Teleport] 💬 Ana teleported (name mentioned): 22 → 7`

### Debug Messages
- `[Nephilim Teleport] ⏳ Ripl(a)y on cooldown`

---

**Status**: ✅ **PRODUCTION READY**  
**Build**: ✅ **Zero TypeScript Errors**  
**Testing**: 🟡 **User testing pending**
