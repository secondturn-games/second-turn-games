import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for updating listings (similar to create but all fields optional)
const updateListingSchema = z.object({
  title: z.string().optional(),
  price: z.number().optional(),
  negotiable: z.boolean().optional(),
  price_notes: z.string().or(z.literal('')).or(z.null()).optional(),
  bgg_game_id: z.string().optional(),
  bgg_version_id: z.string().optional(),
  game_name: z.string().optional(),
  game_image_url: z.string().url().or(z.literal('')).or(z.null()).optional(),
  version_name: z.string().optional(),
  version_image_url: z.string().url().or(z.literal('')).or(z.null()).optional(),
  custom_title: z.string().or(z.literal('')).or(z.null()).optional(),
  suggested_alternate_name: z.string().optional(),
  
  game_details: z.object({
    minPlayers: z.string().optional(),
    maxPlayers: z.string().optional(),
    playingTime: z.string().optional(),
    minAge: z.string().optional(),
    yearPublished: z.string().optional(),
    languages: z.array(z.string()).optional(),
    publishers: z.array(z.string()).optional(),
    designers: z.array(z.string()).optional(),
    rank: z.string().optional(),
    rating: z.string().optional(),
  }).optional(),
  
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
  
  shipping: z.object({
    pickup: z.object({
      enabled: z.boolean().optional(),
      country: z.string().or(z.literal('')).or(z.null()).optional(),
      localArea: z.string().or(z.literal('')).or(z.null()).optional(),
      meetingDetails: z.string().or(z.literal('')).or(z.null()).optional(),
    }).optional(),
    parcelLocker: z.object({
      enabled: z.boolean().optional(),
      priceType: z.string().or(z.literal('')).or(z.null()).optional(),
      price: z.string().or(z.literal('')).or(z.null()).optional(),
      countries: z.array(z.string()).optional(),
      countryPrices: z.record(z.string(), z.string()).optional(),
    }).optional(),
    notes: z.string().or(z.literal('')).or(z.null()).optional(),
  }).optional(),
  
  is_active: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    console.log('🚀🚀🚀 LISTINGS UPDATE ENDPOINT CALLED 🚀🚀🚀');
    
    // Get listing ID from URL
    const url = new URL(request.url);
    const listingId = url.searchParams.get('id');
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', userId);
    console.log('📝 Updating listing ID:', listingId);

    // Parse request body
    const body = await request.json();
    console.log('📝 Request body received:', JSON.stringify(body, null, 2));

    // Validate data
    const validatedData = updateListingSchema.parse(body);
    console.log('✅ Data validated successfully');

    // Get Supabase client
    const supabase = await createClient();

    // First, verify the listing belongs to the user
    const { data: existingListing, error: fetchError } = await supabase
      .from('game_listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching listing:', fetchError);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Get user profile to get user_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user owns the listing
    if (existingListing.user_id !== userProfile.id) {
      console.error('❌ User does not own this listing');
      return NextResponse.json({ error: 'Unauthorized to update this listing' }, { status: 403 });
    }

    console.log('✅ User authorized to update listing');

    // Prepare update data (convert camelCase to snake_case for database)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Map frontend fields to database fields
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.negotiable !== undefined) updateData.negotiable = validatedData.negotiable;
    if (validatedData.price_notes !== undefined) updateData.price_notes = validatedData.price_notes;
    if (validatedData.bgg_game_id !== undefined) updateData.bgg_game_id = validatedData.bgg_game_id;
    if (validatedData.bgg_version_id !== undefined) updateData.bgg_version_id = validatedData.bgg_version_id;
    if (validatedData.game_name !== undefined) updateData.game_name = validatedData.game_name;
    if (validatedData.game_image_url !== undefined) updateData.game_image_url = validatedData.game_image_url;
    if (validatedData.version_name !== undefined) updateData.version_name = validatedData.version_name;
    if (validatedData.version_image_url !== undefined) updateData.version_image_url = validatedData.version_image_url;
    if (validatedData.custom_title !== undefined) updateData.custom_title = validatedData.custom_title;
    if (validatedData.suggested_alternate_name !== undefined) updateData.suggested_alternate_name = validatedData.suggested_alternate_name;
    if (validatedData.is_active !== undefined) updateData.is_active = validatedData.is_active;

    // Handle nested objects
    if (validatedData.game_details) {
      updateData.game_details = validatedData.game_details;
    }
    if (validatedData.game_condition) {
      updateData.game_condition = validatedData.game_condition;
    }
    if (validatedData.shipping) {
      updateData.shipping = validatedData.shipping;
    }

    console.log('📝 Update data prepared:', JSON.stringify(updateData, null, 2));

    // Update the listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('game_listings')
      .update(updateData)
      .eq('id', listingId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating listing:', updateError);
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    console.log('✅ Listing updated successfully');

    return NextResponse.json({
      success: true,
      listing: updatedListing
    });

  } catch (error) {
    console.error('❌ Error in update listing:', error);
    
    if (error instanceof z.ZodError) {
      const details = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
