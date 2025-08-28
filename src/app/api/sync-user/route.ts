import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get user data from Clerk
    const user = await currentUser();
    
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Get primary email
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
    
    if (!primaryEmail?.emailAddress) {
      return new Response('No valid email found', { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Profile already exists',
        profile: existingProfile 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert({
        clerk_id: userId,
        email: primaryEmail.emailAddress,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        avatar_url: user.imageUrl || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Profile created successfully',
      profile: newProfile 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in sync-user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
