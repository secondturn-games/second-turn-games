/* eslint-disable @typescript-eslint/no-explicit-any */
// Client-Side BGG Service
// Calls Next.js API routes instead of BGG directly to avoid CORS issues

import type { 
  BGGSearchResult, 
  BGGGameDetails, 
  SearchFilters,
  BGGSearchError,
  LanguageMatchedVersion
} from './types'

export class BGGServiceClient {
  private baseUrl: string

  constructor() {
    // Use relative URL for same-origin requests
    this.baseUrl = '/api/bgg'
  }

  /**
   * Main search method - calls our Next.js API route
   */
  async searchGames(query: string, filters?: SearchFilters): Promise<BGGSearchResult[]> {
    const startTime = Date.now()
    
    if (!query || query.trim().length < 2) {
      return []
    }

    const cleanQuery = query.trim()
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log(`🔍 Client BGG Search: Starting search for "${cleanQuery}" with filters:`, filters, 'Mobile:', isMobile)

    try {
      // Build query parameters
      const params = new URLSearchParams({
        q: cleanQuery
      })

      if (filters?.gameType) {
        if (filters.gameType === 'base-game') {
          params.append('type', 'boardgame')
        } else if (filters.gameType === 'expansion') {
          params.append('type', 'boardgameexpansion')
        }
      }

      // Call our Next.js API route
      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const results = data.results || []
      
      console.log('✅ Client BGG Search: API route returned', results.length, 'results')
      
      // Apply client-side filtering for game type if needed
      const filteredResults = this.applyTypeFiltering(results, filters)
      
      // Rank and score results
      const rankedResults = this.rankSearchResults(filteredResults, cleanQuery)
      
      const searchTime = Date.now() - startTime
      console.log(`✅ Client BGG Search: Completed in ${searchTime}ms, found ${rankedResults.length} results`)
      
      return rankedResults

    } catch (error) {
      const searchTime = Date.now() - startTime
      console.error(`❌ Client BGG Search: Failed for query "${cleanQuery}" after ${searchTime}ms:`, error)
      
      throw this.createSearchError(error, cleanQuery)
    }
  }

  /**
   * Get complete game details by ID - calls our Next.js API route
   */
  async getGameDetails(gameId: string): Promise<BGGGameDetails | null> {
    if (!gameId) return null

    try {
      console.log(`🔍 Client BGG Service: Getting game details for: ${gameId}`)

      // Call our Next.js API route
      const response = await fetch(`${this.baseUrl}/game?id=${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Game not found: ${gameId}`)
          return null
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const gameDetails = data.game

      console.log(`✅ Client BGG Service: Got game details for: ${gameId}`)
      return gameDetails

    } catch (error) {
      console.error(`Failed to get game details for ${gameId}:`, error)
      return null
    }
  }

  /**
   * Get language-matched versions for a game - calls our Next.js API route
   */
  async getLanguageMatchedVersions(gameId: string): Promise<LanguageMatchedVersion[]> {
    console.log(`🔍 Client BGG Service: Getting language-matched versions for game: ${gameId}`)
    
    try {
      // Call our Next.js API route
      const response = await fetch(`${this.baseUrl}/versions?id=${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const versions = data.versions || []

      console.log(`✅ Client BGG Service: Got ${versions.length} language-matched versions for: ${gameId}`)
      return versions

    } catch (error) {
      console.error(`Failed to get language-matched versions for ${gameId}:`, error)
      return []
    }
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
      console.log(`🔍 Client Type filtering: ${beforeCount} -> ${filtered.length} base games`)
      return filtered
    } else if (filters.gameType === 'expansion') {
      // Filter to only expansions
      const filtered = results.filter(result => result.isExpansion)
      console.log(`🔍 Client Type filtering: ${beforeCount} -> ${filtered.length} expansions`)
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
      } else if (error.message.includes('HTTP 429')) {
        code = 'RATE_LIMIT'
        message = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message.includes('HTTP 408')) {
        code = 'API_UNAVAILABLE'
        message = 'Request timeout. Please try again.'
      } else if (error.message.includes('HTTP 503')) {
        code = 'NETWORK_ERROR'
        message = 'Service temporarily unavailable. Please try again later.'
      }
    }

    return {
      code,
      message,
      retryAfter: code === 'RATE_LIMIT' ? 5000 : undefined
    }
  }
}

// Export a singleton instance for client-side use
export const bggServiceClient = new BGGServiceClient()
