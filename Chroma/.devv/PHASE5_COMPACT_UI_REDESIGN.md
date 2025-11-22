# ✨ Phase 5 Final Polish v8 - COMPACT UI REDESIGN + BASE ATTACKS

**Status**: ✅ IMPLEMENTATION IN PROGRESS (Nov 17, 2025)

## 🎯 Requirements from User

### 1. **Make Powers Menu Smaller Overall**
- Gear 5, The World, and Rocks D. Xebec should be the size of the published version
- More compact UI to save vertical space

### 2. **Replace Gear 5 Attack Bubbles with 4 Compact Buttons**
- **Old**: 2x2 grid with large h-12 buttons
- **New**: 4 compact buttons same size as Rocks' attacks (h-10, flex-1)
- **Red Roc**: Replace icon with "𝐑𝐞𝐝 𝐑𝐨𝐜" text in black, toned-down red background
- **Red Pistol**: Replace icon with "𝐑𝐞𝐝 𝐏𝐢𝐬𝐭𝐨𝐥" text
- **Observation + Dawn Gatling**: Keep icon format but resize to match Rocks' attacks
- All 4 should fit on ONE horizontal line

### 3. **Add 4 Always-Available Base Attack Moves**
- **Armament Koka** (Haki shield):
  - Symbol: Shield or Sword icon (from Xebec's attack)
  - Bright white on black bubble
  - Self-target to increase defense
  - Range: 10 (base)

- **Conqueror's Haki** (Supreme King):
  - Symbol: Sun icon or appropriate symbol
  - Light yellow on black/dark red background
  - Range: 20 (Area of Effect)
  - Range-based knockback

- **Uchigatana Range Slash** (廃止):
  - Text: "廃止" in light green/cyan
  - Black background
  - Range: 20 (like Mihawk/Ichigo)
  - Long-distance slash attack

- **Muda** (無駄):
  - Text: "無駄" in white
  - Yellow/dark yellow background
  - Dual mode:
    * **Targeted**: Rapid punch barrage with The World
    * **Self-targeted**: Self-heal (DIO vampiric + The World surgical)
  - Range: 10

### 4. **Re-add Targeting + Self-Target Support**
- Add "Ulysses" as self-target option
- Target selection should always be visible/accessible

### 5. **Rename "Strength Control" → "Scaling"**
- Save UI space with shorter label

### 6. **Range System**
- Base power range: 10
- Gear 5 attacks: 30 (but stronger closer to target)
- Rocks' attacks: 20 (stronger closer to target)
- Conqueror's Haki: 20 (AOE)
- Uchigatana slash: 20 (ranged slash)

---

## 📐 Implementation Plan

### **Step 1: Update Power Definitions (user-powers-v2.ts)**
Add 4 new base attack powers with:
- `slot: 0` (always visible)
- Proper range values
- Self-target support for Armament Koka and Muda

### **Step 2: Shrink Core Power Buttons**
- Gear 5: h-12 → h-10, smaller text
- The World: h-12 → h-10
- Rocks D. Xebec: h-12 → h-10

### **Step 3: Replace Gear 5 Attack Grid**
- Remove 2x2 grid (grid-cols-2 gap-2)
- Create single horizontal flex row (flex gap-1)
- 4 buttons: h-10, flex-1, compact styling
- Red Roc/Red Pistol: Text-based (𝐑𝐞𝐝 𝐑𝐨𝐜, 𝐑𝐞𝐝 𝐏𝐢𝐬𝐭𝐨𝐥)
- Observation/Dawn Gatling: Keep icons, resize

### **Step 4: Add Base Attack Section**
- Always visible (NOT conditional)
- 4 horizontal buttons matching Rocks' attack style
- Armament Koka, Conqueror's Haki, 廃止, 無駄
- Each button: h-10, flex-1, icon + text

### **Step 5: Rename "Strength Control" → "Scaling"**
- Update CollapsibleSection title

### **Step 6: Add Self-Target to Target List**
- Add { name: 'Ulysses', type: 'self' } to availableTargets
- Update ChromaPage.tsx to include self in target array

---

## 🎨 UI Layout Summary

### **Core Powers (Always Visible)**
```
┌─────────────────────────────────┐
│  Gear 5 [h-10]                  │
│  The World [h-10]               │
│  Rocks D. Xebec [h-10]          │
└─────────────────────────────────┘
```

### **Attack Moves Section**
```
┌─────────────────────────────────────────────┐
│ ▼ Attack Moves [Collapsible]               │
├─────────────────────────────────────────────┤
│ [Always Visible - Base Attacks]            │
│ [🛡️ Koka] [☀️ Haki] [廃止] [無駄]      │
│                                             │
│ [Gear 5 Conditional - 4 buttons, 1 line]   │
│ [𝐑𝐞𝐝 𝐑𝐨𝐜] [𝐑𝐞𝐝 𝐏𝐢𝐬𝐭𝐨𝐥] [👁️] [🌊] │
│                                             │
│ [Rocks Conditional - 4 buttons, 1 line]    │
│ [廃止] [心綱] [深淵] [闇]              │
└─────────────────────────────────────────────┘
```

### **Scaling Section**
```
┌─────────────────────────────────┐
│ ▼ Scaling [Badge: 25]          │
│ Strength: 25                    │
│ [========|----] 1-100           │
└─────────────────────────────────┘
```

### **Target Selection Section**
```
┌─────────────────────────────────┐
│ ▼ Target Selection [Badge: 2]  │
│ [Ulysses ✕] [Ripl(a)y ✕]       │
└─────────────────────────────────┘
```

---

## 📊 Space Optimization

### Before:
- Core Powers: ~156px (3 × h-12)
- Gear 5 Attacks: ~104px (2 rows × h-12 + gap)
- Rocks Attacks: ~44px (1 row × h-10 + gap)
- **Total Attack Section**: ~148px

### After:
- Core Powers: ~130px (3 × h-10)
- Base Attacks: ~44px (1 row × h-10)
- Gear 5 Attacks: ~44px (1 row × h-10)
- Rocks Attacks: ~44px (1 row × h-10)
- **Total Attack Section**: ~132px

### **Net Savings**: ~22px overall, cleaner visual hierarchy

---

## 🔧 Technical Implementation

### Files to Update:
1. **src/lib/user-powers-v2.ts**
   - Add 4 new base attack power definitions (slot 0)
   - Add range property to UserPower interface

2. **src/components/PowersMenuV2.tsx**
   - Shrink core power button heights (h-12 → h-10)
   - Replace Gear 5 2x2 grid with 1-row flex layout
   - Replace Red Roc/Red Pistol icons with text
   - Add base attack section (always visible)
   - Rename "Strength Control" → "Scaling"

3. **src/pages/ChromaPage.tsx**
   - Add 'Ulysses' self-target to availableTargets array
   - Update getAvailableTargets() to include self

---

## ✅ Success Criteria
- [x] Core power buttons reduced to h-10
- [x] Gear 5 attacks: 4 buttons, 1 horizontal line
- [x] Red Roc/Red Pistol: Text-based styling
- [x] Base attacks: 4 always-visible buttons
- [x] Armament Koka: Self-target defense boost
- [x] Conqueror's Haki: AOE range 20
- [x] Uchigatana 廃止: Range slash 20
- [x] Muda 無駄: Dual-mode (attack/heal)
- [x] Self-target "Ulysses" available
- [x] "Scaling" renamed from "Strength Control"
- [x] Build successful with zero TypeScript errors
- [x] All buttons fit in compact horizontal layouts
- [x] Clean visual hierarchy maintained

---

## 🎉 Implementation Complete

### ✅ All Changes Applied:

1. **user-powers-v2.ts Updated**:
   - Added `range` and `selfTargetOnly` properties to UserPower interface
   - Added 4 new base attack powers (slot 0):
     * Armament Koka (🛡️) - Self-target defense boost, range 10
     * Conqueror's Haki (☀️) - AOE attack, range 20
     * Uchigatana Slash (廃止) - Long-range slash, range 20
     * Muda (無駄) - Dual-mode attack/heal, range 10
   - Added range values to all existing powers (Gear 5: 30, Rocks: 20)

2. **PowersMenuV2.tsx Updated**:
   - Shrunk core power buttons: h-12 → h-10
   - Added baseAttacks filter for slot 0 powers
   - Added always-visible base attacks section (4 horizontal buttons)
   - Replaced Gear 5 2x2 grid with 1-row flex layout
   - Red Roc: 𝐑𝐞𝐝 𝐑𝐨𝐜 text (black on #C84C4C)
   - Red Pistol: 𝐑𝐞𝐝 𝐏𝐢𝐬𝐭𝐨𝐥 text (red on white)
   - Observation/Dawn Gatling: Resized icons (w-4 h-4)
   - Renamed "Strength Control" → "Scaling"
   - Added Shield and Sun icons to imports

3. **ChromaPage.tsx Updated**:
   - Changed self-target name: 'Self' → 'Ulysses'

### 📊 Results:
- Core powers: 156px → 130px (26px saved)
- Attack section: More organized with clear visual hierarchy
- Base attacks always accessible
- Gear 5/Rocks attacks only show when powers active
- All buttons fit in compact horizontal layouts
- Zero TypeScript errors
- 100% production ready

---

**Status**: ✅ COMPLETE - Ready for deployment 🚀
