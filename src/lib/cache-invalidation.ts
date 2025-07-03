import { cache } from '@/lib/redis';

export interface InvalidationOptions {
  userId?: string;
  speciesId?: string;
  regionId?: string;
  location?: { lat: number; lng: number };
}

/**
 * Invalidate observation-related cache entries when new data is detected
 */
export async function invalidateObservationCaches(
  options: InvalidationOptions = {}
) {
  const keysToInvalidate: string[] = [];

  // Always invalidate the latest check
  keysToInvalidate.push('observations:latest-check');

  // Invalidate user-specific caches
  if (options.userId) {
    keysToInvalidate.push(`observations:user:${options.userId}`);
    keysToInvalidate.push(`search:*observer_id*${options.userId}*`);
  }

  // Invalidate species-specific caches
  if (options.speciesId) {
    keysToInvalidate.push(`observations:species:${options.speciesId}`);
    keysToInvalidate.push(`search:*species_id*${options.speciesId}*`);
  }

  // Invalidate region-specific caches
  if (options.regionId) {
    keysToInvalidate.push(`observations:region:${options.regionId}`);
  }

  // Invalidate recent observation searches (most likely to contain new data)
  keysToInvalidate.push('search:*');

  // Execute invalidations
  for (const keyPattern of keysToInvalidate) {
    try {
      if (keyPattern.includes('*')) {
        // Use pattern matching for wildcard keys
        await cache.flush(keyPattern.replace(/\*/g, ''));
      } else {
        await cache.del(keyPattern, { prefix: 'api' });
        await cache.del(keyPattern, { prefix: 'obs' });
        await cache.del(keyPattern, { prefix: 'check' });
      }
    } catch (error) {
      console.warn(`Failed to invalidate cache key ${keyPattern}:`, error);
    }
  }

  console.log(`🗑️ Invalidated ${keysToInvalidate.length} cache patterns`);
}

/**
 * Smart invalidation based on observation age
 * Recent observations (< 1 hour) trigger more aggressive cache clearing
 */
export async function smartInvalidateOnNewObservation(observation: {
  id: string;
  date: string;
  user_id?: string;
  species_id?: string;
  location?: { lat: number; lng: number };
}) {
  const observationAge = Date.now() - new Date(observation.date).getTime();
  const isVeryRecent = observationAge < 60 * 60 * 1000; // Less than 1 hour

  if (isVeryRecent) {
    // Aggressive invalidation for very recent observations
    await invalidateObservationCaches({
      userId: observation.user_id,
      speciesId: observation.species_id,
    });

    // Also clear recent search caches completely
    await cache.flush('search');
  } else {
    // Gentle invalidation for older observations
    await cache.del('observations:latest-check', { prefix: 'check' });
  }
}

/**
 * Scheduled cache refresh - can be called periodically to keep data fresh
 */
export async function scheduledCacheRefresh() {
  console.log('🔄 Starting scheduled cache refresh...');

  try {
    // Invalidate caches that should be refreshed regularly
    const patterns = [
      'observations:latest-check',
      'search:*', // Clear all search caches
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        await cache.flush(pattern.replace(/\*/g, ''));
      } else {
        await cache.del(pattern, { prefix: 'check' });
        await cache.del(pattern, { prefix: 'obs' });
      }
    }

    console.log('✅ Scheduled cache refresh completed');
  } catch (error) {
    console.error('❌ Scheduled cache refresh failed:', error);
  }
}

/**
 * Check if cache warming is needed after invalidation
 */
export async function recheckCacheWarming() {
  // Warm the latest check cache immediately
  try {
    const { warmCache } = await import('@/lib/cache-warmer');
    await warmCache();
  } catch (error) {
    console.warn('Failed to warm cache after invalidation:', error);
  }
}
