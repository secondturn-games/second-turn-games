'use client';

import { GameCard } from '@/components/ui/game-card';
import { useBrowseListings } from '@/hooks/useBrowseListings';
import { useState } from 'react';

export default function GamesPage() {
  const {
    listings,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    loadMore,
    hasMore
  } = useBrowseListings();

  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    updateFilters({ [key]: value });
  };
  return (
    <div className="min-h-screen bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-dark-green-600 mb-4">
            Browse Games
          </h1>
          <p className="text-xl text-dark-green-500">
            Discover amazing games from local sellers in the Baltics
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search games, sellers, or categories..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-light-beige-200 bg-light-beige-50 text-dark-green-600 placeholder-dark-green-400 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 rounded-md border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
            >
              <option value="">All Categories</option>
              <option value="box">Box Condition</option>
              <option value="components">Components</option>
              <option value="extras">Extras</option>
            </select>

            {/* Condition Filter */}
            <select 
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="px-3 py-2 rounded-md border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>

            {/* Price Range */}
            <select 
              value={filters.priceMin}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '0-20') {
                  handleFilterChange('priceMin', '0');
                  handleFilterChange('priceMax', '20');
                } else if (value === '20-40') {
                  handleFilterChange('priceMin', '20');
                  handleFilterChange('priceMax', '40');
                } else if (value === '40-60') {
                  handleFilterChange('priceMin', '40');
                  handleFilterChange('priceMax', '60');
                } else if (value === '60+') {
                  handleFilterChange('priceMin', '60');
                  handleFilterChange('priceMax', '');
                } else {
                  handleFilterChange('priceMin', '');
                  handleFilterChange('priceMax', '');
                }
              }}
              className="px-3 py-2 rounded-md border border-light-beige-200 bg-light-beige-50 text-dark-green-600 focus:outline-none focus:ring-2 focus:ring-vibrant-orange-200 focus:border-vibrant-orange-300 transition-colors duration-200"
            >
              <option value="">All Prices</option>
              <option value="0-20">Under €20</option>
              <option value="20-40">€20 - €40</option>
              <option value="40-60">€40 - €60</option>
              <option value="60+">Over €60</option>
            </select>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center">
                <span className="text-xs">!</span>
              </div>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-dark-green-500">
            Showing <span className="font-semibold text-dark-green-600">{pagination.total}</span> games
            {loading && <span className="ml-2 text-sm">(Loading...)</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-green-500">Sort by:</span>
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as 'relevance' | 'price-low' | 'price-high' | 'newest' | 'rating')}
              className="text-sm border-none bg-transparent text-dark-green-600 focus:outline-none focus:ring-0"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && listings.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
            <p className="text-dark-green-500">Loading games...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-light-beige-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-light-beige-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-dark-green-600 mb-2">No games found</h3>
            <p className="text-dark-green-500 mb-4">
              {filters.search || filters.category || filters.condition || filters.priceMin
                ? 'Try adjusting your search or filters'
                : 'Be the first to list a game for sale!'
              }
            </p>
            {!filters.search && !filters.category && !filters.condition && !filters.priceMin && (
              <a 
                href="/list-game-version"
                className="inline-block px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                List Your First Game
              </a>
            )}
          </div>
        )}

        {/* Games Grid */}
        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {listings.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-12">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-white border border-vibrant-orange text-vibrant-orange rounded-lg hover:bg-vibrant-orange hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Games'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
