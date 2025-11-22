/**
 * Animation GIF Cache System
 * 
 * Database-backed GIF caching to eliminate repeated generation costs.
 * GIFs are generated ONCE and stored permanently for reuse.
 * 
 * Cost Structure:
 * - First generation: ~$0.003 per GIF (Replicate flux-schnell)
 * - Subsequent uses: $0.00 (cached from database)
 * - Typical session: 3-5 unique GIFs generated, rest cached
 * - Cost per session: ~$0.009-0.015 for new GIFs only
 */

import { table } from '@devvai/devv-code-backend';

const ANIMATION_CACHE_TABLE_ID = 'f4ja6x2njuhc'; // animation_gif_cache table

export interface CachedGIF {
  cache_key: string; // Unique identifier: powerType_strengthRange (e.g., "red_roc_50-75")
  gif_url: string; // Generated GIF URL
  power_type: string; // e.g., 'red_roc', 'haki_conqueror'
  strength_range: string; // e.g., '1-25', '26-50', '51-75', '76-100'
  generation_date: string;
  use_count: number; // Track how often it's been reused
  prompt_used: string; // Original prompt for regeneration if needed
  model_used: string; // Which Replicate model was used
}

/**
 * Generate cache key from power type and strength level
 */
export function generateCacheKey(powerType: string, strength: number): string {
  // Bucket strength into ranges for better cache efficiency
  let strengthRange: string;
  if (strength <= 25) strengthRange = '1-25';
  else if (strength <= 50) strengthRange = '26-50';
  else if (strength <= 75) strengthRange = '51-75';
  else strengthRange = '76-100';
  
  return `${powerType}_${strengthRange}`;
}

/**
 * Check if GIF exists in cache
 */
export async function getCachedGIF(powerType: string, strength: number): Promise<string | null> {
  const cacheKey = generateCacheKey(powerType, strength);
  
  try {
    const results = await table.getItems(ANIMATION_CACHE_TABLE_ID, {
      limit: 100 // Get more items and filter manually
    });
    
    // Find matching cache_key
    const cached = results.items?.find((item: any) => item.cache_key === cacheKey);
    
    if (cached) {
      
      // Increment use count
      await table.updateItem(ANIMATION_CACHE_TABLE_ID, {
        _id: cached._id,
        use_count: (cached.use_count || 0) + 1
      });
      
      console.log(`✅ [GIF Cache] HIT - ${cacheKey} (used ${cached.use_count + 1} times)`);
      return cached.gif_url;
    }
    
    console.log(`❌ [GIF Cache] MISS - ${cacheKey} (will generate)`);
    return null;
  } catch (error) {
    console.error('[GIF Cache] Error checking cache:', error);
    return null;
  }
}

/**
 * Store generated GIF in cache
 */
export async function cacheGeneratedGIF(
  powerType: string,
  strength: number,
  gifUrl: string,
  promptUsed: string,
  modelUsed: string
): Promise<void> {
  const cacheKey = generateCacheKey(powerType, strength);
  
  try {
    await table.addItem(ANIMATION_CACHE_TABLE_ID, {
      cache_key: cacheKey,
      gif_url: gifUrl,
      power_type: powerType,
      strength_range: cacheKey.split('_')[1],
      generation_date: new Date().toISOString(),
      use_count: 0,
      prompt_used: promptUsed,
      model_used: modelUsed
    });
    
    console.log(`💾 [GIF Cache] STORED - ${cacheKey} → ${gifUrl}`);
  } catch (error) {
    console.error('[GIF Cache] Error storing cache:', error);
  }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStatistics(): Promise<{
  total_gifs: number;
  total_reuses: number;
  cost_saved: number; // Estimated cost saved from cache hits
  by_power_type: Record<string, number>;
}> {
  try {
    const results = await table.getItems(ANIMATION_CACHE_TABLE_ID, {
      limit: 1000 // Reasonable limit
    });
    
    let totalReuses = 0;
    const byPowerType: Record<string, number> = {};
    
    if (results.items) {
      results.items.forEach((item: any) => {
        totalReuses += item.use_count || 0;
        byPowerType[item.power_type] = (byPowerType[item.power_type] || 0) + (item.use_count || 0);
      });
    }
    
    return {
      total_gifs: results.items?.length || 0,
      total_reuses: totalReuses,
      cost_saved: totalReuses * 0.003, // $0.003 per GIF
      by_power_type: byPowerType
    };
  } catch (error) {
    console.error('[GIF Cache] Error getting statistics:', error);
    return {
      total_gifs: 0,
      total_reuses: 0,
      cost_saved: 0,
      by_power_type: {}
    };
  }
}

/**
 * Clear old cache entries (optional maintenance)
 * Only remove entries older than 30 days with low use count
 */
export async function cleanupOldCache(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const results = await table.getItems(ANIMATION_CACHE_TABLE_ID, {
      limit: 1000
    });
    
    let deletedCount = 0;
    
    if (results.items) {
      for (const item of results.items) {
        const generationDate = new Date(item.generation_date);
        const useCount = item.use_count || 0;
        
        // Delete if old AND rarely used
        if (generationDate < thirtyDaysAgo && useCount < 3) {
          await table.deleteItem(ANIMATION_CACHE_TABLE_ID, {
            _id: item._id
          });
          deletedCount++;
        }
      }
    }
    
    console.log(`🧹 [GIF Cache] Cleaned up ${deletedCount} old entries`);
    return deletedCount;
  } catch (error) {
    console.error('[GIF Cache] Error during cleanup:', error);
    return 0;
  }
}
