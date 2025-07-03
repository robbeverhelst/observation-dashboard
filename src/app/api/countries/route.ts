import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';
import { withCache } from '@/lib/redis';
import { withCacheHeaders } from '@/middleware/cache-headers';

export async function GET() {
  try {
    const countriesData = await withCache(
      'countries:all',
      async () => {
        const countries = await client.countries();
        const response = await countries.list();
        // Handle response format - could be paginated or direct array
        return 'results' in response ? response.results : response;
      },
      { ttl: 86400, prefix: 'api' } // Cache for 24 hours
    );

    return withCacheHeaders(
      NextResponse.json({ results: countriesData }),
      { maxAge: 3600, sMaxAge: 86400 } // 1 hour browser, 24 hour CDN
    );
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
