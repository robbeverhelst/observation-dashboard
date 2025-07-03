import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';
import { withCache } from '@/lib/redis';
import { withCacheHeaders } from '@/middleware/cache-headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldClear = searchParams.get('clear');

    // Clear cache if requested
    if (shouldClear) {
      const { cache } = await import('@/lib/redis');
      await cache.del('observations:latest-check', { prefix: 'check' });
      console.log('🗑️  Cleared latest-check cache');
    }

    // This endpoint only gets the latest observation info
    // Much lighter than fetching all data
    const latestCheck = await withCache(
      'observations:latest-check',
      async () => {
        const observationsClient = await client.observations();

        // Get just the most recent observation using getByUser (authenticated user's observations)
        const response = await observationsClient.getByUser(undefined, {
          limit: 1,
          offset: 0,
        });

        const results = 'results' in response ? response.results : [];
        const latest = results[0];

        return {
          latestId: latest?.id || null,
          latestDate: latest?.date || null,
          timestamp: new Date().toISOString(),
          // Use results length as count
          totalCount: results.length,
        };
      },
      { ttl: 30, prefix: 'check' } // Very short TTL - 30 seconds
    );

    return withCacheHeaders(
      NextResponse.json(latestCheck),
      { maxAge: 0, sMaxAge: 30 } // Don't cache in browser, short CDN cache
    );
  } catch (error) {
    console.error('Error checking for new observations:', error);
    return NextResponse.json(
      { error: 'Failed to check for new observations' },
      { status: 500 }
    );
  }
}
