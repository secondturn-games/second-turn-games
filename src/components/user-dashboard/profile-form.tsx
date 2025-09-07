'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateLastActiveClient } from '@/lib/supabase/update-last-active-client';
import { isUserOnlineFromStorage } from '@/hooks/use-activity-tracker';
import { User, Save, X, Flag } from 'lucide-react';

// SVG Flag components
const FlagIcon = ({ countryCode, className = "w-6 h-4" }: { countryCode: string; className?: string }) => {
  const flags: Record<string, React.JSX.Element> = {
    'EE': (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#0072CE"/>
        <rect y="160" width="640" height="160" fill="#000"/>
        <rect y="320" width="640" height="160" fill="#FFF"/>
      </svg>
    ),
    'LV': (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="180" fill="#9E3039"/>
        <rect y="180" width="640" height="120" fill="#FFF"/>
        <rect y="300" width="640" height="180" fill="#9E3039"/>
      </svg>
    ),
    'LT': (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <rect width="640" height="160" fill="#FDB913"/>
        <rect y="160" width="640" height="160" fill="#006A44"/>
        <rect y="320" width="640" height="160" fill="#C1272D"/>
      </svg>
    )
  };
  
  return flags[countryCode] || <Flag className={className} />;
};

interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  bio?: string;
  country?: string;
  local_area?: string;
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

interface ProfileFormProps {
  profile: Profile;
}

const countries = [
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' }
];


export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  

  // Get country value from profile
  const countryValue = profile.country || (profile as unknown as Record<string, unknown>).country;
  
  
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    country: (countryValue as string) || '',
    local_area: profile.local_area || '',
    phone: profile.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.display_name,
          country: formData.country,
          local_area: formData.local_area,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      // Update last_active timestamp
      await updateLastActiveClient(profile.clerk_id);
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile.display_name || '',
      country: (countryValue as string) || '',
      local_area: profile.local_area || '',
      phone: profile.phone || ''
    });
    setIsEditing(false);
    setMessage('');
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - lastActive.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }
  };

  // Update online status from localStorage
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(isUserOnlineFromStorage());
    };

    // Initial check
    updateOnlineStatus();

    // Update every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Microcopy */}
        <p className="text-xs text-dark-green-500">
          This is how other players will see you.
        </p>

        {/* User Profile Card */}
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
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-dark-green-600">
                  {profile.display_name || `${profile.first_name} ${profile.last_name}`}
                </h4>
                <FlagIcon countryCode={countryValue as string} className="w-5 h-3" />
                {isOnline && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-dark-green-500">
                  Member since {formatDate(profile.created_at)}
                </p>
                {!isOnline && (
                  <>
                    <span className="text-xs text-dark-green-400">•</span>
                    <p className="text-xs text-dark-green-500">
                      Last seen {formatRelativeTime(profile.last_active)}
                    </p>
                  </>
                )}
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-vibrant-orange text-white rounded-md hover:bg-vibrant-orange-600 transition-colors duration-200 text-xs font-medium"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-light-beige-50 rounded-lg p-4 space-y-4">
              {/* Display Name */}
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-dark-green-600 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 text-sm"
                  placeholder="How you'd like to be known on the platform"
                />
                <p className="text-xs text-dark-green-400 mt-1">This will be shown to other users instead of your real name</p>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-dark-green-600 mb-1">
                  <Flag className="w-4 h-4 inline mr-1" />
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 text-sm"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-dark-green-400 mt-1">This helps buyers understand shipping options and local pickup availability</p>
              </div>

              {/* Local Area */}
              <div>
                <label htmlFor="local_area" className="block text-sm font-medium text-dark-green-600 mb-1">
                  Local Area
                </label>
                <input
                  type="text"
                  id="local_area"
                  name="local_area"
                  value={formData.local_area}
                  onChange={handleInputChange}
                  placeholder="e.g., Tallinn, Riga city center, Vilnius Old Town"
                  className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 text-sm"
                />
                <p className="text-xs text-dark-green-400 mt-1">Specify your city, suburb, or neighborhood for local pickup details</p>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-dark-green-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+37126779625"
                  pattern="^\+[1-9]\d{1,14}$"
                  title="Please enter a valid phone number in E.164 format (e.g., +37126779625)"
                  className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange transition-all duration-200 text-sm"
                />
                <p className="text-xs text-dark-green-400 mt-1">Required for shipping. Use E.164 format: +37126779625</p>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-dark-green-300 text-dark-green-600 rounded-lg hover:bg-light-beige-50 transition-colors duration-200 text-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
