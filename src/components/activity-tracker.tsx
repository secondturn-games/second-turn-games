'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useActivityTracker } from '@/hooks/use-activity-tracker';

export function ActivityTracker() {
  const { user } = useUser();
  const { trackActivity } = useActivityTracker({
    debounceMs: 2000, // 2 seconds debounce
    maxUpdateIntervalMs: 5 * 60 * 1000, // 5 minutes max interval
    enabled: !!user
  });

  useEffect(() => {
    if (!user?.id) return;

    const cleanup = trackActivity(user.id);
    return cleanup;
  }, [user?.id, trackActivity]);

  // This component doesn't render anything
  return null;
}
