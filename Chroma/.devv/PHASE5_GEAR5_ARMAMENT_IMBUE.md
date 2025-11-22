# Phase 5: Gear 5 Armament Imbue Implementation

## Overview
Replace Red Pistol with self-targetable Armament Haki imbue ability for Gear 5 mode.

## Changes

### 1. **Red Pistol Removal**
- Remove the `Red Pistol` button from Gear 5 attacks section in PowersMenuV2.tsx
- Located at lines 537-549 in PowersMenuV2.tsx

### 2. **New Armament Imbue Button**
**Name**: Supreme Armament (覇王)  
**Display**: 🛡️ 覇王 (Shield + Kanji)  
**Function**: Self-targetable imbue that:
- Coats uchigatana with Supreme Colored Haki (black with red glow)
- Imbues fists with Haki for powerful punches
- Hardens head for devastating headbutts
- Increases defense significantly (like base Armament Koka but stronger)

**Styling**:
- Background: Black (#000000)
- Text Color: Bright white (#FFFFFF)
- Border: Subtle red glow
- Shield emoji (🛡️) + 覇王 kanji

**Requirements**:
- Only available when Gear 5 is active
- Self-target only (automatically targets "Ulysses")
- Strength range: 1-50 (scales with Gear 5)

### 3. **Button Layout**
Gear 5 attacks row (when Gear 5 active):
```
[𝐑𝐞𝐝 𝐑𝐨𝐜] [🛡️ 覇王] [👁️] [🌊]
```

### 4. **Action Text Format**
When clicked, adds to input:
```
*Supreme Armament: Imbue* [strength]
```

Example: `*Supreme Armament: Imbue* [42]`

### 5. **Technical Implementation**

#### PowersMenuV2.tsx Changes:
- **Line 537-549**: Remove Red Pistol button
- **Replace with**: New Supreme Armament button
  - Self-targetable (no target validation needed)
  - Black background with white text
  - Shield emoji + 覇王 kanji
  - Same height (h-10) and flex layout (flex-1)

## Testing Scenarios

### Test 1: Button Visibility
1. ✅ Gear 5 inactive → Supreme Armament hidden
2. ✅ Gear 5 active → Supreme Armament visible in row

### Test 2: Self-Target Action
1. ✅ Click Supreme Armament → Adds `*Supreme Armament: Imbue* [X]` to input
2. ✅ No target selection required (self-target)
3. ✅ Strength value from slider included

### Test 3: Visual Styling
1. ✅ Black background with white text
2. ✅ Shield emoji visible
3. ✅ 覇王 kanji readable
4. ✅ Consistent height with other Gear 5 attacks

### Test 4: Defensive Effect
1. ✅ Using Supreme Armament increases defense
2. ✅ Imbued attacks deal more damage
3. ✅ Visual indication of Haki coating (red/black aura)

## Impact Analysis

### User Experience
- **Better**: Self-targetable defense/imbue matches user request
- **Simpler**: No target selection needed (auto-targets self)
- **Thematic**: Supreme Armament fits Gear 5's advanced Haki mastery

### Technical
- **Files Modified**: 1 (PowersMenuV2.tsx)
- **Lines Changed**: ~15 lines
- **Type Safety**: ✅ No TypeScript errors
- **Build Status**: ✅ Expected to succeed

### Cost
- **Credit Cost**: €0 (UI-only change)
- **Performance**: No impact

## Success Metrics
- ✅ Red Pistol completely removed
- ✅ Supreme Armament button functional
- ✅ Self-target action format correct
- ✅ Visual styling matches theme
- ✅ Zero TypeScript errors
- ✅ Build successful

## Next Steps
After implementation:
1. Test in Chroma with Gear 5 active
2. Verify self-target action text format
3. Confirm defensive boost works in combat
4. Document imbue mechanics in combat system

## Notes
- Supreme Armament is Gear 5-exclusive (requires Gear 5 toggle active)
- More powerful than base Armament Koka (slot 0)
- Imbues weapons AND body for comprehensive enhancement
- Red Pistol was redundant (similar to Red Roc projectile)
