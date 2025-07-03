import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';
import { withCache } from '@/lib/redis';
import { withCacheHeaders } from '@/middleware/cache-headers';

export async function GET(request: Request) {
  try {
    // During build time, return empty results
    if (process.env.NODE_ENV === 'production' && !process.env.OAUTH_CLIENT_ID) {
      return NextResponse.json({ results: [] });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'groups';

    if (type === 'groups') {
      // Get species groups/categories with caching
      const groupsData = await withCache(
        'species-groups:groups',
        async () => {
          const species = await client.species();
          const response = await species.listGroups();
          return 'results' in response ? response.results : response;
        },
        { ttl: 43200, prefix: 'api' } // Cache for 12 hours
      );
      return withCacheHeaders(
        NextResponse.json({ results: groupsData }),
        { maxAge: 600, sMaxAge: 3600 } // 10 min browser, 1 hour CDN
      );
    } else {
      // Get regional species lists with caching
      const listsData = await withCache(
        'species-groups:lists',
        async () => {
          const regionSpeciesLists = await client.regionSpeciesLists();
          const response = await regionSpeciesLists.list();
          return Array.isArray(response) ? response : [];
        },
        { ttl: 43200, prefix: 'api' } // Cache for 12 hours
      );
      return withCacheHeaders(
        NextResponse.json({ results: listsData }),
        { maxAge: 600, sMaxAge: 3600 } // 10 min browser, 1 hour CDN
      );
    }
  } catch (error) {
    console.error('Error fetching species data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch species data', results: [] },
      { status: 500 }
    );
  }
}
