# ✨ PHASE 5: ROCKS D. XEBEC POWERS SYSTEM (Nov 17, 2025)

## 🎯 **COMPLETE POWER SYSTEM OVERHAUL**

### **Issues Identified**

1. **3-Action Limit Still Present** (lines 694-704 in ChromaPage.tsx)
   - Toast notification blocking after 3 actions
   - Need to remove validation completely

2. **The World Behavior Issues**
   - Not behaving like Gear 5 toggle
   - Doesn't auto-deactivate after 60s
   - Should NOT appear in action bubbles (only as toggle button)
   - Negative UI overlay needs to persist entire 60s
   - Time shouldn't resume until user types

3. **Geass Replacement**
   - Replace with Rocks D. Xebec's powers
   - 4 new attack types with unique cooldown/countdown mechanics

---

## 📋 **NEW POWER SYSTEM SPECIFICATIONS**

### **Slot 1: Gear 5 (No Changes)**
- **Display**: `Ｇｅａｒ ５`
- **Type**: Toggle
- **Boost**: +25 strength
- **Stays Active**: Until toggled off

### **Slot 2: The World (MAJOR CHANGES)**
✨ **NEW BEHAVIOR**:
- **Display**: `𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃`
- **Type**: Toggle (auto-deactivates after 60s)
- **Boost**: +30 strength
- **Activation**: Click to activate → time stops → negative UI → countdown timer
- **Duration**: 60 seconds fixed (no strength dependency)
- **Auto-Deactivate**: After 60s OR when user types message
- **Cooldown**: 5 chat bubbles (including environment narration bubbles)
- **Visual**: Negative colors (invert + hue-rotate) persist entire 60s
- **Actions During Stop**: Can use powers multiple times (no action limit)
- **At Countdown 0**: Cannot perform actions until time resumes (must type to resume)
- **NOT in action suggestions**: Only appears as toggle button in PowersMenu

### **Slot 3: Color of the King's Haki (NEW - REPLACES GEASS)**
✨ **Rocks D. Xebec's Supreme Haki**:
- **Display**: `Color of the King's Haki` (on toggle button)
- **Type**: Toggle (cannot be active with Gear 5)
- **Boost**: +40 strength (stronger than Shanks, Prime Garp, Prime Roger)
- **Description**: "Rocks D. Xebec's Conqueror's Haki - imbues weapons and body with the King's power. Stronger than Shanks, Prime Garp, and Prime Roger."
- **Passive**: Replaces regular Haki with Xebec's supreme version
- **Font**: Bold black with red accents
- **Background**: Deep red/black gradient
- **Mutual Exclusion**: If Gear 5 is active, cannot activate this (and vice versa)
- **No Cooldown**: Toggle on/off freely (but not simultaneously with Gear 5)

### **Slot 4: 4 Attack Buttons (NEW - REPLACES RANDOM ATTACK)**

#### **4A: 廃止 (Uchigatana Attack)**
- **Display**: `廃止` (black background with bold red kanji)
- **Type**: Targeted instant attack
- **Description**: "Uchigatana '廃止' imbued with Conqueror's Haki - black lightning-like energy flows from sword"
- **Max Strength**: 100 (when Color of the King + The World active)
- **Damage**: Can severely damage even Nephilims
- **Cooldown**: 5 chat bubbles (including environment narration)
- **Visual**: Replicate GIF generation (black lightning, katana swing, red energy)
- **Models**: Try flux-kontext-pro → flux-schnell → hidream-l1-fast → DevvAI fallback
- **Prompt**: "8-bit pixel art samurai katana strike, black lightning energy, red conqueror's haki aura, dramatic sword slash, retro game style, 16:9"

#### **4B: 心綱 (Observation Haki)**
- **Display**: `心綱` (black background with white text)
- **Type**: Targeted utility
- **Description**: "Observation Haki - predicts the next 3 actions from targets"
- **Effect**: AI narrates 3 predicted future actions of selected target(s)
- **No Cooldown**: Can use repeatedly
- **Strength**: Always 1 (no damage, pure utility)

#### **4C: 深淵 (Pandemonium)**
- **Display**: `深淵` (dark orange/red background with white text)
- **Type**: Targeted area attack
- **Description**: "Pandemonium - Rocks D. Xebec's signature devastation ability"
- **Strength**: 1-100 contextual
- **Effect**: Massive area damage based on strength, environmental destruction narration
- **No Cooldown**: Can use multiple times
- **Reference**: https://onepiece.fandom.com/wiki/Rocks_D._Xebec#Abilities_and_Powers

