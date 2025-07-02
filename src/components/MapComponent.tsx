'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ObservationPoint {
  id: string;
  latitude: number;
  longitude: number;
  species_name: string;
  date: string;
  location: string;
}

interface MapComponentProps {
  observations?: ObservationPoint[];
  height?: string;
  showControls?: boolean;
}

export function MapComponent({
  observations = [],
  height = '400px',
  showControls = true,
}: MapComponentProps) {
  const [viewState, setViewState] = useState({
    longitude: 5.2913, // Center of Netherlands
    latitude: 52.1326,
    zoom: 7,
  });
  const [selectedObservation, setSelectedObservation] =
    useState<ObservationPoint | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    // In a real app, you'd get this from environment variables
    // For demo purposes, we'll show a message if no token is available
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (token) {
      setMapboxToken(token);
    }
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
          <CardTitle className="text-lg">Observation Locations</CardTitle>
          <Badge variant="outline">{observations.length} observations</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: `calc(${height} - 80px)` }}>
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/outdoors-v12"
            interactive={showControls}
          >
            {observations.map((obs) => (
              <Marker
                key={obs.id}
                longitude={obs.longitude}
                latitude={obs.latitude}
                color="#22c55e"
                scale={0.8}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedObservation(obs);
                }}
              />
            ))}

            {selectedObservation && (
              <Popup
                longitude={selectedObservation.longitude}
                latitude={selectedObservation.latitude}
                anchor="bottom"
                onClose={() => setSelectedObservation(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-medium text-sm mb-1">
                    {selectedObservation.species_name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    📍 {selectedObservation.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📅 {selectedObservation.date}
                  </p>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}
