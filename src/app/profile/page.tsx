import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

  return (
    <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-dark-green-600 mb-4">
            Your Profile
          </h1>
          <p className="text-xl text-dark-green-500">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-shadow duration-200">
          {profile ? (
            <div className="space-y-8">
              {/* Profile Info Display */}
              <div className="border-b border-light-beige-200 pb-6">
                <h3 className="text-lg font-semibold text-dark-green-600 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-green-500 mb-1">Email</label>
                    <p className="text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg border border-light-beige-200">
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-green-500 mb-1">Member Since</label>
                    <p className="text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg border border-light-beige-200">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div>
                <h3 className="text-lg font-semibold text-dark-green-600 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-green-500 mb-2">First Name</label>
                    <p className="text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg border border-light-beige-200">
                      {profile.first_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-green-500 mb-2">Last Name</label>
                    <p className="text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg border border-light-beige-200">
                      {profile.last_name || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-vibrant-orange-50 text-vibrant-orange-600 rounded-lg border border-vibrant-orange-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Profile editing will be available soon!</span>
                </div>
              </div>
            </div>
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
    </div>
  );
}
