'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { recordNewDataDetection } from '@/lib/metrics';

interface NewDataNotificationProps {
  onRefresh: () => void;
  checkInterval?: number; // milliseconds
  enabled?: boolean;
}

interface LatestCheck {
  latestId: string | null;
  latestDate: string | null;
  timestamp: string;
  totalCount: number;
}

export function NewDataNotification({
  onRefresh,
  checkInterval = 60000, // 1 minute default
  enabled = true,
}: NewDataNotificationProps) {
  const [hasNewData, setHasNewData] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastKnownId, setLastKnownId] = useState<string | null>(null);

  const checkForNewData = useCallback(async () => {
    if (!enabled || isChecking) return;

    setIsChecking(true);

    try {
      const response = await fetch('/api/observations/check-new');
      if (!response.ok) throw new Error('Failed to check for new data');

      const data: LatestCheck = await response.json();

      // Get stored last known ID from localStorage
      const stored = localStorage.getItem('lastObservationCheck');
      let storedData: LatestCheck | null = null;

      if (stored) {
        try {
          storedData = JSON.parse(stored);
        } catch {
          // Ignore parse errors
        }
      }

      // Check if there's new data
      if (
        storedData &&
        data.latestId &&
        storedData.latestId !== data.latestId
      ) {
        setHasNewData(true);
        recordNewDataDetection('polling');
      }

      // Update stored data
      localStorage.setItem('lastObservationCheck', JSON.stringify(data));

      if (!lastKnownId && data.latestId) {
        setLastKnownId(data.latestId);
      }
    } catch (error) {
      console.error('Failed to check for new observations:', error);
    } finally {
      setIsChecking(false);
    }
  }, [enabled]); // Remove isChecking and lastKnownId to prevent infinite loop

  const handleRefresh = useCallback(() => {
    onRefresh();
    setHasNewData(false);

    // Update lastKnownId from current check
    const stored = localStorage.getItem('lastObservationCheck');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setLastKnownId(data.latestId);
      } catch {
        // Ignore parse errors
      }
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    // Check immediately on mount
    checkForNewData();

    // Set up interval for periodic checks
    const interval = setInterval(checkForNewData, checkInterval);

    // Also check when tab becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForNewData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, checkInterval, checkForNewData]);

  if (!hasNewData) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-800 dark:text-blue-200">
          New observations are available!
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isChecking}
          className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          <RefreshCw
            className={`h-3 w-3 mr-2 ${isChecking ? 'animate-spin' : ''}`}
          />
          Load new data
        </Button>
      </AlertDescription>
    </Alert>
  );
}
