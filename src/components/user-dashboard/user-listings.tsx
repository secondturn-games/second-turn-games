'use client';

import { useState } from 'react';
import { Package, Eye, Heart, Edit3, Trash2, EyeOff, Eye as EyeIcon, Calendar } from 'lucide-react';

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

interface UserListingsProps {
  listings: Listing[];
}

export function UserListings({ listings }: UserListingsProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-high' | 'price-low' | 'views'>('newest');

  const filteredListings = listings.filter(listing => {
    if (filter === 'active') return listing.is_active;
    if (filter === 'inactive') return !listing.is_active;
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const handleToggleActive = async (listingId: string, currentStatus: boolean) => {
    // TODO: Implement API call to toggle listing status
    console.log(`Toggle listing ${listingId} to ${!currentStatus}`);
  };

  const handleEdit = (listingId: string) => {
    // TODO: Navigate to edit listing page
    console.log(`Edit listing ${listingId}`);
  };

  const handleDelete = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      // TODO: Implement API call to delete listing
      console.log(`Delete listing ${listingId}`);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-display font-bold text-dark-green-600 mb-1">My Listings</h2>
        <p className="text-sm text-dark-green-500">Manage your game listings and track their performance</p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-soft p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Listings', count: listings.length },
              { id: 'active', label: 'Active', count: listings.filter(l => l.is_active).length },
              { id: 'inactive', label: 'Inactive', count: listings.filter(l => !l.is_active).length }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as 'all' | 'active' | 'inactive')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  filter === filterOption.id
                    ? 'bg-vibrant-orange text-white'
                    : 'bg-light-beige-50 text-dark-green-600 hover:bg-light-beige-100'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-dark-green-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'price-high' | 'price-low' | 'views')}
              className="px-2 py-1.5 border border-dark-green-200 rounded-lg focus:ring-2 focus:ring-vibrant-orange focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {sortedListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-soft overflow-hidden border border-light-beige-200 hover:shadow-medium transition-shadow duration-200">
              {/* Image */}
              <div className="relative h-32 bg-light-beige-100">
                {listing.image_url ? (
                  <img 
                    src={listing.image_url} 
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-dark-green-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                  listing.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {listing.is_active ? 'Active' : 'Inactive'}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(listing.id, listing.is_active)}
                    className={`p-2 rounded-full ${
                      listing.is_active 
                        ? 'bg-white/90 text-dark-green-600 hover:bg-white' 
                        : 'bg-white/90 text-gray-600 hover:bg-white'
                    } transition-colors duration-200`}
                    title={listing.is_active ? 'Hide listing' : 'Show listing'}
                  >
                    {listing.is_active ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-dark-green-600 mb-2 line-clamp-2">{listing.title}</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-vibrant-orange-600">€{listing.price}</div>
                  <div className="text-xs text-dark-green-500">{listing.condition}</div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-dark-green-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {listing.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {listing.favorites}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <p className="text-xs text-dark-green-500 mb-3 line-clamp-2">{listing.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(listing.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-light-beige-50 text-dark-green-600 rounded-lg hover:bg-light-beige-100 transition-colors duration-200 text-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Package className="w-12 h-12 text-dark-green-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-dark-green-600 mb-2">
            {filter === 'all' ? 'No Listings Yet' : `No ${filter} Listings`}
          </h3>
          <p className="text-sm text-dark-green-500 mb-4">
            {filter === 'all' 
              ? 'Start by creating your first game listing to sell your board games.'
              : `You don't have any ${filter} listings at the moment.`
            }
          </p>
          {filter === 'all' && (
            <button className="px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange-600 transition-colors duration-200 text-sm">
              Create Your First Listing
            </button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {listings.length > 0 && (
        <div className="mt-4 bg-light-beige-50 rounded-lg p-4">
          <h3 className="text-base font-semibold text-dark-green-600 mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">{listings.length}</div>
              <div className="text-xs text-dark-green-500">Total Listings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">
                {listings.filter(l => l.is_active).length}
              </div>
              <div className="text-xs text-dark-green-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">
                {listings.reduce((sum, l) => sum + l.views, 0)}
              </div>
              <div className="text-xs text-dark-green-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">
                €{listings.reduce((sum, l) => sum + l.price, 0).toFixed(2)}
              </div>
              <div className="text-xs text-dark-green-500">Total Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
