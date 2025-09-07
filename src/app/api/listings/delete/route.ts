import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🚀🚀🚀 LISTINGS DELETE ENDPOINT CALLED 🚀🚀🚀');
    
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
    console.log('📝 Deleting listing ID:', listingId);

    // Get Supabase client
    const supabase = await createClient();

    // First, verify the listing belongs to the user
    const { data: existingListing, error: fetchError } = await supabase
      .from('game_listings')
      .select('user_id, photos')
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
      return NextResponse.json({ error: 'Unauthorized to delete this listing' }, { status: 403 });
    }

    console.log('✅ User authorized to delete listing');

    // Delete associated images if they exist
    if (existingListing.photos && Array.isArray(existingListing.photos)) {
      console.log('📝 Cleaning up associated images...');
      for (const photoUrl of existingListing.photos) {
        try {
          // For local storage, extract filename and delete
          if (photoUrl.startsWith('/uploads/')) {
            const filename = photoUrl.split('/').pop();
            if (filename) {
              const { unlink } = await import('fs/promises');
              const { join } = await import('path');
              const filePath = join(process.cwd(), 'public', 'uploads', filename);
              await unlink(filePath).catch(() => {
                // File might not exist, which is okay
                console.log('Image file not found, skipping:', filename);
              });
            }
          }
        } catch (imageError) {
          console.warn('Warning: Could not delete image:', photoUrl, imageError);
          // Continue with listing deletion even if image cleanup fails
        }
      }
    }

    // Delete the listing
    const { error: deleteError } = await supabase
      .from('game_listings')
      .delete()
      .eq('id', listingId);

    if (deleteError) {
      console.error('❌ Error deleting listing:', deleteError);
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    console.log('✅ Listing deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in delete listing:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
