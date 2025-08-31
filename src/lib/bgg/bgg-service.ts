/* eslint-disable @typescript-eslint/no-explicit-any */
// BGG Service
// Main orchestrator for BGG API operations with smart search and caching

import { BGGAPIClient } from './api-client'
import { CacheManager } from './cache-manager'
import { extractSearchItems, extractMetadata, cleanXML, matchLanguageToAlternateName } from './parsers/xml-parser'
import { SEARCH_CONFIG } from './config'
import type { 
  BGGSearchResult, 
  BGGGameDetails, 
  BGGAPIMetadata, 
  SearchFilters,
  BGGSearchError,
  LanguageMatchedVersion
} from './types'

export class BGGService {
  private apiClient: BGGAPIClient
  private cacheManager: CacheManager

  constructor() {
    this.apiClient = new BGGAPIClient()
    this.cacheManager = new CacheManager()
  }

  /**
   * Main search method with improved type classification
   */
  async searchGames(query: string, filters?: SearchFilters): Promise<BGGSearchResult[]> {
    const startTime = Date.now()
    
    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return []
    }

    const cleanQuery = query.trim()
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log(`🔍 BGG Search: Starting search for "${cleanQuery}" with filters:`, filters, 'Mobile:', isMobile)

    try {
      // Check cache first
      const cachedResults = this.cacheManager.getCachedSearch(cleanQuery, filters)
      if (cachedResults) {
        console.log(`🎯 Cache hit for query: "${cleanQuery}"`)
        return cachedResults
      }

      // Perform BGG API search with type correction
      const searchResults = await this.performBGGSearch(cleanQuery, filters)
      
      // Fetch metadata for top results to improve type classification
      const metadata = await this.fetchMetadataForResults(searchResults)
      
      // Combine search results with metadata and apply final filtering
      const combinedResults = this.combineSearchWithMetadata(searchResults, metadata)
      const filteredResults = this.applyTypeFiltering(combinedResults, filters)
      
      // Rank and score results
      const rankedResults = this.rankSearchResults(filteredResults, cleanQuery)
      
      // Cache results
      const searchTime = Date.now() - startTime
      this.cacheManager.setCachedSearch(cleanQuery, rankedResults, searchTime, filters)
      
      console.log(`✅ Search completed in ${searchTime}ms, found ${rankedResults.length} results`)
      return rankedResults

    } catch (error) {
      const searchTime = Date.now() - startTime
      console.error(`❌ Search failed for query "${cleanQuery}" after ${searchTime}ms:`, error)
      
      // Return cached results if available, even if expired
      const expiredResults = this.getExpiredCacheResults(cleanQuery, filters)
      if (expiredResults.length > 0) {
        console.log(`⚠️ Returning expired cache results as fallback`)
        return expiredResults
      }
      
      throw this.createSearchError(error, cleanQuery)
    }
  }

  /**
   * Get complete game details by ID
   */
  async getGameDetails(gameId: string): Promise<BGGGameDetails | null> {
    if (!gameId) return null

    try {
      // Check cache first
      const cachedData = this.cacheManager.getCachedGameData(gameId)
      if (cachedData) {
        console.log(`🎯 Cache hit for game details: ${gameId}`)
        return this.convertToGameDetails(cachedData)
      }

      console.log(`🔍 Fetching game details for: ${gameId}`)

      // Fetch from BGG API
      const xmlResponse = await this.apiClient.getGameDetails(gameId)
      console.log(`🔍 Raw XML response for game ${gameId}:`, xmlResponse.substring(0, 500) + '...')
      
      const cleanedXml = cleanXML(xmlResponse)
      console.log(`🔍 Cleaned XML for game ${gameId}:`, cleanedXml.substring(0, 500) + '...')
      
      const metadata = extractMetadata(cleanedXml)
      console.log(`🔍 Extracted metadata for game ${gameId}:`, metadata)

      if (metadata.length === 0) {
        console.error(`Failed to parse game details for ${gameId}`)
        return null
      }

      const gameMetadata = metadata[0]
      const gameDetails = this.convertToGameDetails(gameMetadata)

      // Cache the result
      await this.cacheManager.cacheGameData(gameMetadata)

      return gameDetails

    } catch (error) {
      console.error(`Failed to get game details for ${gameId}:`, error)
      return null
    }
  }

  /**
   * Perform BGG API search with smart strategy
   */
  private async performBGGSearch(query: string, filters?: SearchFilters): Promise<any[]> {
    const gameType = this.getGameTypeForSearch(filters)
    const queryLength = query.length
    let results: any[] = []

    console.log('🔍 performBGGSearch called with:', { query, gameType, queryLength })

    if (queryLength >= SEARCH_CONFIG.EXACT_MATCH_THRESHOLD) {
      // Try exact search first for longer queries
      console.log(`🎯 Trying exact search for "${query}"`)
      results = await this.searchBGGAPI(query, true, gameType)
      
      if (results.length > 0) {
        console.log(`✅ Exact search found ${results.length} results`)
        return results
      }
      
      // Fall back to fuzzy search
      console.log(`🔄 Falling back to fuzzy search for "${query}"`)
    } else {
      // Go straight to fuzzy search for short queries
      console.log(`🔍 Using fuzzy search for short query "${query}"`)
    }

    results = await this.searchBGGAPI(query, false, gameType)
    console.log(`🔍 Fuzzy search found ${results.length} results`)
    
    return results
  }

  /**
   * Search BGG API with specific parameters
   */
  private async searchBGGAPI(
    query: string,
    exact: boolean,
    gameType: 'boardgame' | 'boardgameexpansion'
  ): Promise<any[]> {
    try {
      const xmlResponse = await this.apiClient.searchGames(query, gameType, exact)
      const searchItems = extractSearchItems(xmlResponse)
      
      // Filter by game type from search API
      if (gameType) {
        return searchItems.filter(item => item.type === gameType)
      }
      
      return searchItems
    } catch (error) {
      console.error('BGG API search failed:', error)
      return []
    }
  }

  /**
   * Fetch metadata for search results to improve type classification
   */
  private async fetchMetadataForResults(searchResults: any[]): Promise<BGGAPIMetadata[]> {
    if (searchResults.length === 0) return []

    // Get top results for metadata (limited to avoid timeouts)
    const topResults = searchResults.slice(0, SEARCH_CONFIG.METADATA_BATCH_SIZE)
    const gameIds = topResults.map(item => item.id)

    console.log(`📊 Fetching metadata for ${gameIds.length} top results`)

    try {
      // Check cache first
      const cachedMetadata = await this.cacheManager.getCachedMetadata(gameIds)
      const cachedIds = new Set(cachedMetadata.map(meta => meta.id))
      const uncachedIds = gameIds.filter(id => !cachedIds.has(id))

      const allMetadata = [...cachedMetadata]

      // Fetch uncached metadata from BGG API
      if (uncachedIds.length > 0) {
        console.log(`🔄 Fetching metadata for ${uncachedIds.length} uncached games`)
        const xmlResponse = await this.apiClient.getBatchMetadata(uncachedIds)
        const newMetadata = extractMetadata(cleanXML(xmlResponse))

        // Cache new metadata
        if (newMetadata.length > 0) {
          await this.cacheManager.cacheMetadataBatch(newMetadata)
          allMetadata.push(...newMetadata)
        }
      }

      console.log(`📊 Total metadata available: ${allMetadata.length} games`)
      return allMetadata

    } catch (error) {
      console.warn('Metadata fetching failed, continuing with search results only:', error)
      return []
    }
  }

  /**
   * Combine search results with metadata
   */
  private combineSearchWithMetadata(
    searchResults: any[],
    metadata: BGGAPIMetadata[]
  ): BGGSearchResult[] {
    const metadataMap = new Map(metadata.map(meta => [meta.id, meta]))

    return searchResults
      .map(item => {
        const meta = metadataMap.get(item.id)
        
        // Determine if this is truly an expansion
        const isExpansion = meta?.type === 'boardgameexpansion' || 
                           meta?.hasInboundExpansionLink ||
                           item.type === 'boardgameexpansion'

        return {
          id: item.id,
          name: item.name,
          yearpublished: item.yearpublished,
          rank: meta?.rank,
          bayesaverage: meta?.bayesaverage,
          average: meta?.average,
          type: isExpansion ? 'boardgameexpansion' : 'boardgame',
          thumbnail: meta?.thumbnail,
          image: meta?.image,
          bggLink: `https://boardgamegeek.com/boardgame/${item.id}`,
          isExpansion,
          hasInboundExpansionLink: meta?.hasInboundExpansionLink || false,
          searchScore: 0 // Will be calculated in ranking
        }
      })
  }

  /**
   * Apply type filtering based on user preferences
   */
  private applyTypeFiltering(results: BGGSearchResult[], filters?: SearchFilters): BGGSearchResult[] {
    if (!filters?.gameType) return results

    const beforeCount = results.length
    
    if (filters.gameType === 'base-game') {
      // Filter out expansions
      const filtered = results.filter(result => !result.isExpansion)
      console.log(`🔍 Type filtering: ${beforeCount} -> ${filtered.length} base games`)
      return filtered
    } else if (filters.gameType === 'expansion') {
      // Filter to only expansions
      const filtered = results.filter(result => result.isExpansion)
      console.log(`🔍 Type filtering: ${beforeCount} -> ${filtered.length} expansions`)
      return filtered
    }

    return results
  }

  /**
   * Rank search results by relevance
   */
  private rankSearchResults(results: BGGSearchResult[], query: string): BGGSearchResult[] {
    return results
      .map(result => ({
        ...result,
        searchScore: this.calculateResultScore(result, query)
      }))
      .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
  }

  /**
   * Calculate relevance score for a search result
   */
  private calculateResultScore(result: BGGSearchResult, query: string): number {
    let score = 0

    // Exact name match (highest priority)
    if (result.name.toLowerCase() === query.toLowerCase()) {
      score += 1000000
    }

    // Starts with query (high priority)
    if (result.name.toLowerCase().startsWith(query.toLowerCase())) {
      score += 500000
    }

    // Contains query (medium priority)
    if (result.name.toLowerCase().includes(query.toLowerCase())) {
      score += 100000
    }

    // Base game priority (if not filtering)
    if (!result.isExpansion) {
      score += 10000
    }

    // BGG rank bonus (lower rank = higher score)
    if (result.rank && result.rank !== '0') {
      const rank = parseInt(result.rank)
      if (!isNaN(rank)) {
        score += Math.max(0, 1000 - rank)
      }
    }

    // Rating bonus
    if (result.bayesaverage && result.bayesaverage !== '0') {
      const rating = parseFloat(result.bayesaverage)
      if (!isNaN(rating)) {
        score += rating * 100
      }
    }

    // Year bonus (newer games get slight bonus)
    if (result.yearpublished && result.yearpublished !== '0') {
      const year = parseInt(result.yearpublished)
      if (!isNaN(year)) {
        score += Math.max(0, year - 1900) * 0.1
      }
    }

    return score
  }

  /**
   * Get game type for search based on filters
   */
  private getGameTypeForSearch(filters?: SearchFilters): 'boardgame' | 'boardgameexpansion' {
    if (!filters) return 'boardgame'

    switch (filters.gameType) {
      case 'expansion':
        return 'boardgameexpansion'
      case 'base-game':
      default:
        return 'boardgame'
    }
  }

  /**
   * Convert metadata to game details format
   */
  private convertToGameDetails(metadata: BGGAPIMetadata): BGGGameDetails {
    return {
      id: metadata.id,
      name: metadata.name,
      yearpublished: metadata.yearpublished || '',
      minplayers: metadata.minplayers || '',
      maxplayers: metadata.maxplayers || '',
      playingtime: metadata.playingtime || '',
      minage: metadata.minage || '',
      description: metadata.description || '',
      thumbnail: metadata.thumbnail || '',
      image: metadata.image || '',
      rating: metadata.average || '',
      bayesaverage: metadata.bayesaverage || '',
      weight: metadata.weight || '',
      rank: metadata.rank || '',
      mechanics: metadata.mechanics || [],
      categories: metadata.categories || [],
      designers: metadata.designers || [],
      alternateNames: metadata.alternateNames || [],
      versions: metadata.versions || [],
      type: metadata.type as 'boardgame' | 'boardgameexpansion',
      isExpansion: metadata.type === 'boardgameexpansion' || metadata.hasInboundExpansionLink,
      hasInboundExpansionLink: metadata.hasInboundExpansionLink
    }
  }

  /**
   * Get language-matched versions for a game with smart alternate name suggestions
   */
  async getLanguageMatchedVersions(gameId: string): Promise<LanguageMatchedVersion[]> {
    console.log(`🔍 Getting language-matched versions for game: ${gameId}`)
    
    const gameDetails = await this.getGameDetails(gameId)
    if (!gameDetails) {
      console.log(`❌ No game details found for: ${gameId}`)
      return []
    }

    // Get the metadata to access versions and alternate names
    const cachedData = this.cacheManager.getCachedGameData(gameId)
    if (!cachedData) {
      console.log(`❌ No cached data found for: ${gameId}`)
      return []
    }

    console.log(`📊 Cached data for ${gameId}:`, {
      hasVersions: !!cachedData.versions,
      versionsCount: cachedData.versions?.length || 0,
      hasAlternateNames: !!cachedData.alternateNames,
      alternateNamesCount: cachedData.alternateNames?.length || 0
    })

    const versions = cachedData.versions || []
    const alternateNames = cachedData.alternateNames || []

    console.log(`🔍 Raw versions data:`, versions)
    console.log(`🔍 Raw alternate names:`, alternateNames)

    if (versions.length === 0) {
      console.log(`⚠️ No versions found for game: ${gameId}`)
      return []
    }

            const languageMatchedVersions = versions.map((version: any) => 
          matchLanguageToAlternateName(version, alternateNames, gameDetails.name, versions.length)
        ).sort((a: LanguageMatchedVersion, b: LanguageMatchedVersion) => b.confidence - a.confidence)

    console.log(`✅ Language-matched versions created:`, languageMatchedVersions.length)
    return languageMatchedVersions
  }

  /**
   * Get expired cache results as fallback
   */
  private getExpiredCacheResults(_query: string, _filters?: SearchFilters): BGGSearchResult[] {
    // This would check for expired cache entries
    // For now, return empty array
    return []
  }

  /**
   * Create search error with proper error codes
   */
  private createSearchError(error: any, _query: string): BGGSearchError {
    let code: BGGSearchError['code'] = 'NETWORK_ERROR'
    let message = 'An unexpected error occurred during search'

    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        code = 'RATE_LIMIT'
        message = 'BGG API is busy. Please wait a moment and try again.'
      } else if (error.message.includes('timeout')) {
        code = 'API_UNAVAILABLE'
        message = 'Search is taking longer than expected. Please try a more specific search term.'
      } else if (error.message.includes('network')) {
        code = 'NETWORK_ERROR'
        message = 'Network connection issue. Please check your internet connection.'
      }
    }

    return {
      code,
      message,
      retryAfter: code === 'RATE_LIMIT' ? 5000 : undefined
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheManager.getCacheStats()
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cacheManager.clearAllCaches()
  }

  /**
   * Clear cache for specific query
   */
  clearCacheForQuery(_query: string, filters?: SearchFilters): void {
    this.cacheManager.clearSearchCacheForQuery(_query, filters)
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig: Partial<any>): void {
    this.apiClient.updateConfig(newConfig)
  }

  /**
   * Get current API configuration
   */
  getConfig() {
    return this.apiClient.getConfig()
  }
}

// Export a singleton instance
export const bggService = new BGGService()
