import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀🚀🚀 LISTINGS BROWSE ENDPOINT CALLED 🚀🚀🚀');
    
    // Get query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const condition = url.searchParams.get('condition') || '';
    const priceMin = url.searchParams.get('priceMin') || '';
    const priceMax = url.searchParams.get('priceMax') || '';
    const sortBy = url.searchParams.get('sortBy') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    
    console.log('📝 Query parameters:', {
      search, category, condition, priceMin, priceMax, sortBy, page, limit
    });

    // Get Supabase client
    const supabase = await createClient();

    // Build the query - matching actual database schema
    let query = supabase
      .from('game_listings')
      .select(`
        id,
        title,
        price,
        negotiable,
        game_image_url,
        game_name,
        version_name,
        custom_title,
        box_condition,
        pickup_enabled,
        pickup_country,
        pickup_local_area,
        created_at,
        updated_at,
        views,
        is_active,
        user_id,
        user_profiles!inner(
          first_name,
          last_name,
          local_area,
          country
        )
      `)
      .eq('is_active', true); // Only show active listings

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,game_name.ilike.%${search}%,custom_title.ilike.%${search}%`);
    }

    // Apply category filter (disabled for now)
    // if (category) {
    //   // This could be expanded based on game categories from BGG data
    //   query = query.eq('genre', category);
    // }

    // Apply condition filter
    if (condition) {
      query = query.eq('box_condition', condition);
    }

    // Apply price filters
    if (priceMin) {
      query = query.gte('price', parseFloat(priceMin));
    }
    if (priceMax) {
      query = query.lte('price', parseFloat(priceMax));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'views':
        query = query.order('views', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('📝 Executing query...');

    // Execute the query
    const { data: listings, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    console.log('✅ Listings fetched successfully:', listings?.length || 0);

    // Transform the data to match the expected format
    const transformedListings = listings?.map(listing => {
      const profile = Array.isArray(listing.user_profiles) ? listing.user_profiles[0] : listing.user_profiles;
      
      return {
        id: listing.id,
        title: listing.custom_title || listing.title || listing.game_name,
        price: listing.price,
        negotiable: listing.negotiable,
        condition: listing.box_condition || 'good',
        imageUrl: listing.game_image_url,
        seller: {
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Anonymous',
          rating: 5 // Default rating for now
        },
        location: profile?.local_area || profile?.country || 'Unknown',
        category: 'Board Game', // Default category for now
        gameDetails: {
          box_condition: listing.box_condition,
          pickup_enabled: listing.pickup_enabled,
          pickup_country: listing.pickup_country,
          pickup_local_area: listing.pickup_local_area
        },
        shipping: {
          pickup_enabled: listing.pickup_enabled,
          pickup_country: listing.pickup_country,
          pickup_local_area: listing.pickup_local_area
        },
        views: listing.views || 0,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at
      };
    }) || [];

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('game_listings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      success: true,
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error in browse listings:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
