import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';
import { withCache } from '@/lib/redis';
import { withCacheHeaders } from '@/middleware/cache-headers';

export async function GET() {
  try {
    const regionsData = await withCache(
      'regions:all',
      async () => {
        const regions = await client.regions();
        return await regions.list();
      },
      { ttl: 86400, prefix: 'api' } // Cache for 24 hours
    );

    // response is Region[], wrap in results format for consistency
    return withCacheHeaders(
      NextResponse.json({ results: regionsData }),
      { maxAge: 3600, sMaxAge: 86400 } // 1 hour browser, 24 hour CDN
    );
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}
