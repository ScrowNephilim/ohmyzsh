/**
 * Chroma Cache System
 * Optimizes environment state loading by caching database queries
 * Reduces redundant database operations with intelligent TTL and lazy refresh
 * 
 * CRITICAL: Uses generic types to prevent circular dependencies
 * No imports from chroma-types.ts - calling code handles typing
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds
  lazyRefresh?: boolean; // Return stale data and refresh in background
}

class ChromaCache {
  private environmentCache = new Map<string, CacheEntry<any>>();
  private nephilimCache = new Map<string, CacheEntry<any>>();
  private nephilimListCache: CacheEntry<any[]> | null = null;
  
  // Default TTLs (in milliseconds)
  private readonly DEFAULT_ENV_TTL = 60000; // 1 minute for environments
  private readonly DEFAULT_NEPHILIM_TTL = 300000; // 5 minutes for Nephilims
  private readonly DEFAULT_LIST_TTL = 300000; // 5 minutes for Nephilim list
  
  // Max cache size (prevent memory leaks)
  private readonly MAX_ENV_CACHE_SIZE = 50;
  private readonly MAX_NEPHILIM_CACHE_SIZE = 100;

  /**
   * Get cached environment or return null if expired
   */
  getEnvironment(envId: string, options?: CacheOptions): any | null {
    const entry = this.environmentCache.get(envId);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now > entry.expiresAt;

    if (isExpired && !options?.lazyRefresh) {
      this.environmentCache.delete(envId);
      return null;
    }

    console.log(`[Chroma Cache] 🎯 Environment cache HIT: ${envId} (age: ${Math.floor((now - entry.timestamp) / 1000)}s)`);
    return entry.data;
  }

  /**
   * Cache environment data
   */
  setEnvironment(envId: string, data: any, ttl?: number): void {
    const now = Date.now();
    const effectiveTTL = ttl ?? this.DEFAULT_ENV_TTL;

    this.environmentCache.set(envId, {
      data,
      timestamp: now,
      expiresAt: now + effectiveTTL
    });

    console.log(`[Chroma Cache] 💾 Environment cached: ${envId} (TTL: ${Math.floor(effectiveTTL / 1000)}s)`);
    
    // Enforce max size
    this.enforceMaxSize(this.environmentCache, this.MAX_ENV_CACHE_SIZE);
  }

  /**
   * Get cached Nephilim by name
   */
  getNephilim(name: string, options?: CacheOptions): any | null {
    const entry = this.nephilimCache.get(name);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now > entry.expiresAt;

    if (isExpired && !options?.lazyRefresh) {
      this.nephilimCache.delete(name);
      return null;
    }

    console.log(`[Chroma Cache] 🎯 Nephilim cache HIT: ${name} (age: ${Math.floor((now - entry.timestamp) / 1000)}s)`);
    return entry.data;
  }

  /**
   * Cache Nephilim data
   */
  setNephilim(name: string, data: any, ttl?: number): void {
    const now = Date.now();
    const effectiveTTL = ttl ?? this.DEFAULT_NEPHILIM_TTL;

    this.nephilimCache.set(name, {
      data,
      timestamp: now,
      expiresAt: now + effectiveTTL
    });

    console.log(`[Chroma Cache] 💾 Nephilim cached: ${name} (TTL: ${Math.floor(effectiveTTL / 1000)}s)`);
    
    // Enforce max size
    this.enforceMaxSize(this.nephilimCache, this.MAX_NEPHILIM_CACHE_SIZE);
  }

  /**
   * Get cached Nephilim list
   */
  getNephilimList(options?: CacheOptions): any[] | null {
    if (!this.nephilimListCache) return null;

    const now = Date.now();
    const isExpired = now > this.nephilimListCache.expiresAt;

    if (isExpired && !options?.lazyRefresh) {
      this.nephilimListCache = null;
      return null;
    }

    console.log(`[Chroma Cache] 🎯 Nephilim list cache HIT (age: ${Math.floor((now - this.nephilimListCache.timestamp) / 1000)}s)`);
    return this.nephilimListCache.data;
  }

  /**
   * Cache Nephilim list
   */
  setNephilimList(data: any[], ttl?: number): void {
    const now = Date.now();
    const effectiveTTL = ttl ?? this.DEFAULT_LIST_TTL;

    this.nephilimListCache = {
      data,
      timestamp: now,
      expiresAt: now + effectiveTTL
    };

    console.log(`[Chroma Cache] 💾 Nephilim list cached (count: ${data.length}, TTL: ${Math.floor(effectiveTTL / 1000)}s)`);
  }

  /**
   * Invalidate environment cache
   */
  invalidateEnvironment(envId: string): void {
    const deleted = this.environmentCache.delete(envId);
    if (deleted) {
      console.log(`[Chroma Cache] 🗑️ Environment cache invalidated: ${envId}`);
    }
  }

  /**
   * Invalidate Nephilim cache
   */
  invalidateNephilim(name: string): void {
    const deleted = this.nephilimCache.delete(name);
    if (deleted) {
      console.log(`[Chroma Cache] 🗑️ Nephilim cache invalidated: ${name}`);
    }
  }

  /**
   * Invalidate all Nephilim list cache
   */
  invalidateNephilimList(): void {
    this.nephilimListCache = null;
    console.log('[Chroma Cache] 🗑️ Nephilim list cache invalidated');
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.environmentCache.clear();
    this.nephilimCache.clear();
    this.nephilimListCache = null;
    console.log('[Chroma Cache] 🧹 All caches cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    
    const envStats = Array.from(this.environmentCache.entries()).map(([id, entry]) => ({
      id,
      age: Math.floor((now - entry.timestamp) / 1000),
      ttl: Math.floor((entry.expiresAt - now) / 1000),
      expired: now > entry.expiresAt
    }));

    const nephilimStats = Array.from(this.nephilimCache.entries()).map(([name, entry]) => ({
      name,
      age: Math.floor((now - entry.timestamp) / 1000),
      ttl: Math.floor((entry.expiresAt - now) / 1000),
      expired: now > entry.expiresAt
    }));

    const listStats = this.nephilimListCache ? {
      age: Math.floor((now - this.nephilimListCache.timestamp) / 1000),
      ttl: Math.floor((this.nephilimListCache.expiresAt - now) / 1000),
      expired: now > this.nephilimListCache.expiresAt,
      count: this.nephilimListCache.data.length
    } : null;

    return {
      environments: {
        count: this.environmentCache.size,
        maxSize: this.MAX_ENV_CACHE_SIZE,
        entries: envStats
      },
      nephilims: {
        count: this.nephilimCache.size,
        maxSize: this.MAX_NEPHILIM_CACHE_SIZE,
        entries: nephilimStats
      },
      nephilimList: listStats
    };
  }

  /**
   * Enforce maximum cache size (LRU eviction)
   */
  private enforceMaxSize<T>(cache: Map<string, CacheEntry<T>>, maxSize: number): void {
    if (cache.size <= maxSize) return;

    // Find oldest entries
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until we're under max size
    const toRemove = cache.size - maxSize;
    for (let i = 0; i < toRemove; i++) {
      cache.delete(entries[i][0]);
    }

    console.log(`[Chroma Cache] ⚠️ LRU eviction: removed ${toRemove} old entries`);
  }

  /**
   * Check if cache entry exists and is valid
   */
  isValid(key: string, cacheType: 'environment' | 'nephilim'): boolean {
    const cache = cacheType === 'environment' ? this.environmentCache : this.nephilimCache;
    const entry = cache.get(key);
    if (!entry) return false;

    return Date.now() <= entry.expiresAt;
  }
}

