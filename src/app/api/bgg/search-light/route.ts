import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { CacheManager } from '@/lib/bgg/cache-manager'
import { extractSearchItems, cleanXML } from '@/lib/bgg/parsers/xml-parser'
import type { LightweightSearchResult } from '@/lib/bgg/types'

const apiClient = new BGGAPIClient()
const cacheManager = new CacheManager()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const gameType = searchParams.get('type') as 'boardgame' | 'boardgameexpansion' | undefined
    const exact = searchParams.get('exact') === 'true'

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required and must be at least 2 characters' },
        { status: 400 }
      )
    }

    console.log('🔍 Light Search API: Starting lightweight search for:', { query, gameType, exact })

    // Check cache first
    const cacheKey = `search:${query.toLowerCase().trim()}:${JSON.stringify({ gameType, exact })}`
    const cachedResults = cacheManager.getCachedSearch(query, { gameType, exact })
    if (cachedResults) {
      console.log('🎯 Cache hit for search query:', query)
      
      // Convert cached BGGSearchResult[] to LightweightSearchResult[]
      const lightweightResults: LightweightSearchResult[] = cachedResults.map(result => ({
        id: result.id,
        name: result.name,
        yearpublished: result.yearpublished,
        type: result.type,
        thumbnail: result.thumbnail || '',
        bggLink: result.bggLink,
        isExpansion: result.isExpansion,
        hasInboundExpansionLink: result.hasInboundExpansionLink,
        hasMetadata: true // Cached results have metadata
      }))
      
      return NextResponse.json({ 
        results: lightweightResults,
        total: lightweightResults.length,
        hasMore: false
      })
    }

    console.log('🔄 Cache miss, fetching from BGG API for query:', query)

    // Call BGG API directly (server-side, no CORS issues)
    const xmlResponse = await apiClient.searchGames(query.trim(), gameType || 'boardgame', exact)
    
    // Parse XML response using existing utilities
    const searchItems = extractSearchItems(xmlResponse)
    
    // Limit results to avoid overwhelming the client
    const limitedResults = searchItems.slice(0, 20)
    
    console.log(`📊 Light Search: Found ${limitedResults.length} basic results`)
    console.log(`📊 Light Search: Requested gameType: ${gameType}`)
    console.log(`📊 Light Search: Item types found:`, limitedResults.map(item => ({ id: item.id, name: item.name, type: item.type })))

    // Convert to lightweight format - NO metadata fetching
    const results: LightweightSearchResult[] = limitedResults
      .filter(item => {
        // Additional client-side filtering to ensure we respect the gameType parameter
        if (gameType === 'boardgame' && item.type === 'boardgameexpansion') {
          return false // Filter out expansions when searching for base games only
        }
        if (gameType === 'boardgameexpansion' && item.type === 'boardgame') {
          return false // Filter out base games when searching for expansions only
        }
        return true
      })
      .map(item => {
        // Determine if this is truly an expansion
        const isExpansion = item.type === 'boardgameexpansion'
        
        return {
          id: item.id,
          name: item.name,
          yearpublished: item.yearpublished,
          type: isExpansion ? 'boardgameexpansion' : 'boardgame',
          thumbnail: '', // Will be loaded on demand
          bggLink: `https://boardgamegeek.com/boardgame/${item.id}`,
          isExpansion,
          hasInboundExpansionLink: false, // Will be determined when metadata is loaded
          hasMetadata: false
        }
      })

    console.log(`✅ Light Search API: After filtering for ${gameType}: ${results.length} results (filtered out ${limitedResults.length - results.length} items)`)

    // Cache the results for future requests
    // Convert LightweightSearchResult[] to BGGSearchResult[] for caching
    const searchResultsForCache = results.map(result => ({
      id: result.id,
      name: result.name,
      yearpublished: result.yearpublished,
      type: result.type,
      thumbnail: result.thumbnail,
      bggLink: result.bggLink,
      isExpansion: result.isExpansion,
      hasInboundExpansionLink: result.hasInboundExpansionLink,
      searchScore: 0 // Lightweight results don't have search scores
    }))
    
    cacheManager.setCachedSearch(query, searchResultsForCache, 0, { gameType, exact })
    
    return NextResponse.json({ 
      results,
      total: searchItems.length,
      hasMore: searchItems.length > 20
    })
    
  } catch (error) {
    console.error('❌ Light Search API: Search failed:', error)
    
    let status = 500
    let message = 'Internal server error'
    
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        status = 429
        message = 'BGG API is busy. Please wait a moment and try again.'
      } else if (error.message.includes('timeout')) {
        status = 408
        message = 'Search is taking longer than expected. Please try a more specific search term.'
      } else if (error.message.includes('network')) {
        status = 503
        message = 'Network connection issue. Please check your internet connection.'
      }
    }
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}

