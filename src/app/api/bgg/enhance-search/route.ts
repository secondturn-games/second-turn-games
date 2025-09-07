import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { extractMetadata, cleanXML } from '@/lib/bgg/parsers/xml-parser'
import type { EnhancedSearchResult } from '@/lib/bgg/types'

const apiClient = new BGGAPIClient()

export async function POST(request: NextRequest) {
  try {
    const { gameIds } = await request.json()

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return NextResponse.json(
        { error: 'Game IDs array is required' },
        { status: 400 }
      )
    }

    // Limit to prevent abuse
    const limitedIds = gameIds.slice(0, 10)
    
    console.log('🔍 Enhance Search API: Fetching metadata for games:', limitedIds)

    let enhancedResults: EnhancedSearchResult[] = []
    
    if (limitedIds.length > 0) {
      try {
        // Fetch metadata in batch
        const metadataXml = await apiClient.getBatchMetadata(limitedIds)
        const cleanedXml = cleanXML(metadataXml)
        const metadata = extractMetadata(cleanedXml)
        
        console.log(`✅ Enhanced Search: Fetched metadata for ${metadata.length} games`)

        // Create metadata map for quick lookup
        const metadataMap = new Map(metadata.map(meta => [meta.id, meta]))
        
        // Convert to enhanced format
        enhancedResults = limitedIds.map(gameId => {
          const meta = metadataMap.get(gameId)
          
          // Determine if this is truly an expansion
          const isExpansion = meta?.type === 'boardgameexpansion' || 
                             meta?.hasInboundExpansionLink ||
                             false
          
          return {
            id: gameId,
            name: meta?.name || 'Unknown Game',
            yearpublished: meta?.yearpublished,
            type: isExpansion ? 'boardgameexpansion' : 'boardgame',
            thumbnail: meta?.thumbnail || '',
            image: meta?.image || '',
            bggLink: `https://boardgamegeek.com/boardgame/${gameId}`,
            isExpansion,
            hasInboundExpansionLink: meta?.hasInboundExpansionLink || false,
            rank: meta?.rank,
            bayesaverage: meta?.bayesaverage,
            average: meta?.average,
            searchScore: 0,
            hasMetadata: true
          }
        })
      } catch (error) {
        console.warn('⚠️ Enhanced Search: Failed to fetch metadata, returning basic results:', error)
        
        // Fallback to basic results
        enhancedResults = limitedIds.map(gameId => ({
          id: gameId,
          name: 'Unknown Game',
          type: 'boardgame' as const,
          bggLink: `https://boardgamegeek.com/boardgame/${gameId}`,
          isExpansion: false,
          hasInboundExpansionLink: false,
          searchScore: 0,
          hasMetadata: true
        }))
      }
    }

    console.log('✅ Enhanced Search API: Returning enhanced results:', enhancedResults.length)
    
    return NextResponse.json({ results: enhancedResults })
    
  } catch (error) {
    console.error('❌ Enhanced Search API: Enhancement failed:', error)
    
    let status = 500
    let message = 'Internal server error'
    
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        status = 429
        message = 'BGG API is busy. Please wait a moment and try again.'
      } else if (error.message.includes('timeout')) {
        status = 408
        message = 'Request is taking longer than expected. Please try again.'
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
