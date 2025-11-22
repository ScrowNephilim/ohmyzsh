/**
 * Portal Transition GIF Generator
 * Creates smooth pixel art animated portals for Chroma entry
 * CREDIT-EFFICIENT: Uses Replicate flux-schnell (4 inference steps) with DevvAI fallback
 */

import { replicate, imageGen } from '@devvai/devv-code-backend';

export interface PortalTransitionConfig {
  style: 'wormhole' | 'matrix_cascade' | 'vortex' | 'hyperspace' | 'digital_gateway';
  colorScheme: 'matrix_green' | 'cyber_purple' | 'neon_blue' | 'fire_red' | 'rainbow';
  duration: 'fast' | 'medium' | 'slow'; // Affects prompt description
  pixelDensity: 'chunky' | 'medium' | 'fine';
}

/**
 * Generate animated pixel art portal transition
 * Cost: ~$0.003 per generation with Replicate, $0.00 with DevvAI fallback
 */
export async function generatePortalTransition(
  config: PortalTransitionConfig = {
    style: 'wormhole',
    colorScheme: 'matrix_green',
    duration: 'medium',
    pixelDensity: 'chunky'
  }
): Promise<string | null> {
  try {
    console.log('[Portal Transition] 🌀 Generating pixel art portal:', config);
    
    // Build style-specific prompt
    let stylePrompt = '';
    
    switch (config.style) {
      case 'wormhole':
        stylePrompt = 'spiral wormhole vortex tunnel, swirling circular portal, expanding rings, depth perspective, tunnel entrance';
        break;
      case 'matrix_cascade':
        stylePrompt = 'cascading matrix code rain, falling green characters, binary digits streaming, vertical code waterfall';
        break;
      case 'vortex':
        stylePrompt = 'spinning energy vortex, rotating spiral portal, cosmic gateway, star field tunnel';
        break;
      case 'hyperspace':
        stylePrompt = 'hyperspace light streaks, warp speed lines, light tunnel, FTL jump animation';
        break;
      case 'digital_gateway':
        stylePrompt = 'glitching digital gateway, pixelated portal opening, cyber entrance, data stream tunnel';
        break;
    }
    
    // Color scheme mapping
    let colorPrompt = '';
    
    switch (config.colorScheme) {
      case 'matrix_green':
        colorPrompt = 'bright matrix green, neon lime, digital green glow, phosphor green';
        break;
      case 'cyber_purple':
        colorPrompt = 'vivid cyber purple, neon violet, magenta accents, electric purple glow';
        break;
      case 'neon_blue':
        colorPrompt = 'electric neon blue, cyan accents, bright turquoise, digital blue glow';
        break;
      case 'fire_red':
        colorPrompt = 'fiery red orange, flame colors, hot crimson, burning amber';
        break;
      case 'rainbow':
        colorPrompt = 'rainbow spectrum colors, multi-color gradient, vibrant chromatic, full spectrum';
        break;
    }
    
    // Pixel density
    let pixelPrompt = '';
    
    switch (config.pixelDensity) {
      case 'chunky':
        pixelPrompt = 'highly pixelated 8-bit, extremely chunky square pixels, blocky low-res';
        break;
      case 'medium':
        pixelPrompt = 'moderately pixelated 16-bit, medium pixel blocks, retro game style';
        break;
      case 'fine':
        pixelPrompt = 'finely pixelated 32-bit, small pixel detail, high-res pixel art';
        break;
    }
    
    // Duration/speed
    let animationPrompt = '';
    
    switch (config.duration) {
      case 'fast':
        animationPrompt = 'fast spinning animation, rapid movement, quick rotation';
        break;
      case 'medium':
        animationPrompt = 'smooth flowing animation, steady movement, continuous rotation';
        break;
      case 'slow':
        animationPrompt = 'slow hypnotic animation, gradual movement, calm rotation';
        break;
    }
    
    // Complete prompt
    const prompt = `${pixelPrompt}, ${stylePrompt}, ${colorPrompt}, ${animationPrompt}, retro video game portal, looping animation GIF, centered composition, black background, glowing portal effect, no text, no characters, clean simple design`;
    
    console.log('[Portal Transition] 📝 Prompt:', prompt.substring(0, 150) + '...');
    
    // Try Replicate first (50% faster, more reliable for GIFs)
    try {
      const replicateResult = await replicate.textToImage({
        prompt,
        model: 'black-forest-labs/flux-schnell',
        aspect_ratio: '1:1', // Square portal
        output_format: 'png',
        num_outputs: 1,
        num_inference_steps: 4 // Fast generation
      });
      
      if (replicateResult.images && replicateResult.images.length > 0) {
        console.log('[Portal Transition] ✅ Generated pixel art portal (Replicate)');
        return replicateResult.images[0];
      }
    } catch (replicateError) {
      console.warn('[Portal Transition] ⚠️ Replicate failed, falling back to DevvAI:', 
        replicateError instanceof Error 
          ? { message: replicateError.message, name: replicateError.name } 
          : replicateError
      );
    }
    
    // Fallback to DevvAI (always works, zero external cost)
    console.log('[Portal Transition] 🔄 Using DevvAI fallback');
    const devvResult = await imageGen.textToImage({
      prompt,
      aspect_ratio: '1:1',
      output_format: 'png',
      num_outputs: 1
    });
    
    if (devvResult.images && devvResult.images.length > 0) {
      console.log('[Portal Transition] ✅ Generated portal (DevvAI fallback)');
      return devvResult.images[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Portal Transition] ❌ All generation methods failed:', 
      error instanceof Error 
        ? { message: error.message, name: error.name, stack: error.stack } 
        : error
    );
    return null;
  }
}

