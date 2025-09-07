import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀🚀🚀 LISTINGS GET ENDPOINT CALLED 🚀🚀🚀');
    
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
    console.log('📝 Fetching listing ID:', listingId);

    // Get Supabase client
    const supabase = await createClient();

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

    // Fetch the listing
    const { data: listing, error: fetchError } = await supabase
      .from('game_listings')
      .select('*')
      .eq('id', listingId)
      .eq('user_id', userProfile.id) // Ensure user owns the listing
      .single();

    if (fetchError) {
      console.error('❌ Error fetching listing:', fetchError);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    console.log('✅ Listing fetched successfully');

    return NextResponse.json({
      success: true,
      listing
    });

  } catch (error) {
    console.error('❌ Error in get listing:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
