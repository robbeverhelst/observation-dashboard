import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';
import { withCache } from '@/lib/redis';
import { withCacheHeaders } from '@/middleware/cache-headers';

export async function GET() {
  try {
    // During build time, return empty results
    if (process.env.NODE_ENV === 'production' && !process.env.OAUTH_CLIENT_ID) {
      return NextResponse.json({ results: [] });
    }

    const challengesData = await withCache(
      'challenges:all',
      async () => {
        const challenges = await client.challenges();
        const response = await challenges.list();
        // Handle response format - could be paginated or direct array
        return 'results' in response ? response.results : response;
      },
      { ttl: 3600, prefix: 'api' } // Cache for 1 hour (challenges may have deadlines)
    );

    return withCacheHeaders(
      NextResponse.json({ results: challengesData }),
      { maxAge: 600, sMaxAge: 3600 } // 10 min browser, 1 hour CDN
    );
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges', results: [] },
      { status: 500 }
    );
  }
}
