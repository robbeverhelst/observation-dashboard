// Types for observation-js API integration
import type { Observation, Paginated, SpeciesData } from 'observation-js';

// Extend observation-js types for our UI needs
export interface ObservationPoint
  extends Omit<Observation, 'photos' | 'sounds' | 'validation_status'> {
  // Add any additional fields we need for UI
  displayLocation?: string;
  rarity?: 'common' | 'moderate' | 'rare' | 'very_rare';
  cluster_id?: string;
  // Ensure these detail fields are accessible
  species_detail?: SpeciesData;
  user_detail?: { id: number; name: string; avatar?: string | null };
  species_group?: number;
  location_detail?: {
    id: number;
    name: string;
    country_code?: string;
    permalink?: string;
  };
  // Override media arrays to be string URLs
  photos?: string[];
  sounds?: string[];
  permalink?: string;
  validation_status?: string;
  modified?: string;
  number?: number;
  notes?: string;
}

// Create our own search params since observation-js doesn't export theirs
export interface ObservationSearchParams {
  limit?: number;
  offset?: number;
  species_id?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  observer_id?: string;
  // Geographic filtering extensions
  latitude?: number;
  longitude?: number;
  radius?: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  // UI-specific filters
  search_query?: string;
}

export interface ObservationFilters {
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  speciesGroups?: string[];
  location?: string;
  observer?: string;
  quality?: string[];
  verifiedOnly?: boolean;
}

// Use observation-js Paginated and extend it
export interface PaginatedObservationResponse
  extends Paginated<ObservationPoint> {
  hasMore: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom?: number;
  center?: {
    lat: number;
    lng: number;
  };
}

export interface ObservationCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  observations: ObservationPoint[];
  species_groups: string[];
}

// Species group color mapping for map pins
export const SPECIES_GROUP_COLORS: Record<string, string> = {
  Birds: '#3B82F6', // Blue
  Plants: '#10B981', // Green
  Mammals: '#F59E0B', // Amber
  Insects: '#8B5CF6', // Purple
  Fish: '#06B6D4', // Cyan
  Reptiles: '#EF4444', // Red
  Amphibians: '#84CC16', // Lime
  default: '#6B7280', // Gray
};

// Quality indicator colors
export const QUALITY_COLORS: Record<string, string> = {
  high: '#10B981', // Green
  medium: '#F59E0B', // Amber
  low: '#EF4444', // Red
  unknown: '#6B7280', // Gray
};

// Extended SpeciesData with observation count for UI
export interface SpeciesDataWithCount {
  // Base SpeciesData fields
  id: number;
  name: string;
  name_scientific?: string;
  name_english?: string;
  name_dutch?: string;
  name_french?: string;
  name_german?: string;
  group?: number;
  group_name?: string;
  // Additional fields for UI
  observation_count?: number;
  // Species photo URL (singular, not plural like in docs)
  photo?: string;
}
