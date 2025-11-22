/**
 * Katana GIF Generator - Phase 5
 * Generates 廃止 (Uchigatana) attack GIFs using Replicate models
 */

import { replicate } from '@devvai/devv-code-backend';
import { imageGen } from '@devvai/devv-code-backend';

export interface KatanaGIFResult {
  gifUrl: string;
  model: 'flux-kontext-pro' | 'flux-schnell' | 'hidream-l1-fast' | 'devvai';
  generationTime: number;
}

/**
 * Generate 廃止 katana strike GIF with black lightning and red haki
 * 
 * Fallback chain:
 * 1. Replicate flux-kontext-pro (best quality, context-aware)
 * 2. Replicate flux-schnell (fast, good quality)
 * 3. Replicate hidream-l1-fast (optimized fast)
 * 4. DevvAI (free fallback)
 */
export async function generateKatanaStrikeGIF(strength: number): Promise<KatanaGIFResult> {
  const startTime = Date.now();
  
  // Base prompt adapts to strength
  const intensityDescriptor = strength >= 80 ? 'devastating' : (strength >= 50 ? 'powerful' : 'fierce');
  
  const basePrompt = `8-bit pixel art samurai katana strike, ${intensityDescriptor} black lightning energy crackling, red conqueror's haki aura glowing, dramatic sword slash motion blur, retro game style, 16:9 aspect ratio, dark atmospheric background, high contrast`;
  
  console.log(`[廃止 GIF] ⚔️ Generating katana strike (strength: ${strength})...`);
  
  // Try Replicate flux-kontext-pro first (best quality, context-aware)
  try {
    console.log('[Replicate] 🖼️ Trying flux-kontext-pro (context-aware)...');
    const replicateResult = await replicate.textToImage({
      model: 'black-forest-labs/flux-kontext-pro',
      prompt: basePrompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (replicateResult.images && replicateResult.images.length > 0) {
      const gifUrl = replicateResult.images[0];
      const generationTime = Date.now() - startTime;
      console.log(`[Replicate] ✅ flux-kontext-pro success in ${generationTime}ms`);
      console.log(`[Replicate] 🖼️ GIF URL: ${gifUrl}`);
      return { gifUrl, model: 'flux-kontext-pro', generationTime };
    }
  } catch (error: any) {
    console.warn('[Replicate] ⚠️ flux-kontext-pro failed:', error.message);
    console.log('[Replicate] 🔄 Falling back to flux-schnell...');
  }
  
  // Try Replicate flux-schnell (fast, good quality)
  try {
    console.log('[Replicate] 🖼️ Trying flux-schnell (fast)...');
    const replicateResult = await replicate.textToImage({
      model: 'black-forest-labs/flux-schnell',
      prompt: basePrompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (replicateResult.images && replicateResult.images.length > 0) {
      const gifUrl = replicateResult.images[0];
      const generationTime = Date.now() - startTime;
      console.log(`[Replicate] ✅ flux-schnell success in ${generationTime}ms`);
      console.log(`[Replicate] 🖼️ GIF URL: ${gifUrl}`);
      return { gifUrl, model: 'flux-schnell', generationTime };
    }
  } catch (error: any) {
    console.warn('[Replicate] ⚠️ flux-schnell failed:', error.message);
    console.log('[Replicate] 🔄 Falling back to hidream-l1-fast...');
  }
  
  // Try Replicate hidream-l1-fast (optimized fast)
  try {
    console.log('[Replicate] 🖼️ Trying hidream-l1-fast (optimized)...');
    const replicateResult = await replicate.textToImage({
      model: 'prunaai/hidream-l1-fast',
      prompt: basePrompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (replicateResult.images && replicateResult.images.length > 0) {
      const gifUrl = replicateResult.images[0];
      const generationTime = Date.now() - startTime;
      console.log(`[Replicate] ✅ hidream-l1-fast success in ${generationTime}ms`);
      console.log(`[Replicate] 🖼️ GIF URL: ${gifUrl}`);
      return { gifUrl, model: 'hidream-l1-fast', generationTime };
    }
  } catch (error: any) {
    console.warn('[Replicate] ⚠️ hidream-l1-fast failed:', error.message);
    console.log('[DevvAI] 🔄 Falling back to DevvAI (free)...');
  }
  
  // Final fallback: DevvAI (always free)
  try {
    console.log('[DevvAI] 🖼️ Generating with DevvAI...');
    const devvResult = await imageGen.textToImage({
      prompt: basePrompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    const gifUrl = devvResult.images[0];
    const generationTime = Date.now() - startTime;
    console.log(`[DevvAI] ✅ Success in ${generationTime}ms`);
    console.log(`[DevvAI] 🖼️ GIF URL: ${gifUrl}`);
    return { gifUrl, model: 'devvai', generationTime };
  } catch (error: any) {
    console.error('[DevvAI] ❌ Final fallback failed:', error.message);
    throw new Error(`All image generation attempts failed: ${error.message}`);
  }
}

/**
 * Generate 闇 (Darkness) prison visual
 * Used when activating black hole prison
 */
export async function generateDarknessPrisonGIF(): Promise<string> {
  const prompt = "8-bit pixel art swirling black hole vortex, purple dark energy, gravitational pull effect, trapped in darkness, retro game style, 16:9 aspect ratio";
  
  console.log('[闇 GIF] 🌀 Generating darkness prison visual...');
  
  // Try Replicate first, fall back to DevvAI
  try {
    const result = await replicate.textToImage({
      model: 'black-forest-labs/flux-schnell',
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (result.images && result.images.length > 0) {
      console.log('[闇 GIF] ✅ Generated successfully');
      return result.images[0];
    }
  } catch (error) {
    console.warn('[闇 GIF] ⚠️ Replicate failed, using DevvAI');
  }
  
  // DevvAI fallback
  const devvResult = await imageGen.textToImage({
    prompt,
    aspect_ratio: '16:9',
    output_format: 'png'
  });
  
  return devvResult.images[0];
}
