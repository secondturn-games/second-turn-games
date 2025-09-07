'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  avatar_url: string;
  bio?: string;
  country?: string;
  local_area?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    country: profile.country || '',
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
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      setMessage('Profile updated successfully!');
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

  return (
    <div className="space-y-8">
      {/* Profile Info Display */}
      <div className="border-b border-light-beige-200 pb-6">
        <h3 className="text-lg font-semibold text-dark-green-600 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-green-500 mb-1">Email</label>
            <p className="text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg">
              {profile.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-green-500 mb-1">Member Since</label>
            <p className="text-dark-green-600 bg-light-beige-50 px-3 py-2 rounded-lg">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-dark-green-600 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-dark-green-600 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-dark-green-600 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-dark-green-600 mb-2">
            Display Name
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="How you'd like to be called"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-dark-green-600 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="+37126779625"
            pattern="^\+[1-9]\d{1,14}$"
            title="Please enter a valid phone number in E.164 format (e.g., +37126779625)"
          />
          <p className="text-xs text-dark-green-500 mt-1">
            Required for shipping. Use E.164 format: +37126779625
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-dark-green-600 mb-2">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Country</option>
              <option value="EE">Estonia</option>
              <option value="LV">Latvia</option>
              <option value="LT">Lithuania</option>
            </select>
          </div>

          <div>
            <label htmlFor="local_area" className="block text-sm font-medium text-dark-green-600 mb-2">
              Local Area
            </label>
            <input
              type="text"
              id="local_area"
              name="local_area"
              value={formData.local_area}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="City, District"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-dark-green-600 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-dark-green-200 rounded-xl focus:ring-2 focus:ring-vibrant-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Tell us about yourself..."
          />
        </div>


        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-xl ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-600 border border-red-200' 
              : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-vibrant-orange-500 text-white rounded-xl hover:bg-vibrant-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium"
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
