'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showText?: boolean;
}

export function RefreshButton({
  onRefresh,
  isLoading = false,
  variant = 'outline',
  size = 'sm',
  className = '',
  showText = true,
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Keep the spinning animation for a brief moment for better UX
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const isSpinning = isLoading || isRefreshing;

  return (
    <Button
      onClick={handleRefresh}
      variant={variant}
      size={size}
      disabled={isSpinning}
      className={className}
    >
      <RefreshCw
        className={`w-4 h-4 ${showText ? 'mr-2' : ''} ${isSpinning ? 'animate-spin' : ''}`}
      />
      {showText && 'Refresh'}
    </Button>
  );
}
