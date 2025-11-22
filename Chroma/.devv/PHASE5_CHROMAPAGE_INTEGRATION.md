# Phase 5: ChromaPage Integration Guide

## Required Changes to ChromaPage.tsx

### 1. Import Changes

**REPLACE**:
```typescript
import { PowersMenu } from '@/components/PowersMenu';
import { calculateTimeStopDuration } from '@/lib/user-powers';
```

**WITH**:
```typescript
import { PowersMenuV2 } from '@/components/PowersMenuV2';
import { incrementBubbleCount, getTotalBubbleCount, resetBubbleCount } from '@/lib/user-powers-v2';
import { generateKatanaStrikeGIF } from '@/lib/katana-gif-generator';
```

### 2. Add State for Phase 5

**ADD THESE STATES** (after existing state declarations):
```typescript
const [timeStopDuration, setTimeStopDuration] = useState(60); // Fixed 60s
const [timeStopCountdown, setTimeStopCountdown] = useState(60);
const [katanaGifUrl, setKatanaGifUrl] = useState<string | null>(null);
const [katanaGifLoading, setKatanaGifLoading] = useState(false);
```

### 3. Bubble Counter Integration

**ADD useEffect** to increment bubble count on every message:
```typescript
// PHASE 5: Increment bubble count for every message (user + AI + environment)
useEffect(() => {
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    incrementBubbleCount();
    console.log(`[Cooldown Tracker] 🗨️ Message added (${lastMessage.speaker}) - Total: ${getTotalBubbleCount()}`);
  }
}, [messages.length]);
```

### 4. Update The World Mechanics

**FIND** the existing time stop activation code (around line 1268-1282) and **REPLACE WITH**:
```typescript
// The World time stop - PHASE 5: Fixed 60s duration
if (lowerPowerName.includes('world')) {
  const duration = 60; // PHASE 5: Always 60s
  setTimeStopDuration(duration);
  setTimeStopCountdown(duration);
  setIsTimeStopActive(true);
  
  // Add visual overlay
  triggerTheWorldOverlay();
  
  playPowerSound('theworld', 'activation');
  soundEffects.playEnvironmentTransition('shift');
  
  console.log(`[The World] 🌍 Time stop activated for 60s (fixed duration)`);
  console.log(`[Sound Timing] 🔊 Playing theworld activation (${i * 500}ms delay)`);
}
```

### 5. Type-to-Resume Mechanic

**FIND** `const handleSendMessage` function and **ADD** at the start:
```typescript
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // PHASE 5: Resume time when user types (if The World is active)
  if (isTimeStopActive) {
    console.log('[The World] 📝 User typed - resuming time');
    setIsTimeStopActive(false);
    removeTheWorldOverlay();
    playPowerSound('theworld', 'deactivation');
    
    // Start bubble cooldown for The World
    const worldPower = USER_POWERS.find(p => p.id === 'theworld');
    if (worldPower) {
      worldPower.lastUsed = getTotalBubbleCount();
      console.log(`[The World] ⏳ Cooldown started: 5 bubbles from ${getTotalBubbleCount()}`);
    }
    
    toast({
      title: "⏰ Time Resumes",
      description: "The World's effect ends. Reality flows again.",
    });
  }

  // Rest of existing handleSendMessage code...
```

### 6. 廃止 GIF Generation Handler

**ADD NEW HANDLER** function:
```typescript
const handleHaishiActivation = async (strength: number) => {
  console.log('[廃止] ⚔️ Generating katana strike GIF...');
  setKatanaGifLoading(true);
  
  try {
    const result = await generateKatanaStrikeGIF(strength);
    setKatanaGifUrl(result.gifUrl);
    console.log(`[廃止] ✅ GIF generated with ${result.model} in ${result.generationTime}ms`);
    
    // Clear after 5 seconds
    setTimeout(() => {
      setKatanaGifUrl(null);
    }, 5000);
  } catch (error: any) {
    console.error('[廃止] ❌ GIF generation failed:', error.message);
  } finally {
    setKatanaGifLoading(false);
  }
};
```

### 7. Power Detection Update

