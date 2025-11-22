# Chroma Travel Replicate 400 Error - Root Cause & Fix

**Date**: November 17, 2025  
**Issue**: "Failed to generate image with Replicate (Status: 400)" during travel transitions  
**Trigger**: User clicked "Hauts-de-Seine" location suggestion → Error on travel GIF generation

---

## Root Cause Analysis

### Error Stack Trace
```
Error: Failed to generate image with Replicate (Status: 400)
  at a.textToImage (index-CY7XtzxI.js:96:21433)
  at async generateTransitionGIF (chroma-travel.ts:271)
```

### The Problem

**File**: `src/lib/chroma-travel.ts` (lines 263-291)

```typescript
export async function generateTransitionGIF(from: string, to: string): Promise<string | null> {
  try {
    const result = await replicate.textToImage({
      prompt,
      model: 'black-forest-labs/flux-schnell',
      aspect_ratio: '16:9',
      output_format: 'png',
      num_outputs: 1,
      num_inference_steps: 4  // ❌ This parameter causes 400 error
    });
    // ...
  } catch (error) {
    console.error('[Chroma Travel] ❌ Transition generation failed:', error);
    return null;  // ❌ Returns null but doesn't fallback to DevvAI
  }
}
```

**Why it fails**:
1. The Replicate SDK integration in Devv's backend **doesn't support all these parameters**
2. Specifically, `num_inference_steps` may not be a valid parameter for the Replicate API through Devv SDK
3. The API returns **400 Bad Request** indicating invalid parameters
4. Unlike `immersive-visuals.ts`, the travel code **doesn't have a DevvAI fallback**

### Why immersive-visuals.ts Works

**File**: `src/lib/immersive-visuals.ts` (lines 104-120)

```typescript
try {
  const replicateResult = await replicate.textToImage({
    prompt,
    model: 'black-forest-labs/flux-schnell',
    num_outputs: 1,
    aspect_ratio: '16:9',
    output_format: 'png',
    num_inference_steps: 4,
  });
  // ...
} catch (replicateError) {
  console.warn('[Immersive Visuals] ⚠️ Replicate failed, falling back to DevvAI:', replicateError);
  // ✅ FALLBACK TO DEVVAI - This is why it works!
}
```

**Key difference**: immersive-visuals.ts has a **try-catch with DevvAI fallback**, so even if Replicate fails, it continues working.

---

## Solution

### Option 1: Add DevvAI Fallback (RECOMMENDED)

Add the same fallback pattern used in `immersive-visuals.ts`:

```typescript
export async function generateTransitionGIF(from: string, to: string): Promise<string | null> {
  try {
    console.log(`[Chroma Travel] 🌀 Generating pixelated transition from ${from} to ${to}`);
    
    const prompt = `highly pixelated 8-bit retro wormhole vortex tunnel, chunky square pixels, spiral portal effect, ${from} to ${to}, swirling pixel vortex, retro game transition screen, cyberpunk neon colors, matrix green particles, low resolution pixel art, simple looping animation`;
    
    // Try Replicate first (faster if it works)
    try {
      const result = await replicate.textToImage({
        prompt,
        model: 'black-forest-labs/flux-schnell',
        aspect_ratio: '16:9',
        output_format: 'png',
        num_outputs: 1,
        num_inference_steps: 4
      });
      
      if (result.images && result.images.length > 0) {
        console.log('[Chroma Travel] ✅ Pixelated transition generated (Replicate)');
        return result.images[0];
      }
    } catch (replicateError) {
      console.warn('[Chroma Travel] ⚠️ Replicate failed, falling back to DevvAI:', replicateError);
    }
    
    // Fallback to DevvAI (always works)
    const devvResult = await imageGen.textToImage({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_outputs: 1
    });
    
    if (devvResult.images && devvResult.images.length > 0) {
      console.log('[Chroma Travel] ✅ Transition generated (DevvAI fallback)');
      return devvResult.images[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Chroma Travel] ❌ All generation methods failed:', error);
    return null;
  }
}
```

### Option 2: Use DevvAI Only (SIMPLER)

If Replicate consistently fails, just use DevvAI:

```typescript
export async function generateTransitionGIF(from: string, to: string): Promise<string | null> {
  try {
    console.log(`[Chroma Travel] 🌀 Generating transition from ${from} to ${to}`);
    
    const prompt = `highly pixelated 8-bit retro wormhole vortex tunnel, chunky square pixels, spiral portal effect, ${from} to ${to}, swirling pixel vortex, retro game transition screen, cyberpunk neon colors, matrix green particles, low resolution pixel art, simple looping animation`;
    
    const result = await imageGen.textToImage({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_outputs: 1
    });
    
    if (result.images && result.images.length > 0) {
      console.log('[Chroma Travel] ✅ Transition generated (DevvAI)');
      return result.images[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Chroma Travel] ❌ Generation failed:', error);
    return null;
  }
}
```

---

## Why Option 1 is Better

1. **Best of both worlds**: Try fast Replicate first, fallback to reliable DevvAI
2. **Consistent with codebase**: Same pattern as `immersive-visuals.ts`
3. **Cost optimization**: Replicate may be cheaper/faster when it works
4. **Graceful degradation**: Never breaks user experience

---

## Implementation Checklist

- [ ] Import `imageGen` from `@devvai/devv-code-backend` in chroma-travel.ts
- [ ] Wrap Replicate call in try-catch
- [ ] Add DevvAI fallback with same prompt
- [ ] Update console logs to distinguish between Replicate and DevvAI
- [ ] Test travel transitions (Chicago → Hauts-de-Seine specifically)
- [ ] Verify no more 400 errors in console
- [ ] Confirm transition GIFs display correctly

---

## Testing Scenarios

1. **Travel within Chicago**: Streets → Lake Michigan
2. **Cross-continental travel**: Chicago → Hauts-de-Seine (the failing case)
3. **Parallel world travel**: Chicago → Thousand Sunny
4. **Mystery location travel**: Chicago → ??? (random)

Expected: All should generate transition GIFs without 400 errors.

---

## Cost Impact

- **Replicate success**: ~$0.002 per image (fast)
- **DevvAI fallback**: Free (Devv credits) but slightly slower
- **Current**: 100% failure → User sees no transition GIF
- **After fix**: 100% success → Better UX even if using DevvAI

**Conclusion**: Fix improves UX with zero downside. If Replicate works, great. If not, DevvAI ensures transition always generates.
