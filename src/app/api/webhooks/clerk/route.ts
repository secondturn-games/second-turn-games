import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  if (eventType === 'user.created') {
    const { id: userId, email_addresses, first_name, last_name, image_url } = evt.data;
    
    console.log('User created data:', {
      userId,
      email_addresses,
      first_name,
      last_name,
      image_url,
      primary_email_address_id: evt.data.primary_email_address_id
    });
    
    try {
      const supabase = await createClient();
      
      // Get the primary email - handle different Clerk v6 structures
      let primaryEmail = null;
      
      if (email_addresses && Array.isArray(email_addresses)) {
        // Try to find primary email by ID first
        if (evt.data.primary_email_address_id) {
          primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
        }
        
        // Fallback to first verified email
        if (!primaryEmail) {
          primaryEmail = email_addresses.find(email => email.verification?.status === 'verified');
        }
        
        // Fallback to first email
        if (!primaryEmail && email_addresses.length > 0) {
          primaryEmail = email_addresses[0];
        }
      }
      
      console.log('Primary email found:', primaryEmail);
      
      // Validate we have required data
      if (!primaryEmail?.email_address) {
        console.error('No valid email found for user:', userId);
        return new Response('No valid email found', { status: 400 });
      }
      
      // Insert user profile into Supabase
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          clerk_id: userId,
          email: primaryEmail.email_address,
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: image_url || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting user profile:', error);
        return new Response('Error creating user profile', { status: 500 });
      }

      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id: userId, email_addresses, first_name, last_name, image_url } = evt.data;
    
    try {
      const supabase = await createClient();
      
      // Get the primary email
      const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
      
      // Update user profile in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email: primaryEmail?.email_address || '',
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: image_url || '',
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return new Response('Error updating user profile', { status: 500 });
      }

      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id: userId } = evt.data;
    
    try {
      const supabase = await createClient();
      
      // Delete user profile from Supabase
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('clerk_id', userId);

      if (error) {
        console.error('Error deleting user profile:', error);
        return new Response('Error deleting user profile', { status: 500 });
      }

      console.log('User profile deleted successfully');
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
