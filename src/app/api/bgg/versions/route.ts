import { NextRequest, NextResponse } from 'next/server'
import { BGGService } from '@/lib/bgg/bgg-service'
import type { LanguageMatchedVersion } from '@/lib/bgg/types'

const bggService = new BGGService()

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

    console.log('🔍 API Route: Language-matched versions request for ID:', gameId)

    // Call BGG service directly (server-side, no CORS issues)
    const languageMatchedVersions = await bggService.getLanguageMatchedVersions(gameId)
    
    if (languageMatchedVersions.length === 0) {
      return NextResponse.json(
        { error: 'No versions found for this game' },
        { status: 404 }
      )
    }

    console.log('✅ API Route: Language-matched versions completed for ID:', gameId, 'Found:', languageMatchedVersions.length)
    
    return NextResponse.json({ versions: languageMatchedVersions })
    
  } catch (error) {
    console.error('❌ API Route: Language-matched versions failed:', error)
    
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
