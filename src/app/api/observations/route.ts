import { NextResponse } from 'next/server';
import { withCacheHeaders } from '@/middleware/cache-headers';
import {
  searchObservations,
  getObservationsAroundPoint,
  getObservationsInBounds,
  getObservation,
  getObservationsForSpecies,
  getObservationsForUser,
} from '@/lib/observation-api';
import { withSWR } from '@/lib/cache-swr';
import type { ObservationSearchParams, MapBounds } from '@/types/observations';

export async function GET(request: Request) {
  console.log('🏠 Observations API route called');
  try {
    const { searchParams } = new URL(request.url);

    // Extract search parameters
    const params: ObservationSearchParams = {
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      species_id: searchParams.get('species_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      location: searchParams.get('location') || undefined,
      observer_id: searchParams.get('observer_id') || undefined,
      search_query: searchParams.get('search') || undefined,
    };

    // Handle different query types
    const queryType = searchParams.get('type') || 'search';
    const id = searchParams.get('id');

    switch (queryType) {
      case 'single':
        if (!id) {
          return NextResponse.json(
            { error: 'ID required for single observation' },
            { status: 400 }
          );
        }
        const observationResult = await withSWR(
          `observation:${id}`,
          () => getObservation(parseInt(id)),
          {
            ttl: 7200, // Fresh for 2 hours (historical data is immutable)
            staleWhileRevalidate: 86400, // Serve stale for 24 hours while revalidating
            prefix: 'api',
            tags: ['observation', 'single-observation', `observation-${id}`],
          }
        );
        const observation = observationResult.data;
        if (!observation) {
          return NextResponse.json(
            { error: 'Observation not found' },
            { status: 404 }
          );
        }
        return withCacheHeaders(
          NextResponse.json(observation),
          { maxAge: 300, sMaxAge: 1800 } // 5 min browser, 30 min CDN
        );

      case 'species':
        if (!params.species_id) {
          return NextResponse.json(
            { error: 'Species ID required' },
            { status: 400 }
          );
        }
        const speciesObs = await getObservationsForSpecies(
          parseInt(params.species_id),
          params
        );
        return withCacheHeaders(
          NextResponse.json(speciesObs),
          { maxAge: 60, sMaxAge: 300 } // 1 min browser, 5 min CDN
        );

      case 'user':
        if (!params.observer_id) {
          return NextResponse.json(
            { error: 'User ID required' },
            { status: 400 }
          );
        }
        const userObs = await getObservationsForUser(
          parseInt(params.observer_id),
          params
        );
        return withCacheHeaders(
          NextResponse.json(userObs),
          { maxAge: 60, sMaxAge: 300 } // 1 min browser, 5 min CDN
        );

      case 'around_point':
        const lat = parseFloat(searchParams.get('latitude') || '0');
        const lng = parseFloat(searchParams.get('longitude') || '0');
        const radius = parseFloat(searchParams.get('radius') || '10');

        if (!lat || !lng) {
          return NextResponse.json(
            { error: 'Latitude and longitude required' },
            { status: 400 }
          );
        }

        const pointObs = await getObservationsAroundPoint(
          lat,
          lng,
          radius,
          params.limit
        );
        return withCacheHeaders(
          NextResponse.json({ results: pointObs }),
          { maxAge: 60, sMaxAge: 300 } // 1 min browser, 5 min CDN
        );

      case 'bounds':
        const boundsParam = searchParams.get('bounds');
        if (!boundsParam) {
          return NextResponse.json(
            { error: 'Bounds required' },
            { status: 400 }
          );
        }

        try {
          const bounds: MapBounds = JSON.parse(boundsParam);
          const boundsObs = await getObservationsInBounds(bounds, params.limit);
          return withCacheHeaders(
            NextResponse.json({ results: boundsObs }),
            { maxAge: 60, sMaxAge: 300 } // 1 min browser, 5 min CDN
          );
        } catch {
          return NextResponse.json(
            { error: 'Invalid bounds format' },
            { status: 400 }
          );
        }

      case 'search':
      default:
        console.log('🔍 Calling searchObservations with params:', params);

        // Smart TTL based on query type
        const isRecentQuery =
          !params.start_date ||
          new Date(params.start_date) >
            new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Check for cache-bust refresh parameter
        const isRefresh = searchParams.get('refresh');

        // Shorter cache for recent data or user's own observations
        let cacheTTL = 900; // Default 15 minutes
        if (isRecentQuery) cacheTTL = 180; // 3 minutes for recent data
        if (params.observer_id) cacheTTL = 60; // 1 minute for user-specific queries

        // Create cache key based on search parameters
        const searchKey = `search:${JSON.stringify(params)}`;

        // Skip cache if refresh requested
        if (isRefresh) {
          console.log('🔄 Refresh requested - bypassing all cache');
          const freshResult = await searchObservations(params);
          console.log(
            '📊 Fresh result:',
            freshResult?.results?.length,
            'observations'
          );
          return withCacheHeaders(
            NextResponse.json(freshResult),
            { maxAge: 0, sMaxAge: 60 } // Don't cache refresh requests
          );
        }

        const searchResultSWR = await withSWR(
          searchKey,
          () => searchObservations(params),
          {
            ttl: cacheTTL, // Fresh period based on query type
            staleWhileRevalidate: cacheTTL * 2, // Serve stale for 2x the fresh period
            prefix: 'obs',
            tags: [
              'observations',
              'search-results',
              isRecentQuery ? 'recent-observations' : 'historical-observations',
              ...(params.species_id ? [`species-${params.species_id}`] : []),
              ...(params.observer_id ? [`user-${params.observer_id}`] : []),
            ],
          }
        );
        const searchResult = searchResultSWR.data;

        console.log('🔍 searchObservations result:', searchResult);
        return withCacheHeaders(
          NextResponse.json(searchResult),
          { maxAge: 60, sMaxAge: 300 } // 1 min browser, 5 min CDN
        );
    }
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 }
    );
  }
}
