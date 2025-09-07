import { NextRequest, NextResponse } from 'next/server'
import { CacheManager } from '@/lib/bgg/cache-manager'

const cacheManager = new CacheManager()

export async function GET(request: NextRequest) {
  try {
    const stats = cacheManager.getCacheStats()
    const efficiency = await cacheManager.getCacheEfficiency()
    
    return NextResponse.json({
      stats,
      efficiency,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Cache stats API failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    cacheManager.clearAllCaches()
    
    return NextResponse.json({
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Cache clear API failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to clear caches' },
      { status: 500 }
    )
  }
}
