/* eslint-disable @typescript-eslint/no-explicit-any */
// BGG API Client
// Handles HTTP requests to BGG API with rate limiting and error handling

import { DEFAULT_BGG_CONFIG, BGG_ENDPOINTS, BGG_ERROR_MESSAGES, BGG_STATUS_CODES } from './config'
import type { BGGAPIConfig } from './types'

export class BGGAPIClient {
  private config: BGGAPIConfig
  private lastApiCall: number = 0
  private requestCount: number = 0
  private lastResetTime: number = Date.now()

  constructor(config: Partial<BGGAPIConfig> = {}) {
    this.config = { ...DEFAULT_BGG_CONFIG, ...config }
  }

  /**
   * Make a GET request to BGG API with rate limiting and timeout
   */
  async get(endpoint: string, params?: Record<string, string>): Promise<string> {
    await this.enforceRateLimit()
    
    const url = this.buildUrl(endpoint, params)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.searchTimeout)
    
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('🌐 API Client: Making request to:', url, 'Mobile:', isMobile)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/xml; charset=utf-8',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('📡 API Response status:', response.status, response.statusText, 'Mobile:', isMobile)

      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText, 'Mobile:', isMobile)
        throw this.createAPIError(response.status, response.statusText, url)
      }

      // Use arrayBuffer() and TextDecoder for proper UTF-8 handling
      const buffer = await response.arrayBuffer()
      const decoder = new TextDecoder('utf-8')
      const xmlText = decoder.decode(buffer)
      
      console.log('📄 Response decoded, length:', xmlText.length, 'Mobile:', isMobile)

      // Validate XML response
      if (!this.isValidXML(xmlText)) {
        console.error('❌ Invalid XML response, Mobile:', isMobile)
        throw new Error(BGG_ERROR_MESSAGES.INVALID_RESPONSE)
      }

      this.incrementRequestCount()
      console.log('✅ API request successful, Mobile:', isMobile)
      return xmlText

    } catch (error) {
      clearTimeout(timeoutId)
      console.error('❌ API request failed:', error, 'Mobile:', isMobile)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(BGG_ERROR_MESSAGES.SEARCH_TIMEOUT)
      }

      if (error instanceof Error && error.message.includes('BGG API error')) {
        throw error
      }

      // Network or other errors
      throw new Error(BGG_ERROR_MESSAGES.NETWORK_ERROR)
    }
  }

  /**
   * Search for games using BGG API
   */
  async searchGames(
    query: string, 
    gameType?: 'boardgame' | 'boardgameexpansion', 
    exact?: boolean
  ): Promise<string> {
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('🔍 API Client: searchGames called with:', { query, gameType, exact, isMobile })
    
    const params: Record<string, string> = {
      query: query.trim(),
      type: gameType || 'boardgame'
    }
    
    if (exact) {
      params.exact = '1'
    }

    console.log('🔍 API Client: search params:', params)
    const result = await this.get(BGG_ENDPOINTS.SEARCH, params)
    console.log('✅ API Client: search response length:', result.length, 'Mobile:', isMobile)
    return result
  }

  /**
   * Get game details using BGG API
   */
  async getGameDetails(
    gameId: string, 
    _gameType: 'boardgame' | 'boardgameexpansion' = 'boardgame'
  ): Promise<string> {
    const params: Record<string, string> = {
      id: gameId,
      stats: '1',
      versions: '1'
    }

    return this.get(BGG_ENDPOINTS.THING, params)
  }

  /**
   * Get metadata for multiple games (batch request)
   */
  async getBatchMetadata(gameIds: string[]): Promise<string> {
    if (gameIds.length === 0) {
      return '<?xml version="1.0" encoding="UTF-8"?><items></items>'
    }

    const batchSize = this.config.maxBatchSize
    const batches = []

    for (let i = 0; i < gameIds.length; i += batchSize) {
      batches.push(gameIds.slice(i, i + batchSize))
    }

    // Process batches in parallel for better performance
    const batchPromises = batches.map(async (batch) => {
      const params: Record<string, string> = {
        id: batch.join(','),
        stats: '1',
        versions: '1'
      }

      return this.get(BGG_ENDPOINTS.THING, params)
    })

    // Wait for all batches to complete in parallel
    const allResponses = await Promise.all(batchPromises)

    return this.combineXMLResponses(allResponses)
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.config.baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value)
        }
      })
    }

    return url.toString()
  }

  /**
   * Enforce rate limiting between API calls
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    
    // Reset counter every hour
    if (now - this.lastResetTime > 60 * 60 * 1000) {
      this.requestCount = 0
      this.lastResetTime = now
    }

    // Check hourly limit
    if (this.requestCount >= 800) {
      // const waitTime = 60 * 60 * 1000 - (now - this.lastResetTime) // Unused variable
      throw new Error(BGG_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED)
    }

    // Check minute limit
    const timeSinceLastCall = now - this.lastApiCall
    const minDelay = this.config.rateLimitDelay

    if (timeSinceLastCall < minDelay) {
      const delay = minDelay - timeSinceLastCall
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    this.lastApiCall = Date.now()
  }

  /**
   * Increment request counter
   */
  private incrementRequestCount(): void {
    this.requestCount++
  }

  /**
   * Create API error with proper error codes
   */
  private createAPIError(status: number, statusText: string, url: string): Error {
    let errorMessage: string = BGG_ERROR_MESSAGES.API_UNAVAILABLE

    switch (status) {
      case BGG_STATUS_CODES.TOO_MANY_REQUESTS:
        errorMessage = BGG_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
        break
      case BGG_STATUS_CODES.BAD_REQUEST:
        errorMessage = BGG_ERROR_MESSAGES.INVALID_GAME_ID
        break
      case BGG_STATUS_CODES.NOT_FOUND:
        errorMessage = BGG_ERROR_MESSAGES.GAME_NOT_FOUND
        break
      case BGG_STATUS_CODES.SERVICE_UNAVAILABLE:
        errorMessage = BGG_ERROR_MESSAGES.API_UNAVAILABLE
        break
    }

    const error = new Error(errorMessage)
    ;(error as any).status = status
    ;(error as any).url = url
    return error
  }

  /**
   * Validate XML response
   */
  private isValidXML(xmlText: string): boolean {
    if (!xmlText || typeof xmlText !== 'string') {
      return false
    }

    // Basic XML validation
    const trimmed = xmlText.trim()
    if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<')) {
      return false
    }

    // Check for basic XML structure
    const hasOpeningTag = /<[^>]+>/.test(trimmed)
    const hasClosingTag = /<\/[^>]+>/.test(trimmed)
    
    return hasOpeningTag && hasClosingTag
  }

  /**
   * Combine multiple XML responses into one
   */
  private combineXMLResponses(responses: string[]): string {
    if (responses.length === 1) {
      return responses[0]
    }

    // Extract items from each response and combine them
    const allItems: string[] = []

    responses.forEach(response => {
      const itemsMatch = response.match(/<item[^>]*>[\s\S]*?<\/item>/g)
      if (itemsMatch) {
        allItems.push(...itemsMatch)
      }
    })

    if (allItems.length === 0) {
      return '<?xml version="1.0" encoding="UTF-8"?><items></items>'
    }

    const itemsXml = allItems.join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
${itemsXml}
</items>`
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BGGAPIConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): BGGAPIConfig {
    return { ...this.config }
  }

  /**
   * Get current request count for monitoring
   */
  getRequestCount(): number {
    return this.requestCount
  }

  /**
   * Reset request counter (for testing)
   */
  resetRequestCount(): void {
    this.requestCount = 0
    this.lastResetTime = Date.now()
  }
}