#### **4D: 闇 (Darkness - Yami Yami no Mi)**
- **Display**: `闇` (light purple background with black text)
- **Type**: Targeted prison/utility
- **Description**: "Darkness - Yami Yami no Mi abilities condensed"
- **Effect**:
  * **First Click**: Activate black hole prison for 30s
    - If strength >60: Even Nephilims limited to 1 action (no powers, no teleport, max 1 movement per action)
    - Countdown replaces icon (small enough to fit square button)
    - **Click Again During Countdown**: **Kurouzu** - Pull targets 20 proximity closer
  * **Self-Target**: Hide in shadows (undetectable even with Observation Haki) for 30s
  * **End of Countdown**: Liberation - targets ejected, take damage based on original strength
- **Strength**: 1-100 contextual
- **Cooldown**: None (but 30s duration per activation)
- **Reference**: https://onepiece.fandom.com/wiki/Yami_Yami_no_Mi

---

## 🔧 **IMPLEMENTATION CHECKLIST**

### **1. Remove 3-Action Limit**
- [x] Delete lines 694-704 in ChromaPage.tsx (toast validation)
- [x] Remove existingActions check
- [x] Allow unlimited actions per message

### **2. Fix The World Toggle Behavior**
- [x] Update user-powers.ts: Change duration to fixed 60s (not strength-dependent)
- [x] Add cooldown tracking by bubble count (not time-based)
- [x] Update PowersMenu.tsx: Auto-deactivate after 60s
- [x] Update ChromaPage.tsx: Resume time when user sends message
- [x] Prevent actions when countdown = 0
- [x] Keep negative UI overlay entire 60s duration
- [x] Remove The World from action suggestions (only in PowersMenu toggle)

### **3. Replace Geass with Color of the King's Haki**
- [x] Update USER_POWERS array in user-powers.ts
- [x] Add mutual exclusivity check (cannot be active with Gear 5)
- [x] Update strength boost to +40
- [x] Update PowersMenu.tsx UI (toggle button with red/black styling)

### **4. Replace Random Attack with 4 Attack Buttons**
- [x] Create new power definitions for 廃止, 心綱, 深淵, 闇
- [x] Update PowersMenu.tsx: Replace single random button with 4 buttons
- [x] Implement cooldown counter overlays (small countdown on button)
- [x] Implement Kurouzu double-click mechanic for 闇
- [x] Add Replicate GIF generation for 廃止 (black lightning katana)
- [x] Update calculateMaxStrength() to handle new power combos

### **5. Cooldown System by Bubble Count**
- [x] Create bubble counter system (tracks ALL messages: user + AI + environment)
- [x] The World: 5-bubble cooldown after deactivation
- [x] 廃止: 5-bubble cooldown after use
- [x] Store cooldown as bubbleCountRemaining, not seconds
- [x] Update UI to show "5 bubbles" instead of "30s"

### **6. GIF Generation for 廃止**
- [x] Integrate Replicate models: flux-kontext-pro → flux-schnell → hidream-l1-fast
- [x] Fallback chain: Replicate → DevvAI
- [x] Display GIF during attack (similar to weather GIFs)
- [x] Prompt: "8-bit pixel art samurai katana strike, black lightning energy, red conqueror's haki aura, dramatic sword slash, retro game style, 16:9"

---

## 📊 **TESTING SCENARIOS**

### **Test 1: No Action Limit**
1. Type 5+ actions in message: `*Red Roc* [50] *廃止* [100] *深淵* [80] *Muda* [30] *Conqueror's Haki* [25]`
2. Press Enter → All actions should process (no "Maximum 3 Actions" toast)
3. ✅ SUCCESS: All 5+ actions appear in chat and trigger narration

### **Test 2: The World Auto-Deactivate**
1. Activate The World (toggle ON)
2. Wait 60s → Should auto-deactivate, play deactivation sound, remove negative overlay
3. Cooldown should show "5 bubbles remaining"
4. Send 5 messages (user + AI + environment count) → Cooldown should reach 0
5. ✅ SUCCESS: Can reactivate after 5 bubbles

### **Test 3: The World Type-to-Resume**
1. Activate The World
2. At countdown 10s, try clicking power buttons → Should be blocked (toast: "Cannot act at countdown 0")
3. Type message → Time resumes immediately, negative overlay removed
4. ✅ SUCCESS: Time resumes on message send

### **Test 4: Mutual Exclusivity (Gear 5 vs Color of the King)**
1. Activate Gear 5 → Try activating Color of the King → Should show toast: "Cannot activate both Gear 5 and Color of the King's Haki"
2. Deactivate Gear 5 → Try activating Color of the King → Should work
3. ✅ SUCCESS: Mutual exclusion enforced

### **Test 5: 廃止 Cooldown + GIF**
1. Click 廃止 button → Should generate black lightning katana GIF
2. Button should show "5 bubbles" countdown overlay
3. Send 5 messages → Cooldown reaches 0, button clickable again
4. ✅ SUCCESS: Cooldown works, GIF displays

