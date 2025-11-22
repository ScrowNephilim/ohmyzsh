/**
 * Attack GIF Generator - Phase 5 Complete
 * Generates GIFs for all 4 Rocks D. Xebec attack powers:
 * 1. 廃止 (Uchigatana) - Black lightning katana strike
 * 2. 心綱 (Observation) - Prediction visual
 * 3. 深淵 (Pandemonium) - Devastation effect
 * 4. 闇 (Darkness) - Black hole prison
 * 
 * Fallback chain: flux-kontext-pro → flux-schnell → hidream-l1-fast → DevvAI
 */

import { replicate } from '@devvai/devv-code-backend';
import { imageGen } from '@devvai/devv-code-backend';

export interface AttackGIFResult {
  gifUrl: string;
  model: 'flux-kontext-pro' | 'flux-schnell' | 'hidream-l1-fast' | 'devvai';
  generationTime: number;
  attackType: '廃止' | '心綱' | '深淵' | '闇';
}

/**
 * Generic GIF generation with Replicate fallback chain
 * Tries 3 Replicate models before falling back to DevvAI
 */
async function generateWithFallback(
  prompt: string,
  attackType: '廃止' | '心綱' | '深淵' | '闇'
): Promise<AttackGIFResult> {
  const startTime = Date.now();
  
  console.log(`[${attackType} GIF] 🎨 Generating visual effect...`);
  console.log(`[${attackType} GIF] 📝 Prompt: ${prompt}`);
  
  // Try 1: flux-kontext-pro (best quality, context-aware)
  try {
    console.log(`[${attackType}] 🖼️ Trying flux-kontext-pro (context-aware)...`);
    const result = await replicate.textToImage({
      model: 'black-forest-labs/flux-kontext-pro',
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (result.images && result.images.length > 0) {
      const gifUrl = result.images[0];
      const generationTime = Date.now() - startTime;
      console.log(`[${attackType}] ✅ flux-kontext-pro success in ${generationTime}ms`);
      console.log(`[${attackType}] 🖼️ GIF URL: ${gifUrl}`);
      return { gifUrl, model: 'flux-kontext-pro', generationTime, attackType };
    }
  } catch (error: any) {
    console.warn(`[${attackType}] ⚠️ flux-kontext-pro failed:`, error.message);
  }
  
  // Try 2: flux-schnell (fast, good quality)
  try {
    console.log(`[${attackType}] 🖼️ Trying flux-schnell (fast)...`);
    const result = await replicate.textToImage({
      model: 'black-forest-labs/flux-schnell',
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (result.images && result.images.length > 0) {
      const gifUrl = result.images[0];
      const generationTime = Date.now() - startTime;
      console.log(`[${attackType}] ✅ flux-schnell success in ${generationTime}ms`);
      console.log(`[${attackType}] 🖼️ GIF URL: ${gifUrl}`);
      return { gifUrl, model: 'flux-schnell', generationTime, attackType };
    }
  } catch (error: any) {
    console.warn(`[${attackType}] ⚠️ flux-schnell failed:`, error.message);
  }
  
  // Try 3: hidream-l1-fast (optimized fast)
  try {
    console.log(`[${attackType}] 🖼️ Trying hidream-l1-fast (optimized)...`);
    const result = await replicate.textToImage({
      model: 'prunaai/hidream-l1-fast',
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    if (result.images && result.images.length > 0) {
      const gifUrl = result.images[0];
      const generationTime = Date.now() - startTime;
      console.log(`[${attackType}] ✅ hidream-l1-fast success in ${generationTime}ms`);
      console.log(`[${attackType}] 🖼️ GIF URL: ${gifUrl}`);
      return { gifUrl, model: 'hidream-l1-fast', generationTime, attackType };
    }
  } catch (error: any) {
    console.warn(`[${attackType}] ⚠️ hidream-l1-fast failed:`, error.message);
  }
  
  // Final fallback: DevvAI (always free)
  try {
    console.log(`[${attackType}] 🖼️ DevvAI fallback...`);
    const result = await imageGen.textToImage({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png'
    });
    
    const gifUrl = result.images[0];
    const generationTime = Date.now() - startTime;
    console.log(`[${attackType}] ✅ DevvAI success in ${generationTime}ms`);
    console.log(`[${attackType}] 🖼️ GIF URL: ${gifUrl}`);
    return { gifUrl, model: 'devvai', generationTime, attackType };
  } catch (error: any) {
    console.error(`[${attackType}] ❌ All generation attempts failed:`, error.message);
    throw new Error(`All image generation attempts failed for ${attackType}: ${error.message}`);
  }
}

/**
 * 廃止 (Uchigatana Strike) - Black Lightning Katana Attack
 * Strength-adaptive visual intensity
 */
export async function generateHaishiGIF(strength: number): Promise<AttackGIFResult> {
  // Adapt prompt to strength
  let intensityDescriptor = 'fierce';
  let lightningDescriptor = 'crackling black lightning';
  let environmentDescriptor = 'dark atmospheric background';
  
  if (strength >= 80) {
    intensityDescriptor = 'catastrophic devastating';
    lightningDescriptor = 'massive torrents of black lightning exploding';
    environmentDescriptor = 'obliterated environment with debris and shockwaves';
  } else if (strength >= 60) {
    intensityDescriptor = 'devastating powerful';
    lightningDescriptor = 'intense waves of black lightning surging';
    environmentDescriptor = 'cracking ground with energy discharge';
  } else if (strength >= 40) {
    intensityDescriptor = 'powerful';
    lightningDescriptor = 'strong black lightning streaks';
    environmentDescriptor = 'distorted air with energy ripples';
  }
  
  const prompt = `8-bit pixel art samurai katana slash, ${intensityDescriptor} ${lightningDescriptor}, crimson red Conqueror's Haki aura glowing intensely, dramatic sword motion blur, retro game style 16:9 aspect ratio, ${environmentDescriptor}, extreme high contrast dramatic lighting`;
  
  console.log(`[廃止] ⚔️ Generating katana strike GIF (strength: ${strength})...`);
  
  return generateWithFallback(prompt, '廃止');
}

/**
 * 心綱 (Observation Haki) - Future Vision Prediction
 * Shows ghostly outlines of next 3 actions
 */
export async function generateShinkouGIF(targetCount: number): Promise<AttackGIFResult> {
  const prompt = `8-bit pixel art mind's eye third eye opening, swirling white ethereal energy, ghostly transparent prediction outlines showing ${targetCount} future action${targetCount > 1 ? 's' : ''}, prophetic vision effect, retro game style 16:9 aspect ratio, mystical white and blue aura, ultra-high perception visual`;
  
  console.log(`[心綱] 👁️ Generating observation haki prediction GIF (${targetCount} targets)...`);
  
  return generateWithFallback(prompt, '心綱');
}

/**
 * 深淵 (Pandemonium) - Devastation Effect
 * Massive area damage and environmental destruction
 */
export async function generateShinEnGIF(strength: number): Promise<AttackGIFResult> {
  // Adapt devastation scale to strength
  let devastationLevel = 'significant destruction';
  let effectDescriptor = 'explosive shockwaves';
  
  if (strength >= 80) {
    devastationLevel = 'complete obliteration of landscape';
    effectDescriptor = 'apocalyptic cataclysmic explosions with massive debris clouds';
  } else if (strength >= 60) {
    devastationLevel = 'catastrophic wide-area devastation';
    effectDescriptor = 'enormous explosive blasts with flying rubble';
  } else if (strength >= 40) {
    devastationLevel = 'heavy structural destruction';
    effectDescriptor = 'powerful explosive bursts with shattered terrain';
  }
  
  const prompt = `8-bit pixel art pandemonium devastation effect, ${effectDescriptor}, ${devastationLevel}, dark orange and crimson red energy waves, retro game style 16:9 aspect ratio, extreme chaos and destruction visual, shockwave ripples spreading`;
  
  console.log(`[深淵] 🔥 Generating pandemonium devastation GIF (strength: ${strength})...`);
  
  return generateWithFallback(prompt, '深淵');
}

/**
 * 闇 (Darkness - Black Hole Prison)
 * Generates different visuals based on action:
 * - Initial activation: Black hole vortex prison
 * - Kurouzu: Gravitational pull effect
 * - Liberation: Explosive ejection
 */
export async function generateYamiGIF(
  action: 'prison' | 'kurouzu' | 'liberation',
  strength: number
): Promise<AttackGIFResult> {
  let prompt = '';
  
  switch (action) {
    case 'prison':
      prompt = `8-bit pixel art swirling black hole vortex portal, dark purple gravitational energy spiraling inward, targets being pulled into darkness prison, retro game style 16:9 aspect ratio, ominous void effect with event horizon, gravity distortion visual`;
      console.log(`[闇] ⚫ Generating black hole prison GIF (strength: ${strength})...`);
      break;
      
    case 'kurouzu':
      prompt = `8-bit pixel art intense gravitational pull effect, dark purple energy tendrils extending outward, targets being forcefully dragged closer, retro game style 16:9 aspect ratio, vacuum suction visual with motion lines converging, powerful attraction force`;
      console.log(`[闇] 🌀 Generating Kurouzu gravitational pull GIF...`);
      break;
      
    case 'liberation':
      // Liberation damage scales with original prison strength
      let explosionScale = 'moderate explosive ejection';
      if (strength >= 80) {
        explosionScale = 'catastrophic explosive liberation with devastating shockwaves';
      } else if (strength >= 60) {
        explosionScale = 'massive explosive release with severe impact';
      }
      
      prompt = `8-bit pixel art black hole collapsing and exploding, ${explosionScale}, targets being violently ejected from darkness, dark purple and white energy burst, retro game style 16:9 aspect ratio, liberation impact visual`;
      console.log(`[闇] 💥 Generating Liberation explosion GIF (strength: ${strength})...`);
      break;
  }
  
  return generateWithFallback(prompt, '闇');
}

/**
 * Self-Hide in Shadows (闇 on self)
 * User becomes undetectable in darkness
 */
export async function generateYamiShadowHideGIF(): Promise<AttackGIFResult> {
  const prompt = `8-bit pixel art figure dissolving into shadows, dark purple smoke enveloping silhouette, complete invisibility effect with only faint dark aura remaining, retro game style 16:9 aspect ratio, stealth camouflage visual, undetectable presence`;
  
  console.log(`[闇] 👤 Generating shadow hide stealth GIF...`);
  
  return generateWithFallback(prompt, '闇');
}

/**
 * Display generated GIF as overlay
 * @param gifUrl - URL of generated GIF
 * @param duration - How long to display (ms)
 */
export function displayAttackGIF(gifUrl: string, duration: number = 3000): void {
  console.log(`[Attack GIF] 🎬 Displaying GIF for ${duration}ms`);
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in;
  `;
  
  const img = document.createElement('img');
  img.src = gifUrl;
  img.style.cssText = `
    max-width: 80%;
    max-height: 80%;
    border-radius: 12px;
    box-shadow: 0 10px 50px rgba(0,0,0,0.8);
    object-fit: contain;
  `;
  
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  
  // Remove after duration
  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(overlay);
      console.log(`[Attack GIF] ✅ GIF display complete`);
    }, 300);
  }, duration);
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.95); }
    }
  `;
  document.head.appendChild(style);
}
