'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BrowseListing {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  imageUrl?: string;
  seller: {
    name: string;
    rating: number;
  };
  location: string;
  category: string;
  gameDetails?: Record<string, unknown>;
  shipping?: Record<string, unknown>;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrowseFilters {
  search: string;
  category: string;
  condition: string;
  priceMin: string;
  priceMax: string;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'rating';
}

export interface BrowsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useBrowseListings() {
  const [listings, setListings] = useState<BrowseListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<BrowsePagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<BrowseFilters>({
    search: '',
    category: '',
    condition: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest'
  });

  const fetchListings = useCallback(async (page: number = 1, newFilters?: Partial<BrowseFilters>) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = { ...filters, ...newFilters };
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: currentFilters.sortBy,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.category && { category: currentFilters.category }),
        ...(currentFilters.condition && { condition: currentFilters.condition }),
        ...(currentFilters.priceMin && { priceMin: currentFilters.priceMin }),
        ...(currentFilters.priceMax && { priceMax: currentFilters.priceMax }),
      });

      const response = await fetch(`/api/listings/browse?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch listings');
      }

      setListings(result.listings);
      setPagination(result.pagination);
      
      if (newFilters) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const updateFilters = useCallback((newFilters: Partial<BrowseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchListings(1, newFilters);
  }, [fetchListings]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchListings(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, loading, fetchListings]);

  const refresh = useCallback(() => {
    fetchListings(1);
  }, [fetchListings]);

  // Load initial data
  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    loadMore,
    refresh,
    hasMore: pagination.page < pagination.totalPages
  };
}
