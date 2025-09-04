'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Save, X, MapPin, Globe } from 'lucide-react';

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

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    language: profile.language || 'en'
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
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      language: profile.language || 'en'
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-dark-green-600 mb-1">Profile Information</h2>
          <p className="text-sm text-dark-green-500">Manage your personal details and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange-600 transition-colors duration-200 text-sm"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Marketplace-Specific Information */}

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
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:ring-2 focus:ring-vibrant-orange focus:border-transparent transition-all duration-200 disabled:bg-light-beige-50 disabled:text-dark-green-400 text-sm"
            placeholder="How you'd like to be known on the platform"
          />
          <p className="text-xs text-dark-green-400 mt-1">This will be shown to other users instead of your real name</p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-dark-green-600 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={3}
            className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:ring-2 focus:ring-vibrant-orange focus:border-transparent transition-all duration-200 disabled:bg-light-beige-50 disabled:text-dark-green-400 text-sm"
            placeholder="Tell us about yourself, your gaming interests, or anything else you'd like to share..."
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-dark-green-600 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:ring-2 focus:ring-vibrant-orange focus:border-transparent transition-all duration-200 disabled:bg-light-beige-50 disabled:text-dark-green-400 text-sm"
            placeholder="City, Country (for shipping and local pickup)"
          />
          <p className="text-xs text-dark-green-400 mt-1">This helps buyers understand shipping options and local pickup availability</p>
        </div>

        {/* Language Preference */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-dark-green-600 mb-1">
            <Globe className="w-4 h-4 inline mr-1" />
            Language Preference
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-dark-green-200 rounded-lg focus:ring-2 focus:ring-vibrant-orange focus:border-transparent transition-all duration-200 disabled:bg-light-beige-50 disabled:text-dark-green-400 text-sm"
          >
            <option value="en">English</option>
            <option value="et">Eesti</option>
            <option value="lv">Latviešu</option>
            <option value="lt">Lietuvių</option>
            <option value="fi">Suomi</option>
            <option value="sv">Svenska</option>
            <option value="da">Dansk</option>
          </select>
        </div>

        {/* Account Information (Read-only) */}
        <div className="border-t border-light-beige-200 pt-4">
          <h3 className="text-base font-semibold text-dark-green-600 mb-3">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-green-500 mb-1">Email</label>
              <p className="text-sm text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg border border-light-beige-200">
                {profile.email}
              </p>
              <p className="text-xs text-dark-green-400 mt-1">Email is managed by your authentication provider</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-green-500 mb-1">Member Since</label>
              <p className="text-sm text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg border border-light-beige-200">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Form Actions */}
        {isEditing && (
          <div className="flex items-center gap-3 pt-4 border-t border-light-beige-200">
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
        )}
      </form>
    </div>
  );
}
