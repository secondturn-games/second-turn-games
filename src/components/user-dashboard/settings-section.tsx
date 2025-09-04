'use client';

import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { User, LogOut } from 'lucide-react';

interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  favorite_genres: string[];
  game_collection: string[];
  total_listings: number;
  total_sales: number;
  is_verified: boolean;
  trust_score: number;
  created_at: string;
  updated_at: string;
  last_active: string;
}

interface SettingsSectionProps {
  profile: Profile;
}

export function SettingsSection({ profile }: SettingsSectionProps) {
  const { signOut, openUserProfile } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleManageInClerk = () => {
    // Open Clerk User Profile modal
    openUserProfile();
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* User Profile Section */}
        <div className="bg-light-beige-50 rounded-lg p-4">
          <p className="text-xs text-dark-green-500 mb-4">
            Manage your account settings, profile picture, email, and security through your Clerk dashboard.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-soft">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-dark-green-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-dark-green-600">{profile.first_name} {profile.last_name}</h4>
              <p className="text-xs text-dark-green-500">{profile.email}</p>
              <button 
                onClick={handleManageInClerk}
                className="mt-1 text-xs text-vibrant-orange-600 hover:text-vibrant-orange-700 font-medium"
              >
                Manage Account →
              </button>
            </div>
          </div>
        </div>

        {/* Simple Sign Out Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
