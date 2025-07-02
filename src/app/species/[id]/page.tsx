'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Camera,
  Info,
  Globe,
  RefreshCw,
} from 'lucide-react';
import type { SpeciesDataWithCount } from '@/types/observations';
import type { ObservationPoint } from '@/types/observations';

export default function SpeciesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const speciesId = params.id as string;

  const [species, setSpecies] = useState<SpeciesDataWithCount | null>(null);
  const [observations, setObservations] = useState<ObservationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [observationsLoading, setObservationsLoading] = useState(false);

  useEffect(() => {
    if (speciesId) {
      fetchSpeciesData();
      fetchSpeciesObservations();
    }
  }, [speciesId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSpeciesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/species?id=${speciesId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch species data');
      }

      const data = await response.json();
      setSpecies(data);
    } catch (err) {
      console.error('Error fetching species:', err);
      setError('Failed to load species information');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeciesObservations = async () => {
    setObservationsLoading(true);
    try {
      const response = await fetch(
        `/api/observations?species_id=${speciesId}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setObservations(data.results || []);
      }
    } catch (err) {
      console.error('Error fetching species observations:', err);
    } finally {
      setObservationsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchSpeciesData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !species) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading species details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{species.name}</h1>
          {species.name_scientific && (
            <p className="text-lg text-muted-foreground italic">
              {species.name_scientific}
            </p>
          )}
        </div>
        {species.group_name && (
          <Badge variant="outline" className="text-sm">
            {species.group_name}
          </Badge>
        )}
      </div>

      {/* Species Hero Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Species Image */}
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {species.photo ? (
                <img
                  src={species.photo}
                  alt={species.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove(
                      'hidden'
                    );
                  }}
                />
              ) : null}
              <div className={species.photo ? 'hidden' : ''}>
                <div className="text-muted-foreground text-center p-4">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {species.photo
                      ? 'Image failed to load'
                      : 'No image available'}
                  </p>
                  <p className="text-xs opacity-70">ID: {species.id}</p>
                </div>
              </div>
            </div>

            {/* Species Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Species ID</span>
                </div>
                <p className="text-2xl font-bold">{species.id}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Observations</span>
                </div>
                <p className="text-2xl font-bold">
                  {species.observation_count || observations.length || 0}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Group</span>
                </div>
                <p className="text-lg font-medium">
                  {species.group_name || 'Unknown'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Observers</span>
                </div>
                <p className="text-lg font-medium">
                  {new Set(observations.map((obs) => obs.user_detail?.id))
                    .size || '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="observations">Observations</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Species Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Common Name</h4>
                    <p className="text-muted-foreground">{species.name}</p>
                  </div>
                  {species.name_scientific && (
                    <div>
                      <h4 className="font-medium mb-2">Scientific Name</h4>
                      <p className="text-muted-foreground italic">
                        {species.name_scientific}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Taxonomic Group</h4>
                    <p className="text-muted-foreground">
                      {species.group_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Species ID</h4>
                    <p className="text-muted-foreground">{species.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="observations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Recent Observations
                {observationsLoading && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {observations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No observations found for this species</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {observations.slice(0, 10).map((obs) => (
                    <div
                      key={obs.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => router.push(`/observations/${obs.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {obs.date
                              ? new Date(obs.date).toLocaleDateString()
                              : 'Unknown date'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {obs.displayLocation || 'Unknown location'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {obs.user_detail?.name || 'Unknown observer'}
                        </p>
                        {obs.number && (
                          <p className="text-xs text-muted-foreground">
                            Count: {obs.number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Distribution Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Distribution map coming soon</p>
                  <p className="text-xs">
                    Will show geographic distribution of observations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxonomy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Taxonomic Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Group</h4>
                    <p className="text-muted-foreground">
                      {species.group_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Group ID</h4>
                    <p className="text-muted-foreground">
                      {species.group || '-'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="text-center text-muted-foreground">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Extended taxonomic information coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Debug: Available Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Raw Species Data</h4>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(species, null, 2)}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Available Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.keys(species || {}).map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {key}
                        </code>
                        <span className="text-muted-foreground">
                          {
                            typeof (
                              species as unknown as Record<string, unknown>
                            )?.[key]
                          }
                          {Array.isArray(
                            (species as unknown as Record<string, unknown>)?.[
                              key
                            ]
                          ) &&
                            ` (${((species as unknown as Record<string, unknown>)?.[key] as unknown[]).length} items)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Photos Field Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Photos field exists:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {'photos' in (species || {}) ? 'Yes' : 'No'}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Photos value:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {JSON.stringify(
                          (species as unknown as Record<string, unknown>)
                            ?.photos
                        )}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Photos type:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {
                          typeof (species as unknown as Record<string, unknown>)
                            ?.photos
                        }
                      </code>
                    </div>
                    {Array.isArray(
                      (species as unknown as Record<string, unknown>)?.photos
                    ) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Photos length:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {
                            (
                              (species as unknown as Record<string, unknown>)
                                ?.photos as unknown[]
                            )?.length
                          }
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
