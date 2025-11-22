# Phase 5 Final Fixes - Nov 17, 2025

## 🔴 **CRITICAL ISSUES IDENTIFIED**

### **Issue 1: No Nephilim Action Limit**
- **Problem**: User removed their own 3-action limit (correct), but Nephilims have NO limit now (incorrect)
- **Expected**: Nephilims should be limited to **3 actions per bubble by default**
- **Solution**: Add action counting to Nephilim AI responses with DevvAI system prompts

### **Issue 2: "The World" Shows in Chat**
- **Problem**: When The World is activated as a toggle, it appears as text in chat bubbles
- **Expected**: The World is a **toggle like Gear 5** - should NOT appear as action text
- **Solution**: Skip adding The World to chat when it's toggled (only visual effects)

### **Issue 3: "Rocks D. Xebec" Not Visible**
- **Problem**: "Color of the King's Haki" button text is too long (cut off on button)
- **Expected**: Button should show "Rocks D. Xebec" or shortened version
- **Solution**: Change displayName to "Rocks D. Xebec" or "𝐑𝐨𝐜𝐤𝐬 𝐃. 𝐗𝐞𝐛𝐞𝐜" with smaller font

### **Issue 4: The World Cooldown Not Next to Button**
- **Problem**: Cooldown badge shows at top-right corner (line 323-327)
- **Expected**: Cooldown should be **inside the power bubble on the right side**
- **Solution**: Move cooldown badge to flex justify-between layout with power name

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **1. Nephilim Action Limit (3 per bubble)**
- [ ] Update riplay-text-probe-chroma.ts system prompts to enforce 3 actions
- [ ] Add action counting validation in ChromaPage for Nephilim responses
- [ ] Add console logging to track Nephilim action counts
- [ ] Add visible warnings when Nephilims exceed 3 actions

### **2. Hide The World from Chat**
- [ ] Detect The World toggle activation in handleTogglePower
- [ ] Skip adding The World text to input message
- [ ] Keep visual effects (negative overlay, timer, sound)
- [ ] Update console logging to show "The World activated (toggle only, no chat text)"

### **3. Make "Rocks D. Xebec" Visible**
- [ ] Change displayName in user-powers-v2.ts to "Rocks D. Xebec"
- [ ] Use bold serif font style with letter-spacing
- [ ] Reduce font size to 9px for button text
- [ ] Add line wrapping or multi-line layout if needed

### **4. Cooldown Inside Power Bubble**
- [ ] Move cooldown badge from absolute top-1 right-1 to inside flex container
- [ ] Use flex justify-between with power name on left, cooldown on right
- [ ] Update both The World and 廃止 cooldown displays
- [ ] Maintain visibility and readability

---

## 🔧 **DETAILED IMPLEMENTATION**

### **Fix 1: Nephilim Action Limit**

**File**: `src/lib/riplay-text-probe-chroma.ts`

Add to system prompt:
```typescript
// Add to system prompt near line 50:
**CRITICAL RULE**: You are limited to **MAX 3 ACTIONS PER MESSAGE** (e.g., *walks closer*, *looks at sky*, *speaks*). 
Never exceed this limit. Keep responses concise and focused.
```

**File**: `src/pages/ChromaPage.tsx`

Add action counting validation (after AI response generation):
```typescript
// After generateRiplayResponse() or generateAnaResponse(), add:
const actionCount = (responseText.match(/\*.*?\*/g) || []).length;
if (actionCount > 3) {
  console.warn(`[Nephilim Limit] ⚠️ ${nephilimName} exceeded 3 actions (${actionCount} actions detected)`);
  // Optionally truncate to 3 actions
}
```

### **Fix 2: Hide The World from Chat**

**File**: `src/components/PowersMenuV2.tsx` (Line 122-128)

```typescript
// BEFORE:
onTogglePower(power.id); // Add to activePowers

// The World auto-triggers time stop
if (power.id === 'theworld') {
  onUsePower(power.id, [], effectiveStrength);
}

// AFTER:
onTogglePower(power.id); // Add to activePowers

// The World auto-triggers time stop (no chat text)
if (power.id === 'theworld') {
  // Call onUsePower WITHOUT adding to input
  // Visual effects only
  console.log('[The World] 🌍 Time stop activated (toggle only, no chat text)');
}
```

