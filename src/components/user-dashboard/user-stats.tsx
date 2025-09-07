'use client';

import { BarChart3, TrendingUp, Eye, Heart, Package, DollarSign, Calendar, Award } from 'lucide-react';

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

interface UserStatsProps {
  profile: Profile;
  listings: Listing[];
}

export function UserStats({ profile, listings }: UserStatsProps) {
  const activeListings = listings.filter(listing => listing.is_active);
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalFavorites = listings.reduce((sum, listing) => sum + listing.favorites, 0);
  const totalValue = listings.reduce((sum, listing) => sum + listing.price, 0);
  const averagePrice = listings.length > 0 ? totalValue / listings.length : 0;
  
  // Calculate monthly stats
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const thisMonthListings = listings.filter(listing => 
    new Date(listing.created_at) >= thisMonth
  );
  const lastMonthListings = listings.filter(listing => {
    const created = new Date(listing.created_at);
    return created >= lastMonth && created < thisMonth;
  });

  const stats = [
    {
      title: 'Total Listings',
      value: listings.length,
      change: thisMonthListings.length - lastMonthListings.length,
      icon: Package,
      color: 'vibrant-orange',
      description: 'All time listings created'
    },
    {
      title: 'Active Listings',
      value: activeListings.length,
      change: 0,
      icon: BarChart3,
      color: 'warm-yellow',
      description: 'Currently available for sale'
    },
    {
      title: 'Total Views',
      value: totalViews,
      change: 0,
      icon: Eye,
      color: 'dark-green',
      description: 'Times your listings were viewed'
    },
    {
      title: 'Favorites',
      value: totalFavorites,
      change: 0,
      icon: Heart,
      color: 'vibrant-orange',
      description: 'Times your listings were favorited'
    },
    {
      title: 'Total Value',
      value: `€${totalValue.toFixed(2)}`,
      change: 0,
      icon: DollarSign,
      color: 'warm-yellow',
      description: 'Total value of all your listings'
    },
    {
      title: 'Average Price',
      value: `€${averagePrice.toFixed(2)}`,
      change: 0,
      icon: TrendingUp,
      color: 'dark-green',
      description: 'Average price per listing'
    }
  ];

  const recentActivity = [
    {
      title: 'Member Since',
      value: new Date(profile.created_at).toLocaleDateString(),
      icon: Calendar,
      color: 'dark-green'
    },
    {
      title: 'Last Active',
      value: new Date(profile.last_active).toLocaleDateString(),
      icon: Award,
      color: 'vibrant-orange'
    },
    {
      title: 'Trust Score',
      value: profile.trust_score,
      icon: Award,
      color: 'warm-yellow'
    }
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-display font-bold text-dark-green-600 mb-1">Your Statistics</h2>
        <p className="text-sm text-dark-green-500">Track your performance and activity on the platform</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const isNegative = stat.change < 0;
          
          return (
            <div key={index} className="bg-white rounded-lg p-4 shadow-soft border border-light-beige-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${stat.color}-600`} />
                </div>
                {stat.change !== 0 && (
                  <div className={`text-xs font-medium ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-dark-green-500'
                  }`}>
                    {isPositive ? '+' : ''}{stat.change} this month
                  </div>
                )}
              </div>
              <div className="text-lg font-bold text-dark-green-600 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-dark-green-600 mb-1">{stat.title}</div>
              <div className="text-xs text-dark-green-400">{stat.description}</div>
            </div>
          );
        })}
      </div>

      {/* Account Information */}
      <div className="bg-light-beige-50 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-dark-green-600 mb-3">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${activity.color}-600`} />
                </div>
                <div>
                  <div className="text-xs font-medium text-dark-green-500">{activity.title}</div>
                  <div className="text-sm font-semibold text-dark-green-600">{activity.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Listings */}
      {listings.length > 0 && (
        <div className="bg-white rounded-lg shadow-soft border border-light-beige-200">
          <div className="p-4 border-b border-light-beige-200">
            <h3 className="text-base font-semibold text-dark-green-600">Top Performing Listings</h3>
            <p className="text-xs text-dark-green-500">Your most viewed and favorited games</p>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {listings
                .sort((a, b) => (b.views + b.favorites) - (a.views + a.favorites))
                .slice(0, 5)
                .map((listing, index) => (
                  <div key={listing.id} className="flex items-center gap-3 p-2 bg-light-beige-50 rounded-lg">
                    <div className="w-6 h-6 bg-vibrant-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-vibrant-orange-600">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 bg-light-beige-200 rounded flex items-center justify-center">
                      {listing.game_image_url ? (
                        <img src={listing.game_image_url} alt={listing.title} className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-dark-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-dark-green-600">{listing.title}</h4>
                      <p className="text-xs text-dark-green-500">
                        €{listing.price} • {listing.game_condition?.boxCondition || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-dark-green-600">{listing.views} views</div>
                      <div className="text-xs text-dark-green-500">{listing.favorites} favorites</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {listings.length === 0 && (
        <div className="text-center py-6">
          <BarChart3 className="w-12 h-12 text-dark-green-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-dark-green-600 mb-2">No Data Yet</h3>
          <p className="text-sm text-dark-green-500 mb-4">Start by creating your first game listing to see statistics here.</p>
          <button className="px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-vibrant-orange-600 transition-colors duration-200 text-sm">
            Create Your First Listing
          </button>
        </div>
      )}
    </div>
  );
}
