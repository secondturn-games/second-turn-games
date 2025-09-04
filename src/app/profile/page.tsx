import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserDashboard } from '@/components/user-dashboard/user-dashboard';

export default async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Get user data from Clerk
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
  }

  const supabase = await createClient();
  
  // Check if profile exists
  const profileResult = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  let profile = profileResult.data;
  const profileError = profileResult.error;

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-dark-green-600 mb-4">
            Your Dashboard
          </h1>
          <p className="text-xl text-dark-green-500">
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
}
