import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { extractSearchItems, extractMetadata, cleanXML } from '@/lib/bgg/parsers/xml-parser'
import type { BGGSearchResult, BGGAPIMetadata } from '@/lib/bgg/types'

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
    
    // Fetch metadata for top results to get images and additional data
    const topResults = searchItems.slice(0, 15) // Limit to avoid timeouts
    const gameIds = topResults.map(item => item.id)
    
    console.log(`📊 Fetching metadata for ${gameIds.length} top results`)
    
    let metadata: BGGAPIMetadata[] = []
    if (gameIds.length > 0) {
      try {
        // Fetch metadata in batch
        const metadataXml = await apiClient.getBatchMetadata(gameIds)
        const cleanedXml = cleanXML(metadataXml)
        metadata = extractMetadata(cleanedXml)
        console.log(`✅ Fetched metadata for ${metadata.length} games`)
      } catch (error) {
        console.warn('⚠️ Failed to fetch metadata, continuing with basic search results:', error)
      }
    }
    
    // Create metadata map for quick lookup
    const metadataMap = new Map(metadata.map(meta => [meta.id, meta]))
    
    // Convert to BGGSearchResult format with metadata
    const results: BGGSearchResult[] = searchItems.map(item => {
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
        thumbnail: meta?.thumbnail || '',
        image: meta?.image || '',
        bggLink: `https://boardgamegeek.com/boardgame/${item.id}`,
        isExpansion,
        hasInboundExpansionLink: meta?.hasInboundExpansionLink || false,
        searchScore: 0
      }
    })

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