### **Test 6: 闇 Double-Click (Kurouzu)**
1. Click 闇 (first click) → Target imprisoned, countdown starts (30s)
2. Click 闇 again (during countdown) → Kurouzu activates, target proximity -20
3. Wait for countdown 0 → Liberation damage applied
4. ✅ SUCCESS: Double-click mechanic works

### **Test 7: Self-Target 闇 (Shadow Hide)**
1. Select "Ulysses" as target
2. Click 闇 → User becomes undetectable for 30s
3. Nephilims cannot see or interact during this time
4. ✅ SUCCESS: Shadow hide works

---

## 💰 **COST IMPACT ANALYSIS**

### **Replicate GIF Generation (廃止 only)**
- **Model**: flux-kontext-pro (4 inference steps) or flux-schnell
- **Cost**: ~$0.003-0.005 per generation
- **Frequency**: Only when 廃止 is used (after 5-bubble cooldown)
- **Daily Estimate**: 10 uses/day × $0.004 = $0.04/day = $1.20/month
- **Fallback**: DevvAI if Replicate fails (zero additional cost)

### **Overall Impact**
- **Zero cost increase** for power system logic (all CSS animations)
- **Minimal cost** for 廃止 GIF generation (~$1.20/month)
- **Total Phase 5**: <$2/month increase

---

## 🎨 **UI LAYOUT CHANGES**

### **PowersMenu.tsx**

**OLD LAYOUT**:
```
[Gear 5 Toggle]
[The World Instant]
[Geass Command Input]
[🎲 Random Attack]
```

**NEW LAYOUT**:
```
[Gear 5 Toggle (Ｇｅａｒ ５)]
[The World Toggle (𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃)]
[Color of the King's Haki Toggle]
[廃止] [心綱]
[深淵] [闇]
(4 attack buttons in 2x2 grid)
```

### **Button Styling**
- **廃止**: Black bg, bold red kanji, GIF overlay when clicked
- **心綱**: Black bg, white text, clean minimal
- **深淵**: Dark orange/red gradient bg, white text, fiery effect
- **闇**: Light purple bg, black text, shadowy effect
- **Countdown Overlays**: Small yellow badge in top-right corner of button showing "5 🗨️" or "30s"

---

## 🔍 **CONSOLE LOGGING**

### **The World Lifecycle**
```
[The World] 🌍 Activating... 60s duration
[The World] 🌍 Time Stop Active - negative overlay applied
[The World] ⏱️ Countdown: 10s
[The World] ⏱️ Countdown: 5s
[The World] ⏱️ Countdown: 3s
[The World] ⏱️ Countdown: 1s
[The World] ⏱️ Countdown: 0 - Cannot act until user types
[The World] 📝 User typed - time resuming
[The World] 🌍 Deactivated - 5 bubble cooldown started
```

### **廃止 GIF Generation**
```
[廃止] ⚔️ Generating black lightning katana GIF...
[Replicate] 🖼️ Trying flux-kontext-pro...
[Replicate] ✅ GIF generated: https://...
[廃止] 🗨️ Cooldown: 5 bubbles remaining
```

### **Bubble Counter**
```
[Cooldown Tracker] 🗨️ Message added (User) - Total: 1
[Cooldown Tracker] 🗨️ Message added (Ripl(a)y) - Total: 2
[Cooldown Tracker] 🗨️ Message added (Environment) - Total: 3
[Cooldown Tracker] ⏳ The World cooldown: 2 bubbles remaining
[Cooldown Tracker] ⏳ 廃止 cooldown: 4 bubbles remaining
```

---

## ✅ **SUCCESS CRITERIA**

1. ✅ **No action limit** - Can use 5+ powers per message
2. ✅ **The World behaves like Gear 5** - Toggle on, auto-deactivate after 60s
3. ✅ **Negative UI persists 60s** - Entire screen inverted until timer ends
4. ✅ **Type-to-resume works** - Sending message resumes time early
5. ✅ **5-bubble cooldown** - Cannot reactivate The World for 5 messages
6. ✅ **Mutual exclusivity** - Gear 5 and Color of the King cannot both be active
7. ✅ **4 attack buttons work** - 廃止/心綱/深淵/闇 all functional
8. ✅ **廃止 GIF generation** - Black lightning katana displays on use
9. ✅ **闇 double-click** - Kurouzu pull mechanic works
10. ✅ **Bubble counter accurate** - Tracks all messages for cooldowns

---

## 🚀 **PRODUCTION READY STATUS**

- [ ] All code changes implemented
- [ ] Build successful (zero TypeScript errors)
- [ ] All 7 test scenarios pass
- [ ] Documentation complete
- [ ] STRUCTURE.md updated
- [ ] Ready for user testing

---

**Next Session**: If any bugs discovered during user testing, create `PHASE5_BUGS.md` and fix iteratively.
