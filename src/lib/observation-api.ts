import { getClient } from './observation-client';
import type {
  ObservationPoint,
  ObservationSearchParams,
  PaginatedObservationResponse,
  MapBounds,
} from '@/types/observations';
import type { Observation } from 'observation-js';

/**
 * Transform observation-js Observation to our ObservationPoint
 */
function transformObservation(obs: Observation): ObservationPoint {
  // Extract coordinates from Point geometry
  const latitude = obs.point?.coordinates?.[1] || 0;
  const longitude = obs.point?.coordinates?.[0] || 0;

  // Type assertion to access extended fields
  const extendedObs = obs as ObservationPoint;

  return {
    ...obs,
    displayLocation:
      extendedObs.location_detail?.name ||
      obs.location?.name ||
      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    rarity: calculateRarity(obs),
  };
}

/**
 * Calculate rarity based on observation data
 */
function calculateRarity(
  obs: Observation
): 'common' | 'moderate' | 'rare' | 'very_rare' {
  // This is a placeholder - in real implementation, this would be based on
  // species observation frequency, regional data, etc.
  // For now, use validation status and likes as a rough indicator
  if (obs.is_validated && obs.likes_count > 10) return 'common';
  if (obs.is_validated && obs.likes_count > 5) return 'moderate';
  if (obs.is_validated) return 'rare';
  return 'very_rare';
}

/**
 * Search observations with comprehensive filtering
 * Note: observation-js doesn't have a general search, so we'll need to implement
 * this differently. For now, return empty results with proper pagination structure.
 */
export async function searchObservations(
  params: ObservationSearchParams = {}
): Promise<PaginatedObservationResponse> {
  const client = await getClient();

  // Use getByUser() to get your own observations, or getAroundPoint() for location-based
  let observations;

  if (params.observer_id) {
    observations = await client.observations.getByUser(
      parseInt(params.observer_id),
      {
        limit: params.limit || 50,
        offset: params.offset || 0,
      }
    );
  } else {
    // First try to get your own observations since we know they exist
    try {
      console.log('Trying to get authenticated user observations first...');
      observations = await client.observations.getByUser(undefined, {
        limit: params.limit || 50,
        offset: params.offset || 0,
      });
      if (observations.results?.length > 0) {
        console.log(`Found ${observations.results.length} user observations`);
      } else {
        throw new Error('No user observations found, trying around point');
      }
    } catch (userError) {
      console.log(
        'User observations failed, trying around point:',
        (userError as Error).message
      );
      try {
        // Default: get observations around Netherlands center
        observations = await client.observations.getAroundPoint({
          lat: 52.3676, // Amsterdam coordinates
          lng: 4.9041,
          limit: params.limit || 50,
          offset: params.offset || 0,
        });
      } catch (error) {
        console.error('getAroundPoint failed, error details:', error);
        console.error('Error body:', (error as { body?: unknown }).body);

        throw error; // throw original error
      }
    }
  }

  const transformedObservations =
    observations.results?.map(transformObservation) || [];

  return {
    count: observations.count || 0,
    next: observations.next || null,
    previous: observations.previous || null,
    results: transformedObservations,
    hasMore: (observations.results?.length || 0) === (params.limit || 50),
  };
}

/**
 * Get species seen around a geographic point
 * Note: observation-js doesn't have getObservationsAroundPoint, but has getSpeciesSeenAroundPoint
 */
export async function getObservationsAroundPoint(
  latitude: number,
  longitude: number,
  radius: number = 10, // km
  limit: number = 500
): Promise<ObservationPoint[]> {
  try {
    console.log('Get observations around point called:', {
      latitude,
      longitude,
      radius,
      limit,
    });

    // Use basic search with location bounds for now
    const searchResult = await searchObservations({
      limit,
      search_query: '',
    });

    return searchResult.results || [];
  } catch (error) {
    console.error('Error fetching observations around point:', error);
    return [];
  }
}

/**
 * Get observations within map bounds
 */
export async function getObservationsInBounds(
  bounds: MapBounds,
  limit: number = 500
): Promise<ObservationPoint[]> {
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;

  // Calculate radius from bounds (approximate)
  const latDiff = bounds.north - bounds.south;
  const lngDiff = bounds.east - bounds.west;
  const radius = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 50; // Rough conversion to km

  return getObservationsAroundPoint(
    centerLat,
    centerLng,
    Math.min(radius, 50), // Cap radius at 50km for performance
    limit
  );
}

/**
 * Get a single observation by ID
 */
export async function getObservation(
  id: number
): Promise<ObservationPoint | null> {
  try {
    const client = await getClient();
    const observation = await client.observations.get(id);
    return transformObservation(observation);
  } catch (error) {
    console.error('Error fetching observation:', error);
    return null;
  }
}

/**
 * Get observations for a specific species
 */
export async function getObservationsForSpecies(
  speciesId: number,
  params: Partial<ObservationSearchParams> = {}
): Promise<PaginatedObservationResponse> {
  try {
    const client = await getClient();
    const response = await client.species.getObservations(speciesId, {
      limit: params.limit || 50,
      offset: params.offset || 0,
    });

    const results = Array.isArray(response)
      ? response
      : (response as { results?: Observation[] }).results || [];
    const total = Array.isArray(response)
      ? response.length
      : (response as { count?: number }).count || 0;

    return {
      count: total,
      next: null,
      previous: null,
      results: results.map(transformObservation),
      hasMore: (params.offset || 0) + results.length < total,
    };
  } catch (error) {
    console.error('Error fetching species observations:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
      hasMore: false,
    };
  }
}

/**
 * Get observations for a specific user
 * Note: observation-js doesn't have getByUser for observations
 * This would need to be implemented differently
 */
export async function getObservationsForUser(
  userId: number,
  params: Partial<ObservationSearchParams> = {}
): Promise<PaginatedObservationResponse> {
  try {
    // TODO: Implement when we have proper user observation methods
    console.log('Get observations for user called:', { userId, params });

    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
      hasMore: false,
    };
  } catch (error) {
    console.error('Error fetching user observations:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
      hasMore: false,
    };
  }
}
