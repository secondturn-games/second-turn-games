'use client';

import { useState } from 'react';
import { User, Settings, BarChart3, Package, Heart, MessageCircle } from 'lucide-react';
import { ProfileForm } from './profile-form';
import { UserStats } from './user-stats';
import { UserListings } from './user-listings';

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

interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  condition: string;
  location?: string;
  image_url?: string;
  genre?: string;
  player_count?: string;
  age_range?: string;
  language?: string;
  expansion: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  views: number;
  favorites: number;
}

interface UserDashboardProps {
  profile: Profile;
  userListings: Listing[];
}

export function UserDashboard({ profile, userListings }: UserDashboardProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
    { id: 'stats', label: 'Statistics', icon: BarChart3, description: 'View your activity and performance' },
    { id: 'listings', label: 'My Listings', icon: Package, description: 'Manage your game listings' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account preferences and notifications' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileForm profile={profile} />;
      case 'stats':
        return <UserStats profile={profile} listings={userListings} />;
      case 'listings':
        return <UserListings listings={userListings} />;
      case 'settings':
        return <div className="p-8 text-center text-dark-green-500">Settings coming soon!</div>;
      default:
        return <UserOverview profile={profile} listings={userListings} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Navigation - Similar to game listing flow */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(isActive ? null : section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-vibrant-orange text-white shadow-medium'
                    : 'bg-light-beige-50 text-dark-green-600 hover:bg-light-beige-100 hover:shadow-soft'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{section.label}</span>
                <span className="text-xs opacity-75">⌵</span>
              </button>
            );
          })}
        </div>
        
        {/* Section Description */}
        {activeSection && (
          <div className="mt-3 p-3 bg-light-beige-50 rounded-lg">
            <p className="text-xs text-dark-green-600">
              {sections.find(s => s.id === activeSection)?.description}
            </p>
          </div>
        )}
      </div>

      {/* Active Section Content */}
      {activeSection && (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {renderSection()}
        </div>
      )}

      {/* Default Overview when no section is selected */}
      {!activeSection && (
        <UserOverview profile={profile} listings={userListings} />
      )}
    </div>
  );
}

// Overview component for when no section is active
function UserOverview({ profile, listings }: { profile: Profile; listings: Listing[] }) {
  const activeListings = listings.filter(listing => listing.is_active);
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalFavorites = listings.reduce((sum, listing) => sum + listing.favorites, 0);

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-vibrant-orange-50 to-warm-yellow-50 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-medium">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-vibrant-orange-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-dark-green-600 mb-1">
              Welcome back, {profile.first_name || 'Gamer'}!
            </h2>
            <p className="text-sm text-dark-green-500">
              {profile.display_name || profile.email} • Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-soft text-center">
          <div className="w-8 h-8 bg-vibrant-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Package className="w-4 h-4 text-vibrant-orange-600" />
          </div>
          <div className="text-lg font-bold text-dark-green-600 mb-1">{activeListings.length}</div>
          <div className="text-xs text-dark-green-500">Active Listings</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-soft text-center">
          <div className="w-8 h-8 bg-warm-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="w-4 h-4 text-warm-yellow-600" />
          </div>
          <div className="text-lg font-bold text-dark-green-600 mb-1">{totalViews}</div>
          <div className="text-xs text-dark-green-500">Total Views</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-soft text-center">
          <div className="w-8 h-8 bg-dark-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Heart className="w-4 h-4 text-dark-green-600" />
          </div>
          <div className="text-lg font-bold text-dark-green-600 mb-1">{totalFavorites}</div>
          <div className="text-xs text-dark-green-500">Favorites</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-soft text-center">
          <div className="w-8 h-8 bg-vibrant-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-4 h-4 text-vibrant-orange-600" />
          </div>
          <div className="text-lg font-bold text-dark-green-600 mb-1">{profile.trust_score}</div>
          <div className="text-xs text-dark-green-500">Trust Score</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <h3 className="text-base font-semibold text-dark-green-600 mb-3">Recent Activity</h3>
        {activeListings.length > 0 ? (
          <div className="space-y-2">
            {activeListings.slice(0, 3).map((listing) => (
              <div key={listing.id} className="flex items-center gap-3 p-2 bg-light-beige-50 rounded-lg">
                <div className="w-8 h-8 bg-light-beige-200 rounded flex items-center justify-center">
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.title} className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-dark-green-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-dark-green-600">{listing.title}</h4>
                  <p className="text-xs text-dark-green-500">€{listing.price} • {listing.views} views</p>
                </div>
                <div className="text-xs text-dark-green-400">
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-dark-green-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No listings yet. Start by creating your first game listing!</p>
          </div>
        )}
      </div>
    </div>
  );
}
