/* eslint-disable @typescript-eslint/no-explicit-any */
// Cache Manager for BGG Service
// Implements intelligent caching with adaptive TTL and size management

import { CACHE_CONFIG } from './config'
import type { SearchCacheEntry, CacheStats, BGGSearchResult, BGGAPIMetadata } from './types'

export class CacheManager {
  private searchCache: Map<string, SearchCacheEntry> = new Map()
  private metadataCache: Map<string, { data: BGGAPIMetadata; timestamp: number }> = new Map()
  private cacheHits: number = 0
  private totalQueries: number = 0

  constructor() {
    // Set up periodic cleanup
    this.startCleanupInterval()
  }

  /**
   * Get cached search results
   */
  getCachedSearch(query: string, filters?: any): BGGSearchResult[] | null {
    const cacheKey = this.buildSearchCacheKey(query, filters)
    const entry = this.searchCache.get(cacheKey)
    
    if (!entry) {
      this.totalQueries++
      return null
    }

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.searchCache.delete(cacheKey)
      this.totalQueries++
      return null
    }

    this.cacheHits++
    this.totalQueries++
    return entry.results
  }

  /**
   * Set cached search results
   */
  setCachedSearch(
    query: string, 
    results: BGGSearchResult[], 
    searchTime: number, 
    filters?: any
  ): void {
    const cacheKey = this.buildSearchCacheKey(query, filters)
    
    // Calculate TTL based on search time and result count
    const ttl = this.calculateSearchTTL(searchTime, results.length)
    
    const entry: SearchCacheEntry = {
      query,
      filters: filters || {},
      results,
      timestamp: Date.now(),
      ttl
    }

    this.searchCache.set(cacheKey, entry)
    
    // Enforce cache size limit
    this.enforceCacheSizeLimit()
  }

  /**
   * Get cached metadata for multiple games
   */
  async getCachedMetadata(gameIds: string[]): Promise<BGGAPIMetadata[]> {
    const results: BGGAPIMetadata[] = []
    const uncachedIds: string[] = []

    for (const gameId of gameIds) {
      const cached = this.metadataCache.get(gameId)
      if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.METADATA_TTL) {
        results.push(cached.data)
        this.cacheHits++
      } else {
        uncachedIds.push(gameId)
        if (cached) {
          this.metadataCache.delete(gameId) // Remove expired entry
        }
      }
    }

    this.totalQueries += gameIds.length
    return results
  }

  /**
   * Cache metadata for multiple games
   */
  async cacheMetadataBatch(metadata: BGGAPIMetadata[]): Promise<void> {
    const now = Date.now()
    
    metadata.forEach(item => {
      if (item.id) {
        this.metadataCache.set(item.id, {
          data: item,
          timestamp: now
        })
      }
    })

    // Enforce cache size limit
    this.enforceMetadataCacheSizeLimit()
  }

  /**
   * Get cached game data
   */
  getCachedGameData(gameId: string): any | null {
    const cached = this.metadataCache.get(gameId)
    
    if (!cached) {
      this.totalQueries++
      return null
    }

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > CACHE_CONFIG.GAME_DETAILS_TTL) {
      this.metadataCache.delete(gameId)
      this.totalQueries++
      return null
    }

    this.cacheHits++
    this.totalQueries++
    return cached.data
  }

  /**
   * Cache game data
   */
  async cacheGameData(gameData: any): Promise<void> {
    if (gameData.id) {
      this.metadataCache.set(gameData.id, {
        data: gameData,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Build cache key for search queries
   */
  private buildSearchCacheKey(query: string, filters?: any): string {
    if (!filters) {
      return `search:${query.toLowerCase().trim()}`
    }
    
    const filterString = JSON.stringify(filters)
    return `search:${query.toLowerCase().trim()}:${filterString}`
  }

  /**
   * Calculate TTL for search results based on performance
   */
  private calculateSearchTTL(searchTime: number, resultCount: number): number {
    // Base TTL
    let ttl = CACHE_CONFIG.SEARCH_TTL

    // Adjust based on search time (faster searches get longer cache)
    if (searchTime < 1000) {
      ttl *= 1.5 // 45 minutes for fast searches
    } else if (searchTime > 5000) {
      ttl *= 0.5 // 15 minutes for slow searches
    }

    // Adjust based on result count (more results get longer cache)
    if (resultCount > 20) {
      ttl *= 1.2 // 20% longer for comprehensive results
    } else if (resultCount < 5) {
      ttl *= 0.8 // 20% shorter for limited results
    }

    return Math.min(ttl, CACHE_CONFIG.SEARCH_TTL * 2) // Cap at 2x base TTL
  }

  /**
   * Enforce search cache size limit
   */
  private enforceCacheSizeLimit(): void {
    if (this.searchCache.size <= CACHE_CONFIG.MAX_CACHE_SIZE) {
      return
    }

    // Remove oldest entries
    const entries = Array.from(this.searchCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = entries.slice(0, this.searchCache.size - CACHE_CONFIG.MAX_CACHE_SIZE)
    toRemove.forEach(([key]) => this.searchCache.delete(key))
  }

  /**
   * Enforce metadata cache size limit
   */
  private enforceMetadataCacheSizeLimit(): void {
    if (this.metadataCache.size <= CACHE_CONFIG.MAX_CACHE_SIZE) {
      return
    }

    // Remove oldest entries
    const entries = Array.from(this.metadataCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = entries.slice(0, this.metadataCache.size - CACHE_CONFIG.MAX_CACHE_SIZE)
    toRemove.forEach(([key]) => this.metadataCache.delete(key))
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCache()
    }, CACHE_CONFIG.CLEANUP_INTERVAL)
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now()
    
    // Clean search cache
    for (const [key, entry] of this.searchCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.searchCache.delete(key)
      }
    }

    // Clean metadata cache
    for (const [key, entry] of this.metadataCache.entries()) {
      if (now - entry.timestamp > CACHE_CONFIG.METADATA_TTL) {
        this.metadataCache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const hitRate = this.totalQueries > 0 ? (this.cacheHits / this.totalQueries) * 100 : 0
    
    return {
      size: this.searchCache.size + this.metadataCache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalQueries: this.totalQueries,
      cacheHits: this.cacheHits
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.searchCache.clear()
    this.metadataCache.clear()
    this.cacheHits = 0
    this.totalQueries = 0
  }

  /**
   * Clear search cache for specific query
   */
  clearSearchCacheForQuery(query: string, filters?: any): void {
    const cacheKey = this.buildSearchCacheKey(query, filters)
    this.searchCache.delete(cacheKey)
  }

  /**
   * Get memory cache size
   */
  getMemoryCacheSize(): number {
    return this.searchCache.size + this.metadataCache.size
  }

  /**
   * Check if memory cache is empty
   */
  isMemoryCacheEmpty(): boolean {
    return this.searchCache.size === 0 && this.metadataCache.size === 0
  }

  /**
   * Get memory cache keys for debugging
   */
  getMemoryCacheKeys(): string[] {
    return [
      ...Array.from(this.searchCache.keys()),
      ...Array.from(this.metadataCache.keys())
    ]
  }

  /**
   * Warm up cache with popular games
   */
  async warmUpCache(popularGameIds: string[]): Promise<void> {
    // This would typically fetch and cache popular games
    // For now, just log the intention
    console.log(`Warming up cache with ${popularGameIds.length} popular games`)
  }

  /**
   * Get cache efficiency metrics
   */
  async getCacheEfficiency(): Promise<{
    memoryHitRate: number
    databaseHitRate: number
    totalMemorySize: number
    totalDatabaseSize: number
    averageResponseTime: number
  }> {
    const stats = this.getCacheStats()
    
    return {
      memoryHitRate: stats.hitRate,
      databaseHitRate: 0, // No database cache in this simplified version
      totalMemorySize: stats.size,
      totalDatabaseSize: 0,
      averageResponseTime: 0 // Would need to track this separately
    }
  }
}
