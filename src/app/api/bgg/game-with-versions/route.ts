import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { BGGService } from '@/lib/bgg/bgg-service'
import { CacheManager } from '@/lib/bgg/cache-manager'
import { extractMetadata, cleanXML } from '@/lib/bgg/parsers/xml-parser'
import type { BGGGameDetails, LanguageMatchedVersion } from '@/lib/bgg/types'

const apiClient = new BGGAPIClient()
const bggService = new BGGService()
const cacheManager = new CacheManager()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('id')

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID parameter "id" is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Combined API Route: Game details + versions request for ID:', gameId)

    // Check cache first
    const cachedGameData = cacheManager.getCachedGameData(gameId)
    if (cachedGameData) {
      console.log('🎯 Cache hit for game details:', gameId)
      
      // Convert cached data to BGGGameDetails format
      const gameDetails: BGGGameDetails = {
        id: cachedGameData.id,
        name: cachedGameData.name,
        yearpublished: cachedGameData.yearpublished || '',
        minplayers: cachedGameData.minplayers || '',
        maxplayers: cachedGameData.maxplayers || '',
        playingtime: cachedGameData.playingtime || '',
        minage: cachedGameData.minage || '',
        description: cachedGameData.description || '',
        thumbnail: cachedGameData.thumbnail || '',
        image: cachedGameData.image || '',
        rating: cachedGameData.average || '',
        bayesaverage: cachedGameData.bayesaverage || '',
        weight: cachedGameData.weight || '',
        rank: cachedGameData.rank || '',
        mechanics: cachedGameData.mechanics || [],
        categories: cachedGameData.categories || [],
        designers: cachedGameData.designers || [],
        alternateNames: cachedGameData.alternateNames || [],
        versions: cachedGameData.versions || [],
        type: cachedGameData.type as 'boardgame' | 'boardgameexpansion',
        isExpansion: cachedGameData.type === 'boardgameexpansion' || cachedGameData.hasInboundExpansionLink,
        hasInboundExpansionLink: cachedGameData.hasInboundExpansionLink
      }

      // Get versions from cache (reuse the same metadata)
      const languageMatchedVersions = await bggService.getLanguageMatchedVersions(gameId)
      
      console.log('✅ Combined API Route: Returning cached data for ID:', gameId)
      return NextResponse.json({ 
        game: gameDetails,
        versions: languageMatchedVersions
      })
    }

    console.log('🔄 Cache miss, fetching from BGG API for ID:', gameId)

    // Single BGG API call that includes both game details and versions
    const xmlResponse = await apiClient.getGameDetails(gameId)
    
    // Clean and parse XML response using existing utilities
    const cleanedXml = cleanXML(xmlResponse)
    const metadata = extractMetadata(cleanedXml)
    
    if (metadata.length === 0) {
      return NextResponse.json(
        { error: 'Game not found or failed to parse game details' },
        { status: 404 }
      )
    }

    const gameMetadata = metadata[0]
    
    // Convert to BGGGameDetails format
    const gameDetails: BGGGameDetails = {
      id: gameMetadata.id,
      name: gameMetadata.name,
      yearpublished: gameMetadata.yearpublished || '',
      minplayers: gameMetadata.minplayers || '',
      maxplayers: gameMetadata.maxplayers || '',
      playingtime: gameMetadata.playingtime || '',
      minage: gameMetadata.minage || '',
      description: gameMetadata.description || '',
      thumbnail: gameMetadata.thumbnail || '',
      image: gameMetadata.image || '',
      rating: gameMetadata.average || '',
      bayesaverage: gameMetadata.bayesaverage || '',
      weight: gameMetadata.weight || '',
      rank: gameMetadata.rank || '',
      mechanics: gameMetadata.mechanics || [],
      categories: gameMetadata.categories || [],
      designers: gameMetadata.designers || [],
      alternateNames: gameMetadata.alternateNames || [],
      versions: gameMetadata.versions || [],
      type: gameMetadata.type as 'boardgame' | 'boardgameexpansion',
      isExpansion: gameMetadata.type === 'boardgameexpansion' || gameMetadata.hasInboundExpansionLink,
      hasInboundExpansionLink: gameMetadata.hasInboundExpansionLink
    }

    // Cache the game metadata for future requests
    await cacheManager.cacheGameData(gameMetadata)

    // Process versions using the existing BGG service logic
    // This reuses the cached metadata from the single API call above
    const languageMatchedVersions = await bggService.getLanguageMatchedVersions(gameId)

    console.log('✅ Combined API Route: Game details + versions completed for ID:', gameId, 'Found versions:', languageMatchedVersions.length)
    
    return NextResponse.json({ 
      game: gameDetails,
      versions: languageMatchedVersions
    })
    
  } catch (error) {
    console.error('❌ Combined API Route: Game details + versions failed:', error)
    
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
      } else if (error.message.includes('not found')) {
        status = 404
        message = 'Game not found.'
      }
    }
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
