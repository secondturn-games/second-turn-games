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
  const { signOut } = useClerk();
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
    // Open Clerk Dashboard in a new tab
    window.open('/user-profile', '_blank');
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-dark-green-600 mb-2">Settings</h2>
        <p className="text-sm text-dark-green-500">
          Manage your account and session
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Management */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-light-beige-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-vibrant-orange-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-vibrant-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-green-600">Account Management</h3>
                <p className="text-xs text-dark-green-500">Manage your account settings, security, and personal information</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleManageInClerk}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-light-beige-50 transition-colors duration-200 text-left group"
            >
              <div className="w-8 h-8 bg-light-beige-100 rounded-lg flex items-center justify-center group-hover:bg-vibrant-orange-100 transition-colors duration-200">
                <User className="w-4 h-4 text-dark-green-500 group-hover:text-vibrant-orange-600 transition-colors duration-200" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-dark-green-600 text-sm">Manage in Clerk</h4>
                <p className="text-xs text-dark-green-500">Update profile, security, and account settings</p>
              </div>
              <div className="text-dark-green-400 group-hover:text-vibrant-orange-600 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-light-beige-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-green-600">Account Actions</h3>
                <p className="text-xs text-dark-green-500">Manage your account session</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-600 text-sm">Sign Out</h4>
                <p className="text-xs text-red-500">End your current session</p>
              </div>
              {isSigningOut && (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-light-beige-50 rounded-xl p-4">
          <h4 className="font-medium text-dark-green-600 mb-3 text-sm">Account Information</h4>
          <div className="space-y-2 text-xs text-dark-green-500">
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Member since:</span>
              <span className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last active:</span>
              <span className="font-medium">{new Date(profile.last_active).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