// TRUE lazy singleton pattern - NEVER instantiated at module-load time
let cacheInstance: ChromaCache | undefined;

/**
 * Get or create the cache instance lazily
 * CRITICAL: This function is ONLY called from within exported function bodies,
 * NEVER at module-load time. This prevents bundler from creating circular refs.
 */
function getCacheInstance(): ChromaCache {
  if (!cacheInstance) {
    console.log('[Chroma Cache] 🚀 Initializing cache instance (truly lazy)');
    cacheInstance = new ChromaCache();
  }
  return cacheInstance;
}

// Force cache reset (for dev mode cleanup)
export function resetChromaCache(): void {
  if (cacheInstance) {
    cacheInstance.clearAll();
    cacheInstance = undefined;
    console.log('[Chroma Cache] 🔄 Cache instance reset (dev mode)');
  }
}

// CRITICAL: Export individual functions with METHOD DECLARATIONS (not arrow functions)
// This prevents bundler from evaluating function bodies at module-load time
// NO TYPE IMPORTS - uses `any` to prevent circular dependencies with chroma-types.ts
// Calling code (chroma-engine.ts) handles proper typing

export function getEnvironment(envId: string, options?: CacheOptions) {
  return getCacheInstance().getEnvironment(envId, options);
}

export function setEnvironment(envId: string, data: any, ttl?: number) {
  getCacheInstance().setEnvironment(envId, data, ttl);
}

export function getNephilim(name: string, options?: CacheOptions) {
  return getCacheInstance().getNephilim(name, options);
}

export function setNephilim(name: string, data: any, ttl?: number) {
  getCacheInstance().setNephilim(name, data, ttl);
}

export function getNephilimList(options?: CacheOptions) {
  return getCacheInstance().getNephilimList(options);
}

export function setNephilimList(data: any[], ttl?: number) {
  getCacheInstance().setNephilimList(data, ttl);
}

export function invalidateEnvironment(envId: string) {
  getCacheInstance().invalidateEnvironment(envId);
}

export function invalidateNephilim(name: string) {
  getCacheInstance().invalidateNephilim(name);
}

export function invalidateNephilimList() {
  getCacheInstance().invalidateNephilimList();
}

export function clearAll() {
  getCacheInstance().clearAll();
}

export function getStats() {
  return getCacheInstance().getStats();
}

export function isValid(key: string, cacheType: 'environment' | 'nephilim') {
  return getCacheInstance().isValid(key, cacheType);
}
