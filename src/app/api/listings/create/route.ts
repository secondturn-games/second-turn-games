import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { ListingFormData } from '@/components/listing/types'

// Validation schema for the listing data
const createListingSchema = z.object({
  // Basic info
  title: z.string().min(1, 'Title is required'),
  price: z.number().positive('Price must be positive'),
  negotiable: z.boolean().default(false),
  price_notes: z.string().or(z.literal('')).or(z.null()).optional(),
  
  // BGG Integration
  bgg_game_id: z.string().optional(),
  bgg_version_id: z.string().optional(),
  game_name: z.string().optional(),
  game_image_url: z.string().url().or(z.literal('')).or(z.null()).optional(),
  version_name: z.string().optional(),
  version_image_url: z.string().url().or(z.literal('')).or(z.null()).optional(),
  custom_title: z.string().or(z.literal('')).or(z.null()).optional(),
  suggested_alternate_name: z.string().optional(),
  
  // Game Details
  game_details: z.object({
    min_players: z.string().optional(),
    max_players: z.string().optional(),
    playing_time: z.string().optional(),
    min_age: z.string().optional(),
    year_published: z.string().optional(),
    languages: z.array(z.string()).optional(),
    publishers: z.array(z.string()).optional(),
    designers: z.array(z.string()).optional(),
    rank: z.string().optional(),
    rating: z.string().optional(),
  }).optional(),
  
  // Game Condition
  game_condition: z.object({
    activeFilter: z.string().optional(),
    boxCondition: z.string().optional(),
    boxDescription: z.string().or(z.literal('')).or(z.null()).optional(),
    completeness: z.string().or(z.literal('')).or(z.null()).optional(),
    missingDescription: z.string().or(z.literal('')).or(z.null()).optional(),
    componentCondition: z.string().or(z.literal('')).or(z.null()).optional(),
    componentConditionDescription: z.string().or(z.literal('')).or(z.null()).optional(),
    extras: z.array(z.string()).optional(),
    extrasDescription: z.string().or(z.literal('')).or(z.null()).optional(),
    photos: z.array(z.string()).optional(),
    photoNotes: z.string().or(z.literal('')).or(z.null()).optional(),
  }).optional(),
  
  // Shipping
  shipping: z.object({
    pickup: z.object({
      enabled: z.boolean().default(false),
      country: z.string().or(z.literal('')).or(z.null()).optional(),
      localArea: z.string().or(z.literal('')).or(z.null()).optional(),
      meetingDetails: z.string().or(z.literal('')).or(z.null()).optional(),
    }).optional(),
    parcelLocker: z.object({
      enabled: z.boolean().default(false),
      priceType: z.enum(['included', 'separate']).or(z.literal('')).or(z.null()).optional(),
      price: z.string().or(z.literal('')).or(z.null()).optional(),
      countries: z.array(z.string()).optional(),
      countryPrices: z.record(z.string(), z.string()).optional(),
    }).optional(),
    notes: z.string().or(z.literal('')).or(z.null()).optional(),
  }).optional(),
})