**File**: `src/pages/ChromaPage.tsx`

Update handleUsePower to skip chat text for The World:
```typescript
const handleUsePower = (powerId: string, targets: string[], strength: number) => {
  // Skip adding to chat if The World toggle
  if (powerId === 'theworld') {
    // Trigger visual effects only
    setIsTimeStopActive(true);
    setTimeStopCountdown(60);
    // Play sound if available
    return; // EXIT - do NOT add to input
  }
  
  // All other powers...
};
```

### **Fix 3: Make Rocks D. Xebec Visible**

**File**: `src/lib/user-powers-v2.ts` (Line 218)

```typescript
// BEFORE:
displayName: "Color of the King's Haki",

// AFTER:
displayName: "𝐑𝐨𝐜𝐤𝐬 𝐃. 𝐗𝐞𝐛𝐞𝐜",
```

**File**: `src/components/PowersMenuV2.tsx` (Line 344-346)

```typescript
// Update button text styling:
<span style={{ fontSize: '9px', fontWeight: 900, lineHeight: 1.2 }}>
  {colorKingPower.displayName}
</span>
```

### **Fix 4: Cooldown Inside Bubble**

**File**: `src/components/PowersMenuV2.tsx`

**The World Button** (Line 305-329):
```typescript
// BEFORE:
<Button>
  <div className="flex items-center justify-between w-full">
    <span>{worldPower.displayName}</span>
    {activePowers.includes('theworld') && (
      <Badge className="text-[10px] bg-yellow-500 text-black">ON</Badge>
    )}
    {isPowerOnCooldown(worldPower) && (
      <Badge className="text-[10px] bg-red-500 text-white absolute top-1 right-1">
        {getRemainingCooldownBubbles(worldPower)} 🗨️
      </Badge>
    )}
  </div>
</Button>

// AFTER:
<Button>
  <div className="flex items-center justify-between w-full">
    <span>{worldPower.displayName}</span>
    <div className="flex items-center gap-1">
      {activePowers.includes('theworld') && (
        <Badge className="text-[10px] bg-yellow-500 text-black">ON</Badge>
      )}
      {isPowerOnCooldown(worldPower) && (
        <Badge className="text-[10px] bg-red-500 text-white">
          {getRemainingCooldownBubbles(worldPower)} 🗨️
        </Badge>
      )}
    </div>
  </div>
</Button>
```

**Slot 4 Buttons** (Line 380-387):
```typescript
// BEFORE:
{isOnCooldown && (
  <Badge className="absolute top-1 right-1 text-[9px] bg-yellow-500 text-black">
    {cooldownRemaining} 🗨️
  </Badge>
)}

// AFTER:
{isOnCooldown && (
  <Badge className="text-[9px] bg-yellow-500 text-black ml-auto">
    {cooldownRemaining} 🗨️
  </Badge>
)}
```

---

## ✅ **SUCCESS CRITERIA**

1. **Nephilims Limited**: All Nephilim responses have ≤3 actions per bubble
2. **The World Hidden**: Toggle activation does NOT add text to chat (only visual effects)
3. **Rocks Visible**: Button shows "𝐑𝐨𝐜𝐤𝐬 𝐃. 𝐗𝐞𝐛𝐞𝐜" clearly
4. **Cooldown In Bubble**: Cooldown badge appears inside power button (right side)

---

## 📊 **TESTING SCENARIOS**

1. **Nephilim Action Test**: Send message → Ripl(a)y responds → Count actions in response → Should be ≤3
2. **The World Test**: Toggle The World → Check chat → Should NOT see "The World" text
3. **Rocks Button Test**: Open PowersMenu → Check Slot 3 → Should see "Rocks D. Xebec" text
4. **Cooldown Test**: Use The World → Wait for cooldown → Badge should be on right side of button
