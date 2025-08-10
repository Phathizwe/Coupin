// src/services/firestore/cache/cacheManager.ts

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly MAX_MEMORY_ENTRIES = 1000;
  
  /**
   * Get data from cache (memory first, then localStorage)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.data;
    }
    
    // Check localStorage cache
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (this.isValidEntry(entry)) {
          // Promote to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Cache retrieval error:', error);
    }
    
    return null;
  }
  
  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    // Store in memory cache
    this.memoryCache.set(key, entry);
    this.enforceMemoryLimit();
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      // Handle localStorage quota exceeded
      this.clearOldestLocalStorageEntries();
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (secondError) {
        console.warn('Failed to cache in localStorage:', secondError);
      }
    }
  }
  
  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string): void {
    // Clear memory cache - using Array.from instead of iterator
    const keysToDelete: string[] = [];
    
    // Convert keys iterator to array first to avoid iterator issues
    Array.from(this.memoryCache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    
    // Delete the keys
    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    // Clear localStorage cache
    const localStorageKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && key.includes(pattern)) {
        localStorageKeysToRemove.push(key);
  }
}
    localStorageKeysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  /**
   * Check if cache entry is still valid
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }
  
  /**
   * Enforce memory cache size limit
   */
  private enforceMemoryLimit(): void {
    if (this.memoryCache.size > this.MAX_MEMORY_ENTRIES) {
      // Remove oldest entries (simple LRU)
      // Convert entries iterator to array first
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(this.MAX_MEMORY_ENTRIES * 0.2));
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }
  
  /**
   * Clear oldest localStorage entries when quota exceeded
   */
  private clearOldestLocalStorageEntries(): void {
    const cacheEntries: Array<{ key: string; timestamp: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          cacheEntries.push({ key, timestamp: entry.timestamp || 0 });
        } catch (error) {
          // Remove malformed entries
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp and remove oldest 20%
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = cacheEntries.slice(0, Math.floor(cacheEntries.length * 0.2));
    toRemove.forEach(({ key }) => localStorage.removeItem(key));
  }
}