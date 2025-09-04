'use client';

import { useEffect, useRef, useCallback } from 'react';
import { updateLastActiveClient } from '@/lib/supabase/update-last-active-client';

interface ActivityTrackerOptions {
  debounceMs?: number;
  maxUpdateIntervalMs?: number;
  enabled?: boolean;
}

export function useActivityTracker(options: ActivityTrackerOptions = {}) {
  const {
    debounceMs = 2000, // 2 seconds debounce
    maxUpdateIntervalMs = 5 * 60 * 1000, // 5 minutes max interval
    enabled = true
  } = options;

  const lastUpdateRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef<boolean>(false);

  const updateActivity = useCallback(async (clerkId: string) => {
    if (!enabled || !clerkId) return;

    const now = Date.now();
    
    // Check if enough time has passed since last update
    if (now - lastUpdateRef.current < maxUpdateIntervalMs) {
      return;
    }

    try {
      // Update local storage immediately for UI responsiveness
      localStorage.setItem('user_last_active', now.toString());
      
      // Update Supabase
      await updateLastActiveClient(clerkId);
      lastUpdateRef.current = now;
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }, [enabled, maxUpdateIntervalMs]);

  const debouncedUpdate = useCallback((clerkId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateActivity(clerkId);
    }, debounceMs);
  }, [updateActivity, debounceMs]);

  const trackActivity = useCallback((clerkId: string) => {
    if (!enabled || !clerkId || isTrackingRef.current) return;

    isTrackingRef.current = true;

    // Track mouse movement
    const handleMouseMove = () => debouncedUpdate(clerkId);
    
    // Track clicks
    const handleClick = () => debouncedUpdate(clerkId);
    
    // Track keyboard activity
    const handleKeyPress = () => debouncedUpdate(clerkId);
    
    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        debouncedUpdate(clerkId);
      }
    };

    // Track scroll activity
    const handleScroll = () => debouncedUpdate(clerkId);

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('keypress', handleKeyPress, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      isTrackingRef.current = false;
    };
  }, [debouncedUpdate, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { trackActivity };
}

// Helper function to get last active from localStorage
export function getLastActiveFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('user_last_active');
  return stored ? parseInt(stored, 10) : null;
}

// Helper function to check if user is online based on localStorage
export function isUserOnlineFromStorage(): boolean {
  const lastActive = getLastActiveFromStorage();
  if (!lastActive) return false;
  
  const now = Date.now();
  const diffInMinutes = (now - lastActive) / (1000 * 60);
  return diffInMinutes < 5; // Online if active within last 5 minutes
}