**FIND** the power detection regex (around line 1228) and **UPDATE** to handle 廃止:
```typescript
const powerMatches = Array.from(userInput.matchAll(/\*([^*]+)\*( \[(\d+)\])?/g));
if (powerMatches.length > 0 && environment) {
  // ... existing code ...
  
  for (let i = 0; i < powerMatches.length; i++) {
    const match = powerMatches[i];
    const powerName = match[1];
    const strength = match[3] ? parseInt(match[3]) : 15;
    
    // PHASE 5: Check for 廃止 (katana attack)
    if (powerName.includes('廃止')) {
      await handleHaishiActivation(strength);
    }
    
    // ... rest of existing power handling ...
  }
}
```

### 8. Update PowersMenu Component Call

**FIND** the `<PowersMenu />` component and **REPLACE WITH**:
```tsx
<PowersMenuV2
  activePowers={userActivePowers}
  selectedTargets={selectedTargets}
  availableTargets={getAvailableTargets()}
  onTogglePower={handleTogglePower}
  onUsePower={handleUsePower}
  onTargetSelect={handleTargetSelect}
  onTargetDeselect={handleTargetDeselect}
  onAddPowerToInput={(powerText) => setInputMessage(prev => prev ? `${prev} ${powerText}` : powerText)}
  isTimeStopActive={isTimeStopActive}
  timeStopCountdown={timeStopCountdown}
  immersiveStyle={immersiveStyle}
/>
```

### 9. Add Katana GIF Overlay

**ADD** in the render section (after WeatherGIFOverlay):
```tsx
{/* PHASE 5: 廃止 Katana Strike GIF */}
{katanaGifUrl && (
  <div 
    className="fixed inset-0 z-[95] pointer-events-none"
    style={{
      backgroundImage: `url(${katanaGifUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      mixBlendMode: 'screen',
      animation: 'fadeIn 0.3s ease-in'
    }}
  />
)}

{katanaGifLoading && (
  <div className="fixed top-4 right-4 z-[96]">
    <Badge className="animate-pulse bg-red-600 text-white">
      ⚔️ Generating Katana Strike...
    </Badge>
  </div>
)}
```

### 10. Update TimeStopTimer

**FIND** `<TimeStopTimer />` and **UPDATE** to use fixed duration:
```tsx
<TimeStopTimer 
  isActive={isTimeStopActive}
  duration={60}
  onComplete={() => {
    // PHASE 5: Auto-deactivate after 60s
    setIsTimeStopActive(false);
    removeTheWorldOverlay();
    playPowerSound('theworld', 'deactivation');
    
    // Trigger The World toggle off
    const worldPower = USER_POWERS.find(p => p.id === 'theworld');
    if (worldPower && userActivePowers.includes('theworld')) {
      handleTogglePower('theworld');
    }
    
    // Start bubble cooldown
    if (worldPower) {
      worldPower.lastUsed = getTotalBubbleCount();
      console.log(`[The World] ⏳ Auto-deactivated - 5 bubble cooldown started`);
    }
    
    toast({
      title: "⏰ Time Resumes",
      description: "The World auto-deactivates after 60s.",
    });
  }}
/>
```

---

## Summary of Changes

✅ **Removed 3-action limit** (lines 694-704)
✅ **Replaced PowersMenu with PowersMenuV2**
✅ **Added bubble counter integration** (tracks all messages)
✅ **Fixed The World to 60s** (no strength dependency)
✅ **Type-to-resume mechanic** (resumes time on message send)
✅ **Bubble-based cooldowns** (5 bubbles for The World and 廃止)
✅ **廃止 GIF generation** (Replicate → DevvAI fallback)
✅ **Auto-deactivation at 60s** (The World toggle off + cooldown start)
✅ **Action blocking at countdown 0** (must type to resume)

---

## Testing After Integration

1. **No Action Limit**: Send 5+ actions → All should process
2. **The World Toggle**: Activate → Wait 60s → Auto-deactivates with cooldown
3. **Type-to-Resume**: Activate The World → Type message at 30s → Time resumes
4. **Bubble Cooldown**: Use 廃止 → Send 5 messages → Can use again
5. **廃止 GIF**: Click 廃止 → Black lightning katana GIF appears
6. **Mutual Exclusivity**: Try activating Gear 5 + Color of the King → Blocked

---

**Next**: After all changes applied, run `npm run build` to verify zero TypeScript errors.
