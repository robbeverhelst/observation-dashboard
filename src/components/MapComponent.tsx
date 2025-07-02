'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/mapbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, Maximize2 } from 'lucide-react';
import { SPECIES_GROUP_COLORS } from '@/types/observations';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ObservationPoint {
  id: string;
  latitude: number;
  longitude: number;
  species_name: string;
  date: string;
  location: string;
  species_group?: string;
  rarity?: 'common' | 'moderate' | 'rare' | 'very_rare';
  observer_name?: string;
}

interface ObservationCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  observations: ObservationPoint[];
  species_groups: string[];
}

interface MapComponentProps {
  observations?: ObservationPoint[];
  height?: string;
  showControls?: boolean;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number; lng: number };
    zoom: number;
  }) => void;
}

export function MapComponent({
  observations = [],
  height = '400px',
  showControls = true,
  onBoundsChange,
}: MapComponentProps) {
  const [viewState, setViewState] = useState({
    longitude: 5.2913, // Center of Netherlands
    latitude: 52.1326,
    zoom: 7,
  });
  const [selectedObservation, setSelectedObservation] =
    useState<ObservationPoint | null>(null);
  const [selectedCluster, setSelectedCluster] =
    useState<ObservationCluster | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/outdoors-v12'
  );

  // Clustering logic
  const clusters = useMemo(() => {
    if (viewState.zoom >= 12) {
      // Don't cluster at high zoom levels
      return observations.map((obs) => ({
        id: obs.id,
        latitude: obs.latitude,
        longitude: obs.longitude,
        count: 1,
        observations: [obs],
        species_groups: [obs.species_group || 'default'],
      }));
    }

    const clustered: ObservationCluster[] = [];
    const processed = new Set<string>();
    const clusterDistance = 0.01; // Adjust based on zoom level

    observations.forEach((obs) => {
      if (processed.has(obs.id)) return;

      const nearby = observations.filter((other) => {
        if (processed.has(other.id) || other.id === obs.id) return false;

        const distance = Math.sqrt(
          Math.pow(obs.latitude - other.latitude, 2) +
            Math.pow(obs.longitude - other.longitude, 2)
        );

        return distance < clusterDistance;
      });

      const clusterObservations = [obs, ...nearby];
      clusterObservations.forEach((o) => processed.add(o.id));

      const speciesGroups = [
        ...new Set(
          clusterObservations
            .map((o) => o.species_group || 'default')
            .filter(Boolean)
        ),
      ];

      clustered.push({
        id: `cluster-${obs.id}`,
        latitude:
          clusterObservations.reduce((sum, o) => sum + o.latitude, 0) /
          clusterObservations.length,
        longitude:
          clusterObservations.reduce((sum, o) => sum + o.longitude, 0) /
          clusterObservations.length,
        count: clusterObservations.length,
        observations: clusterObservations,
        species_groups: speciesGroups,
      });
    });

    return clustered;
  }, [observations, viewState.zoom]);

  // Get pin color based on species group
  const getPinColor = (speciesGroup?: string) => {
    return (
      SPECIES_GROUP_COLORS[speciesGroup || 'default'] ||
      SPECIES_GROUP_COLORS.default
    );
  };

  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle map movement and bounds change with debouncing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMove = (evt: { viewState: any; target?: any }) => {
    setViewState(evt.viewState);

    // Debounce bounds change to avoid excessive API calls
    if (onBoundsChange && evt.target?.getBounds) {
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }

      boundsChangeTimeoutRef.current = setTimeout(() => {
        const bounds = evt.target.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
          center: {
            lat: evt.viewState.latitude,
            lng: evt.viewState.longitude,
          },
          zoom: evt.viewState.zoom,
        });
      }, 1000); // Wait 1 second after user stops moving the map
    }
  };

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (token) {
      setMapboxToken(token);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current);
      }
    };
  }, []);

  if (!mapboxToken) {
    return (
      <Card style={{ height }}>
        <CardHeader>
          <CardTitle className="text-lg">Biodiversity Map</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Mapbox access token required for map visualization
            </p>
            <Badge variant="outline">
              Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ height }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Observation Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{observations.length} observations</Badge>
            {showControls && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMapStyle('mapbox://styles/mapbox/streets-v12')
                  }
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Streets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMapStyle('mapbox://styles/mapbox/satellite-v9')
                  }
                >
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Satellite
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: `calc(${height} - 80px)` }} className="relative">
          <Map
            {...viewState}
            onMove={handleMove}
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
            interactive={showControls}
          >
            {/* Map Controls */}
            {showControls && (
              <>
                <NavigationControl position="top-right" />
                <ScaleControl position="bottom-left" />
              </>
            )}

            {/* Observation Clusters/Pins */}
            {clusters.map((cluster) => {
              const isCluster = cluster.count > 1;
              const primarySpeciesGroup = cluster.species_groups[0];
              const pinColor = getPinColor(primarySpeciesGroup);

              if (isCluster) {
                return (
                  <Marker
                    key={cluster.id}
                    longitude={cluster.longitude}
                    latitude={cluster.latitude}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedCluster(cluster);
                      setSelectedObservation(null);
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full text-white font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                      style={{
                        backgroundColor: pinColor,
                        width: Math.min(30 + Math.log(cluster.count) * 8, 50),
                        height: Math.min(30 + Math.log(cluster.count) * 8, 50),
                        border: '2px solid white',
                      }}
                    >
                      {cluster.count}
                    </div>
                  </Marker>
                );
              } else {
                const observation = cluster.observations[0];
                return (
                  <Marker
                    key={observation.id}
                    longitude={observation.longitude}
                    latitude={observation.latitude}
                    color={pinColor}
                    scale={0.8}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedObservation(observation);
                      setSelectedCluster(null);
                    }}
                  />
                );
              }
            })}

            {/* Single Observation Popup */}
            {selectedObservation && (
              <Popup
                longitude={selectedObservation.longitude}
                latitude={selectedObservation.latitude}
                anchor="bottom"
                onClose={() => setSelectedObservation(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="p-3 min-w-[250px]">
                  <h4 className="font-medium text-sm mb-2 text-foreground">
                    {selectedObservation.species_name}
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {selectedObservation.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        📅{' '}
                        {new Date(
                          selectedObservation.date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedObservation.observer_name && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          👤 {selectedObservation.observer_name}
                        </span>
                      </div>
                    )}
                    {selectedObservation.species_group && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: getPinColor(
                            selectedObservation.species_group
                          ),
                          color: getPinColor(selectedObservation.species_group),
                        }}
                      >
                        {selectedObservation.species_group}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Popup>
            )}

            {/* Cluster Popup */}
            {selectedCluster && (
              <Popup
                longitude={selectedCluster.longitude}
                latitude={selectedCluster.latitude}
                anchor="bottom"
                onClose={() => setSelectedCluster(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="p-3 min-w-[280px] max-w-[350px]">
                  <h4 className="font-medium text-sm mb-2">
                    {selectedCluster.count} Observations
                  </h4>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {selectedCluster.species_groups.map((group) => (
                        <Badge
                          key={group}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: getPinColor(group),
                            color: getPinColor(group),
                          }}
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedCluster.observations.slice(0, 5).map((obs) => (
                        <div
                          key={obs.id}
                          className="text-xs p-2 bg-muted rounded"
                        >
                          <div className="font-medium">{obs.species_name}</div>
                          <div className="text-muted-foreground">
                            {obs.location}
                          </div>
                        </div>
                      ))}
                      {selectedCluster.observations.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{selectedCluster.observations.length - 5} more...
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        // Zoom to show all observations in cluster
                        const bounds = selectedCluster.observations.reduce(
                          (acc, obs) => ({
                            minLat: Math.min(acc.minLat, obs.latitude),
                            maxLat: Math.max(acc.maxLat, obs.latitude),
                            minLng: Math.min(acc.minLng, obs.longitude),
                            maxLng: Math.max(acc.maxLng, obs.longitude),
                          }),
                          {
                            minLat: selectedCluster.observations[0].latitude,
                            maxLat: selectedCluster.observations[0].latitude,
                            minLng: selectedCluster.observations[0].longitude,
                            maxLng: selectedCluster.observations[0].longitude,
                          }
                        );

                        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
                        const centerLng = (bounds.minLng + bounds.maxLng) / 2;

                        setViewState({
                          ...viewState,
                          latitude: centerLat,
                          longitude: centerLng,
                          zoom: Math.max(viewState.zoom + 2, 12),
                        });
                        setSelectedCluster(null);
                      }}
                    >
                      Zoom to Observations
                    </Button>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}
