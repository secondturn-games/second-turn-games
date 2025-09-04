import { createClient } from './client';

/**
 * Updates the last_active timestamp for a user profile (client-side)
 * @param clerkId - The Clerk user ID
 * @returns Promise<boolean> - Success status
 */
export async function updateLastActiveClient(clerkId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        last_active: new Date().toISOString() 
      })
      .eq('clerk_id', clerkId);

    if (error) {
      console.error('Error updating last_active:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLastActiveClient:', error);
    return false;
  }
}
