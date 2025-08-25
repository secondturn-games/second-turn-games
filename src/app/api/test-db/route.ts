import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection by querying the user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: error.message 
        },
        { status: 500 }
      )
    }
    
    // Test if we can access the listings table
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select('count')
      .limit(1)
    
    if (listingsError) {
      console.error('Listings table error:', listingsError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Listings table access failed',
          details: listingsError.message 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      tables: {
        user_profiles: '✅ Accessible',
        listings: '✅ Accessible',
        reviews: '✅ Accessible (assumed)'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
