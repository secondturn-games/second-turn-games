import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { extractSearchItems } from '@/lib/bgg/parsers/xml-parser'
import type { BGGSearchResult } from '@/lib/bgg/types'

const apiClient = new BGGAPIClient()

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

    console.log('🔍 API Route: Search request:', { query, gameType, exact })

    // Call BGG API directly (server-side, no CORS issues)
    const xmlResponse = await apiClient.searchGames(query.trim(), gameType || 'boardgame', exact)
    
    // Parse XML response using existing utilities
    const searchItems = extractSearchItems(xmlResponse)
    
    // Convert to BGGSearchResult format
    const results: BGGSearchResult[] = searchItems.map(item => ({
      id: item.id,
      name: item.name,
      yearpublished: item.yearpublished,
      type: item.type as 'boardgame' | 'boardgameexpansion',
      thumbnail: item.thumbnail || '',
      image: item.image || '',
      bggLink: `https://boardgamegeek.com/boardgame/${item.id}`,
      isExpansion: item.type === 'boardgameexpansion',
      hasInboundExpansionLink: false,
      searchScore: 0
    }))

    console.log('✅ API Route: Search completed, found', results.length, 'results')
    
    return NextResponse.json({ results })
    
  } catch (error) {
    console.error('❌ API Route: Search failed:', error)
    
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
