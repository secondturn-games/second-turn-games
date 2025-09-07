'use client';

import { useState } from 'react';
import { Package, Eye, Heart, Edit3, Trash2, EyeOff, Eye as EyeIcon, Calendar, Copy, MoreVertical } from 'lucide-react';
import { useListingManagement } from '@/hooks/useListingManagement';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Listing {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  price_notes?: string;
  bgg_game_id?: string;
  bgg_version_id?: string;
  game_name: string;
  game_image_url?: string;
  version_name?: string;
  version_image_url?: string;
  custom_title?: string;
  suggested_alternate_name?: string;
  game_details?: {
    minPlayers?: string;
    maxPlayers?: string;
    playingTime?: string;
    minAge?: string;
    yearPublished?: string;
    languages?: string[];
    publishers?: string[];
    designers?: string[];
    rank?: string;
    rating?: string;
  };
  game_condition?: {
    activeFilter?: string;
    boxCondition?: string;
    boxDescription?: string;
    completeness?: string;
    missingDescription?: string;
    componentCondition?: string;
    componentConditionDescription?: string;
    extras?: string[];
    extrasDescription?: string;
    photos?: string[];
    photoNotes?: string;
  };
  shipping?: {
    pickup?: {
      enabled: boolean;
      country?: string;
      localArea?: string;
      meetingDetails?: string;
    };
    parcelLocker?: {
      enabled: boolean;
      priceType?: string;
      price?: string;
      countries?: string[];
      countryPrices?: Record<string, string>;
    };
    notes?: string;
  };
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
  const [localListings, setLocalListings] = useState(listings);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const {
    deleteListing,
    toggleListingStatus,
    duplicateListing,
    isLoading,
    error,
    clearError
  } = useListingManagement({
    onSuccess: (message) => {
      console.log('Success:', message);
      // Refresh listings by updating local state
      setLocalListings(prev => prev.filter(listing => listing.id !== deletingId));
      setDeletingId(null);
    },
    onError: (error) => {
      console.error('Error:', error);
      setDeletingId(null);
    }
  });

  const filteredListings = localListings.filter(listing => {
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
    try {
      await toggleListingStatus(listingId, !currentStatus);
      // Update local state
      setLocalListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, is_active: !currentStatus }
            : listing
        )
      );
    } catch (error) {
      console.error('Failed to toggle listing status:', error);
      // Show error to user
      alert(`Failed to update listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (listingId: string) => {
    // Navigate to edit page with listing ID
    window.location.href = `/list-game-version?edit=${listingId}`;
  };

  const handleDelete = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      setDeletingId(listingId);
      try {
        await deleteListing(listingId);
      } catch (error) {
        console.error('Failed to delete listing:', error);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateListing();
    } catch (error) {
      console.error('Failed to duplicate listing:', error);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-display font-bold text-dark-green-600 mb-1">My Listings</h2>
        <p className="text-sm text-dark-green-500">Manage your game listings and track their performance</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center">
              <span className="text-xs">!</span>
            </div>
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <span className="text-xs">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-soft p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Listings', count: localListings.length },
              { id: 'active', label: 'Active', count: localListings.filter(l => l.is_active).length },
              { id: 'inactive', label: 'Inactive', count: localListings.filter(l => !l.is_active).length }
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
                {listing.game_image_url ? (
                  <img 
                    src={listing.game_image_url} 
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
                    disabled={isLoading}
                    className={`p-2 rounded-full ${
                      listing.is_active 
                        ? 'bg-white/90 text-dark-green-600 hover:bg-white' 
                        : 'bg-white/90 text-gray-600 hover:bg-white'
                    } transition-colors duration-200 disabled:opacity-50`}
                    title={listing.is_active ? 'Hide listing' : 'Show listing'}
                  >
                    {listing.is_active ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white transition-colors duration-200"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(listing.id)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Listing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-600 focus:text-red-600"
                        disabled={deletingId === listing.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-dark-green-600 mb-2 line-clamp-2">{listing.title}</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-vibrant-orange-600">
                    €{listing.price}
                    {listing.negotiable && (
                      <span className="text-xs text-gray-500 ml-1">(Negotiable)</span>
                    )}
                  </div>
                  <div className="text-xs text-dark-green-500">
                    {listing.game_condition?.boxCondition || 'Unknown'}
                  </div>
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

                {/* Game Details */}
                <div className="text-xs text-dark-green-500 mb-3">
                  {listing.game_details && (
                    <div className="space-y-1">
                      {listing.game_details.minPlayers && listing.game_details.maxPlayers && (
                        <div>{listing.game_details.minPlayers}-{listing.game_details.maxPlayers} players</div>
                      )}
                      {listing.game_details.playingTime && (
                        <div>{listing.game_details.playingTime} min</div>
                      )}
                      {listing.version_name && (
                        <div className="text-vibrant-orange-600 font-medium">{listing.version_name}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Loading indicator for this listing */}
                {deletingId === listing.id && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-vibrant-orange"></div>
                    Deleting...
                  </div>
                )}
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
            <a 
              href="/list-game-version"
              className="inline-block px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange-600 transition-colors duration-200 text-sm"
            >
              Create Your First Listing
            </a>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {localListings.length > 0 && (
        <div className="mt-4 bg-light-beige-50 rounded-lg p-4">
          <h3 className="text-base font-semibold text-dark-green-600 mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">{localListings.length}</div>
              <div className="text-xs text-dark-green-500">Total Listings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">
                {localListings.filter(l => l.is_active).length}
              </div>
              <div className="text-xs text-dark-green-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">
                {localListings.reduce((sum, l) => sum + l.views, 0)}
              </div>
              <div className="text-xs text-dark-green-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-green-600">
                €{localListings.reduce((sum, l) => sum + l.price, 0).toFixed(2)}
              </div>
              <div className="text-xs text-dark-green-500">Total Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