/**
 * Get random portal configuration
 */
export function getRandomPortalConfig(): PortalTransitionConfig {
  const styles: PortalTransitionConfig['style'][] = ['wormhole', 'matrix_cascade', 'vortex', 'hyperspace', 'digital_gateway'];
  const colors: PortalTransitionConfig['colorScheme'][] = ['matrix_green', 'cyber_purple', 'neon_blue', 'fire_red', 'rainbow'];
  const densities: PortalTransitionConfig['pixelDensity'][] = ['chunky', 'medium', 'fine'];
  
  return {
    style: styles[Math.floor(Math.random() * styles.length)],
    colorScheme: colors[Math.floor(Math.random() * colors.length)],
    duration: 'medium',
    pixelDensity: densities[Math.floor(Math.random() * densities.length)]
  };
}

/**
 * Get themed portal configuration (matches Chroma aesthetic)
 */
export function getChromaPortalConfig(): PortalTransitionConfig {
  return {
    style: 'wormhole',
    colorScheme: 'matrix_green',
    duration: 'medium',
    pixelDensity: 'chunky' // Matches existing pixel art aesthetic
  };
}

/**
 * Portal transition cache for instant re-entry
 */
const portalCache = new Map<string, string>();

/**
 * Generate or retrieve cached portal
 */
export async function getCachedPortal(config: PortalTransitionConfig): Promise<string | null> {
  const cacheKey = `${config.style}_${config.colorScheme}_${config.pixelDensity}`;
  
  // Check cache first (instant, zero cost)
  if (portalCache.has(cacheKey)) {
    console.log('[Portal Transition] ✨ Using cached portal');
    return portalCache.get(cacheKey)!;
  }
  
  // Generate new portal
  const portalUrl = await generatePortalTransition(config);
  
  // Cache for future use
  if (portalUrl) {
    portalCache.set(cacheKey, portalUrl);
  }
  
  return portalUrl;
}

/**
 * Clear portal cache (if memory becomes an issue)
 */
export function clearPortalCache() {
  portalCache.clear();
  console.log('[Portal Transition] 🗑️ Portal cache cleared');
}
