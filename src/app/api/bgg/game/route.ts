import { NextRequest, NextResponse } from 'next/server'
import { BGGAPIClient } from '@/lib/bgg/api-client'
import { extractMetadata, cleanXML } from '@/lib/bgg/parsers/xml-parser'
import type { BGGGameDetails } from '@/lib/bgg/types'

const apiClient = new BGGAPIClient()

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

    console.log('🔍 API Route: Game details request for ID:', gameId)

    // Call BGG API directly (server-side, no CORS issues)
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

    console.log('✅ API Route: Game details completed for ID:', gameId)
    
    return NextResponse.json({ game: gameDetails })
    
  } catch (error) {
    console.error('❌ API Route: Game details failed:', error)
    
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
