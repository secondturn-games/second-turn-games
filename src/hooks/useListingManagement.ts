'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ListingManagementOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function useListingManagement(options: ListingManagementOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateListing = useCallback(async (listingId: string, data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/update?id=${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update listing');
      }

      options.onSuccess?.('Listing updated successfully');
      return result.listing;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update listing';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const deleteListing = useCallback(async (listingId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/delete?id=${listingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete listing');
      }

      options.onSuccess?.('Listing deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete listing';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const toggleListingStatus = useCallback(async (listingId: string, isActive: boolean) => {
    return updateListing(listingId, { is_active: isActive });
  }, [updateListing]);

  const duplicateListing = useCallback(async () => {
    // This would fetch the listing data and redirect to create page with pre-filled data
    // For now, just redirect to create page
    router.push('/list-game-version');
  }, [router]);

  return {
    updateListing,
    deleteListing,
    toggleListingStatus,
    duplicateListing,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
