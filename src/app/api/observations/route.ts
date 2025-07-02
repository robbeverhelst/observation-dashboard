import { NextResponse } from 'next/server';
import {
  searchObservations,
  getObservationsAroundPoint,
  getObservationsInBounds,
  getObservation,
  getObservationsForSpecies,
  getObservationsForUser,
} from '@/lib/observation-api';
import { withCache } from '@/lib/redis';
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
        const observation = await withCache(
          `observation:${id}`,
          () => getObservation(parseInt(id)),
          { ttl: 600, prefix: 'api' } // Cache for 10 minutes
        );
        if (!observation) {
          return NextResponse.json(
            { error: 'Observation not found' },
            { status: 404 }
          );
        }
        return NextResponse.json(observation);

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
        return NextResponse.json(speciesObs);

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
        return NextResponse.json(userObs);

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
        return NextResponse.json({ results: pointObs });

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
          return NextResponse.json({ results: boundsObs });
        } catch {
          return NextResponse.json(
            { error: 'Invalid bounds format' },
            { status: 400 }
          );
        }

      case 'search':
      default:
        console.log('🔍 Calling searchObservations with params:', params);

        // Create cache key based on search parameters
        const searchKey = `search:${JSON.stringify(params)}`;

        const searchResult = await withCache(
          searchKey,
          () => searchObservations(params),
          { ttl: 300, prefix: 'obs' } // Cache for 5 minutes
        );

        console.log('🔍 searchObservations result:', searchResult);
        return NextResponse.json(searchResult);
    }
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 }
    );
  }
}
