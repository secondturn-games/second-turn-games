import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserDashboard } from '@/components/user-dashboard/user-dashboard';

// Force dynamic rendering since we use cookies() in Supabase client
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  try {
    const { userId } = await auth();
    
    console.log('Profile page - userId:', userId);
    
    if (!userId) {
      console.log('No userId found, redirecting to home');
      redirect('/');
    }

    // Get user data from Clerk
    const user = await currentUser();
    
    console.log('Profile page - user:', user ? 'found' : 'not found');
    
    if (!user) {
      console.log('No user found, redirecting to home');
      redirect('/');
    }

    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    // Debug: Log the actual URL being used
    console.log('Supabase URL being used:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase URL type:', typeof process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase URL length:', process.env.NEXT_PUBLIC_SUPABASE_URL?.length);

    // Validate URL format
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
      console.log('URL validation: PASSED');
    } catch (urlError) {
      console.error('URL validation failed:', urlError);
      throw new Error(`Invalid Supabase URL format: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    }

    // Create Supabase client with error handling
    let supabase;
    try {
      console.log('Creating Supabase client...');
      supabase = await createClient();
      console.log('Supabase client created successfully');
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError);
      throw new Error(`Failed to create Supabase client: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
    }
    
    // Debug: Check if environment variables are available
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      userId: userId
    });
  
  // Check if profile exists
  const profileResult = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  let profile = profileResult.data;
  const profileError = profileResult.error;

  // Log database connection status
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Database error:', profileError);
    throw new Error(`Database error: ${profileError.message}`);
  }

  // If no profile exists, create one automatically
  if (!profile && profileError?.code === 'PGRST116') {
    console.log('Profile not found, creating automatically...');
    
    // Get primary email
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
    
    if (primaryEmail?.emailAddress) {
      const { data: newProfile, error: createError } = await supabase
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

      if (createError) {
        console.error('Error creating profile automatically:', createError);
      } else {
        profile = newProfile;
        console.log('Profile created automatically');
      }
    }
  }

  // Log any errors that aren't "not found"
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError);
  }

  // Fetch user's listings for dashboard
  let userListings = [];
  if (profile) {
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    userListings = listings || [];
  }

  return (
    <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl lg:text-2xl font-display text-dark-green-600 mb-2">
            Your Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Manage your profile, listings, and account settings
          </p>
        </div>

        {profile ? (
          <UserDashboard profile={profile} userListings={userListings} />
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-vibrant-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-vibrant-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-dark-green-500 mb-4 text-lg">
              Profile creation failed. This might be a temporary issue.
            </p>
            <p className="text-sm text-dark-green-400">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
  } catch (error) {
    console.error('Profile page error:', error);
    
    // More detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    });
    
    return (
      <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4 text-lg">
              An error occurred while loading your profile.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please try refreshing the page or contact support if the issue persists.
            </p>
            {/* Debug information - remove in production */}
            <details className="text-left bg-gray-100 p-4 rounded-lg max-w-2xl mx-auto">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Debug Information (for development)
              </summary>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                Error: {errorMessage}
                {'\n\n'}
                Environment Variables:
                - Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}
                - Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
                - Clerk Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing'}
                {'\n\n'}
                Supabase URL Value: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
                {'\n'}
                URL Length: {process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
}