export async function POST(req: Request) {
  console.log('🚀🚀🚀 LISTINGS CREATE ENDPOINT CALLED 🚀🚀🚀')
  try {
    console.log('🚀 Starting listing creation...')
    
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      console.log('❌ No user ID found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('✅ User authenticated:', userId)

    // Parse and validate request body
    const body = await req.json()
    console.log('📝 Request body received:', JSON.stringify(body, null, 2))
    
    const validatedData = createListingSchema.parse(body)
    console.log('✅ Data validated successfully')

    // Get Supabase client
    const supabase = await createClient()

    // Get user profile to get user_id
    console.log('🔍 Fetching user profile for clerk_id:', userId)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (profileError || !userProfile) {
      console.error('❌ Error fetching user profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'User profile not found', details: profileError?.message },
        { status: 404 }
      )
    }
    
    console.log('✅ User profile found:', userProfile.id)

    // Transform the data for database insertion
    const listingData = {
      // Basic info
      title: validatedData.title,
      price: validatedData.price,
      negotiable: validatedData.negotiable,
      price_notes: validatedData.price_notes,
      
      // BGG Integration
      bgg_game_id: validatedData.bgg_game_id,
      bgg_version_id: validatedData.bgg_version_id,
      game_name: validatedData.game_name,
      game_image_url: validatedData.game_image_url,
      version_name: validatedData.version_name,
      version_image_url: validatedData.version_image_url,
      custom_title: validatedData.custom_title,
      suggested_alternate_name: validatedData.suggested_alternate_name,
      
      // Game Details
      min_players: validatedData.game_details?.min_players ? parseInt(validatedData.game_details.min_players) : null,
      max_players: validatedData.game_details?.max_players ? parseInt(validatedData.game_details.max_players) : null,
      playing_time: validatedData.game_details?.playing_time ? parseInt(validatedData.game_details.playing_time) : null,
      min_age: validatedData.game_details?.min_age ? parseInt(validatedData.game_details.min_age) : null,
      year_published: validatedData.game_details?.year_published ? parseInt(validatedData.game_details.year_published) : null,
      languages: validatedData.game_details?.languages || null,
      publishers: validatedData.game_details?.publishers || null,
      designers: validatedData.game_details?.designers || null,
      bgg_rank: validatedData.game_details?.rank ? parseInt(validatedData.game_details.rank) : null,
      bgg_rating: validatedData.game_details?.rating ? parseFloat(validatedData.game_details.rating) : null,
      
      // Game Condition
      box_condition: validatedData.game_condition?.boxCondition,
      box_description: validatedData.game_condition?.boxDescription,
      completeness: validatedData.game_condition?.completeness,
      missing_description: validatedData.game_condition?.missingDescription,
      component_condition: validatedData.game_condition?.componentCondition,
      component_condition_description: validatedData.game_condition?.componentConditionDescription,
      extras: validatedData.game_condition?.extras || null,
      extras_description: validatedData.game_condition?.extrasDescription,
      photo_urls: validatedData.game_condition?.photos || null,
      photo_notes: validatedData.game_condition?.photoNotes,
      
      // Shipping
      pickup_enabled: validatedData.shipping?.pickup?.enabled || false,
      pickup_country: validatedData.shipping?.pickup?.country,
      pickup_local_area: validatedData.shipping?.pickup?.localArea,
      pickup_meeting_details: validatedData.shipping?.pickup?.meetingDetails,
      parcel_locker_enabled: validatedData.shipping?.parcelLocker?.enabled || false,
      parcel_locker_price_type: validatedData.shipping?.parcelLocker?.priceType,
      parcel_locker_price: validatedData.shipping?.parcelLocker?.price ? parseFloat(validatedData.shipping.parcelLocker.price) : null,
      parcel_locker_countries: validatedData.shipping?.parcelLocker?.countries || null,
      parcel_locker_country_prices: validatedData.shipping?.parcelLocker?.countryPrices || null,
      shipping_notes: validatedData.shipping?.notes,
      
      // Location (use pickup location if available)
      location: validatedData.shipping?.pickup?.localArea || null,
      country: validatedData.shipping?.pickup?.country || null,
      local_area: validatedData.shipping?.pickup?.localArea || null,
      
      // User
      user_id: userProfile.id,
      
      // Legacy fields for backward compatibility
      condition: validatedData.game_condition?.boxCondition || 'unknown',
      image_url: validatedData.game_image_url || validatedData.version_image_url,
      genre: null, // Could be derived from BGG data
      player_count: validatedData.game_details?.min_players && validatedData.game_details?.max_players 
        ? `${validatedData.game_details.min_players}-${validatedData.game_details.max_players}` 
        : null,
      age_range: validatedData.game_details?.min_age ? `${validatedData.game_details.min_age}+` : null,
      language: validatedData.game_details?.languages?.[0] || null,
      expansion: false, // Could be derived from BGG data
    }

    // Insert the listing
    console.log('💾 Inserting listing data:', JSON.stringify(listingData, null, 2))
    const { data: newListing, error: insertError } = await supabase
      .from('game_listings')
      .insert(listingData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating listing:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create listing', details: insertError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Listing created successfully:', newListing.id)

    // Note: User's total listings count could be updated here if needed
    // For now, we'll skip this to keep the implementation simple

    return NextResponse.json({
      success: true,
      message: 'Listing created successfully',
      listing: newListing
    })

  } catch (error) {
    console.error('Error in create listing:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.issues)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
