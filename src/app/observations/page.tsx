'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapComponent } from '@/components/MapComponent';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  Map,
  Search,
  Calendar,
  Filter,
  MapPin,
  User,
  Table as TableIcon,
} from 'lucide-react';
import type { ObservationPoint } from '@/types/observations';

// Helper function to map species group IDs to names
function getGroupName(groupId?: number): string | null {
  const groupMap: Record<number, string> = {
    1: 'Birds',
    2: 'Mammals',
    3: 'Reptiles',
    4: 'Amphibians',
    5: 'Fish',
    6: 'Butterflies',
    7: 'Moths',
    8: 'Dragonflies',
    9: 'Other insects',
    10: 'Spiders',
    11: 'Mollusks',
    12: 'Other invertebrates',
    13: 'Plants',
    14: 'Fungi',
    15: 'Algae',
    16: 'Other',
  };
  return groupId ? groupMap[groupId] || null : null;
}

type ViewMode = 'map' | 'table';

export default function ObservationsPage() {
  console.log('🚀 ObservationsPage component mounted');
  const router = useRouter();

  const [observations, setObservations] = useState<ObservationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  // TODO: Implement filters in future enhancement
  // const [filters, setFilters] = useState<ObservationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  const fetchObservations = async (silent = false) => {
    console.log('🔄 fetchObservations called', { silent });
    try {
      if (!silent) setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        limit: '500',
      });

      // If we have map bounds and are in map view, use geographic filtering
      if (mapBounds && viewMode === 'map') {
        params.append('type', 'bounds');
        params.append(
          'bounds',
          JSON.stringify({
            north: mapBounds.north,
            south: mapBounds.south,
            east: mapBounds.east,
            west: mapBounds.west,
          })
        );
      } else {
        params.append('type', 'search');
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      console.log('📡 Making API request to:', `/api/observations?${params}`);
      const response = await fetch(`/api/observations?${params}`);

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch observations');
      }

      const data = await response.json();
      console.log('📊 API response data:', data);
      setObservations(data.results || []);
    } catch (err) {
      console.error('💥 Error fetching observations:', err);
      setError('Failed to load observations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === '') {
      fetchObservations(); // Show loading for clearing search
    } else {
      fetchObservations(true); // Silent background fetch for search
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate effect for map bounds to avoid refetching when switching views
  useEffect(() => {
    if (mapBounds && viewMode === 'map') {
      fetchObservations(true); // Silent background fetch for map movements
    }
  }, [mapBounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchObservations();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Only show loading for initial search, not for typing
    if (value.length === 0 || value.length > 2) {
      // fetchObservations will be called by useEffect with loading animation
    }
  };

  const handleBoundsChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number; lng: number };
    zoom: number;
  }) => {
    setMapBounds(bounds);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setSwitching(true);
    setViewMode(mode);
    // Remove switching state after a brief delay
    setTimeout(() => setSwitching(false), 100);
  };

  const handleViewDetails = (observation: ObservationPoint) => {
    router.push(`/observations/${observation.id}`);
  };

  // Don't show full-page loading, we'll show overlay instead

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Observations</h1>
          <p className="text-muted-foreground">
            Real-time biodiversity observations from around the world
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search observations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{observations.length} observations</Badge>
          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === 'map' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('map')}
              disabled={switching}
            >
              <Map className="w-4 h-4 mr-2" />
              Map
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('table')}
              disabled={switching}
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {(loading || switching) && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading observations...' : 'Switching view...'}
              </p>
            </div>
          </div>
        )}
        {viewMode === 'map' ? (
          <MapComponent
            observations={observations.map((obs) => ({
              id: obs.id?.toString() || '',
              latitude: obs.point?.coordinates?.[1] || 0,
              longitude: obs.point?.coordinates?.[0] || 0,
              species_name: obs.species_detail?.name || 'Unknown species',
              date: obs.date || new Date().toISOString(),
              location: obs.displayLocation || 'Unknown location',
              species_group:
                obs.species_detail?.group_name ||
                getGroupName(obs.species_group) ||
                'default',
              rarity: obs.rarity,
              observer_name: obs.user_detail?.name,
            }))}
            height="calc(100vh - 300px)"
            onBoundsChange={handleBoundsChange}
            onObservationClick={(obsId) => {
              const obs = observations.find((o) => o.id?.toString() === obsId);
              if (obs) handleViewDetails(obs);
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="w-5 h-5" />
                Observations Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              {observations.length === 0 && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  No observations found. Try adjusting your search filters.
                </div>
              ) : observations.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Species</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Observer</TableHead>
                        <TableHead>Rarity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {observations.slice(0, 50).map((obs) => (
                        <TableRow key={obs.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">
                                {obs.species_detail?.name || 'Unknown species'}
                              </div>
                              {(obs.species_detail?.group_name ||
                                getGroupName(obs.species_group)) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {obs.species_detail?.group_name ||
                                    getGroupName(obs.species_group)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">
                                {obs.date
                                  ? new Date(obs.date).toLocaleDateString()
                                  : 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">
                                {obs.displayLocation || 'Unknown location'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">
                                {obs.user_detail?.name || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                obs.rarity === 'very_rare'
                                  ? 'destructive'
                                  : obs.rarity === 'rare'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {obs.rarity || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(obs)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {observations.length > 50 && (
                    <div className="text-center py-4 border-t">
                      <Button variant="outline">
                        Load More ({observations.length - 50} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="space-y-2">
                    <p>Preparing observation data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
