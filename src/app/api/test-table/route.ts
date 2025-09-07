import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀🚀🚀 TEST TABLE ENDPOINT CALLED 🚀🚀🚀');
    
    const supabase = await createClient();

    // Check if game_listings table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('game_listings')
      .select('id, title, is_active')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing game_listings table:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Table access error',
        details: tableError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      sampleData: tableInfo,
      message: 'Table accessible'
    });

  } catch (error) {
    console.error('❌ Error in test table:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
