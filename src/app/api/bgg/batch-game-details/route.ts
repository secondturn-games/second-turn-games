import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { CacheManager } from '@/lib/bgg/cache-manager'
import { extractMetadata, cleanXML } from '@/lib/bgg/parsers/xml-parser'
import type { BGGGameDetails, BGGAPIMetadata } from '@/lib/bgg/types'

const apiClient = new BGGAPIClient()
const cacheManager = new CacheManager()

export async function POST(request: NextRequest) {
  try {
    const { gameIds } = await request.json()

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return NextResponse.json(
        { error: 'Game IDs array is required' },
        { status: 400 }
      )
    }

    // Limit to prevent abuse and respect rate limits
    const limitedIds = gameIds.slice(0, 20)
    
    console.log('🔍 Batch Game Details API: Fetching details for games:', limitedIds)

    const results: { gameId: string; game: BGGGameDetails | null; error?: string }[] = []
    
    // Check cache for all games first
    const cachedGames: Map<string, BGGAPIMetadata> = new Map()
    const uncachedIds: string[] = []
    
    for (const gameId of limitedIds) {
      const cached = cacheManager.getCachedGameData(gameId)
      if (cached) {
        cachedGames.set(gameId, cached)
      } else {
        uncachedIds.push(gameId)
      }
    }

    console.log(`📊 Cache hit: ${cachedGames.size}, Cache miss: ${uncachedIds.length}`)

    // Process cached games immediately
    for (const [gameId, cachedData] of cachedGames) {
      const gameDetails: BGGGameDetails = {
        id: cachedData.id,
        name: cachedData.name,
        yearpublished: cachedData.yearpublished || '',
        minplayers: cachedData.minplayers || '',
        maxplayers: cachedData.maxplayers || '',
        playingtime: cachedData.playingtime || '',
        minage: cachedData.minage || '',
        description: cachedData.description || '',
        thumbnail: cachedData.thumbnail || '',
        image: cachedData.image || '',
        rating: cachedData.average || '',
        bayesaverage: cachedData.bayesaverage || '',
        weight: cachedData.weight || '',
        rank: cachedData.rank || '',
        mechanics: cachedData.mechanics || [],
        categories: cachedData.categories || [],
        designers: cachedData.designers || [],
        alternateNames: cachedData.alternateNames || [],
        versions: cachedData.versions || [],
        type: cachedData.type as 'boardgame' | 'boardgameexpansion',
        isExpansion: cachedData.type === 'boardgameexpansion' || cachedData.hasInboundExpansionLink,
        hasInboundExpansionLink: cachedData.hasInboundExpansionLink
      }
      
      results.push({ gameId, game: gameDetails })
    }

    // Fetch uncached games in parallel batches
    if (uncachedIds.length > 0) {
      try {
        // Use the optimized batch metadata fetching (which now processes batches in parallel)
        const xmlResponse = await apiClient.getBatchMetadata(uncachedIds)
        const cleanedXml = cleanXML(xmlResponse)
        const metadata = extractMetadata(cleanedXml)
        
        console.log(`✅ Batch Game Details: Fetched metadata for ${metadata.length} uncached games`)

        // Cache the new metadata
        await cacheManager.cacheMetadataBatch(metadata)

        // Create metadata map for quick lookup
        const metadataMap = new Map(metadata.map(meta => [meta.id, meta]))
        
        // Process uncached games
        for (const gameId of uncachedIds) {
          const meta = metadataMap.get(gameId)
          
          if (meta) {
            const gameDetails: BGGGameDetails = {
              id: meta.id,
              name: meta.name,
              yearpublished: meta.yearpublished || '',
              minplayers: meta.minplayers || '',
              maxplayers: meta.maxplayers || '',
              playingtime: meta.playingtime || '',
              minage: meta.minage || '',
              description: meta.description || '',
              thumbnail: meta.thumbnail || '',
              image: meta.image || '',
              rating: meta.average || '',
              bayesaverage: meta.bayesaverage || '',
              weight: meta.weight || '',
              rank: meta.rank || '',
              mechanics: meta.mechanics || [],
              categories: meta.categories || [],
              designers: meta.designers || [],
              alternateNames: meta.alternateNames || [],
              versions: meta.versions || [],
              type: meta.type as 'boardgame' | 'boardgameexpansion',
              isExpansion: meta.type === 'boardgameexpansion' || meta.hasInboundExpansionLink,
              hasInboundExpansionLink: meta.hasInboundExpansionLink
            }
            
            results.push({ gameId, game: gameDetails })
          } else {
            results.push({ 
              gameId, 
              game: null, 
              error: 'Game not found or failed to parse' 
            })
          }
        }
      } catch (error) {
        console.error('❌ Batch Game Details: Failed to fetch uncached games:', error)
        
        // Add error results for uncached games
        for (const gameId of uncachedIds) {
          results.push({ 
            gameId, 
            game: null, 
            error: error instanceof Error ? error.message : 'Failed to fetch game details' 
          })
        }
      }
    }

    // Sort results to match input order
    const sortedResults = limitedIds.map(gameId => 
      results.find(r => r.gameId === gameId) || { gameId, game: null, error: 'Not processed' }
    )

    console.log('✅ Batch Game Details API: Completed for', limitedIds.length, 'games')
    
    return NextResponse.json({ 
      results: sortedResults,
      summary: {
        total: limitedIds.length,
        successful: sortedResults.filter(r => r.game !== null).length,
        failed: sortedResults.filter(r => r.game === null).length,
        cached: cachedGames.size,
        fetched: uncachedIds.length
      }
    })
    
  } catch (error) {
    console.error('❌ Batch Game Details API: Request failed:', error)
    
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
