'use client';

import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { User, LogOut, ChevronDown, ChevronUp, Shield, Lock, Users, Globe } from 'lucide-react';

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
  const [isClerkInfoExpanded, setIsClerkInfoExpanded] = useState(false);

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
        {/* Microcopy */}
        <p className="text-xs text-dark-green-500">
          This is where you adjust your account rules. We use Clerk to keep everything secure.
        </p>

        {/* User Profile Section */}
        <div className="bg-light-beige-50 rounded-lg p-4">
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

        {/* Expandable Clerk Info Box */}
        <div className="bg-light-beige-50 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsClerkInfoExpanded(!isClerkInfoExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-light-beige-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-vibrant-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-vibrant-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-dark-green-600">Learn more about Clerk</h3>
                <p className="text-xs text-dark-green-500">How we keep your account secure</p>
              </div>
            </div>
            {isClerkInfoExpanded ? (
              <ChevronUp className="w-4 h-4 text-dark-green-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-dark-green-400" />
            )}
          </button>
          
          {isClerkInfoExpanded && (
            <div className="px-4 pb-4 border-t border-light-beige-200">
              <div className="pt-4 space-y-4">
                <p className="text-xs text-dark-green-600">
                  Clerk makes sure the &quot;rules of logging in&quot; are followed every time you sign in.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-dark-green-600 mb-1">Setup phase</h4>
                      <p className="text-xs text-dark-green-500">how you log in (email, Google, etc.)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-dark-green-600 mb-1">Security checks</h4>
                      <p className="text-xs text-dark-green-500">making sure no one else sneaks into your account</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-dark-green-600 mb-1">Player management</h4>
                      <p className="text-xs text-dark-green-500">keeping track of your sessions across devices</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-light-beige-200">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-dark-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-medium text-dark-green-600 mb-1">Where your data lives:</h4>
                      <p className="text-xs text-dark-green-500">
                        Clerk is based in the USA, but EU user data is stored in Germany & Ireland under GDPR compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
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
