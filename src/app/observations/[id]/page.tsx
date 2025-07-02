'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapComponent } from '@/components/MapComponent';
import {
  MapPin,
  Calendar,
  User,
  Eye,
  Camera,
  Info,
  Map,
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import type { ObservationPoint } from '@/types/observations';

export default function ObservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [observation, setObservation] = useState<ObservationPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await fetchObservationDetails();
        await fetchGroups();
      }
    };
    fetchData();
  }, [id]);

  const fetchObservationDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/observations?type=single&id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch observation details');
      }
      const data = await response.json();
      setObservation(data);
    } catch (err) {
      console.error('Error fetching observation details:', err);
      setError('Failed to load observation details');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const groupsData = await response.json();
        // Convert to lookup map
        const groupMap: Record<number, string> = {};
        // Handle different possible data structures
        const groupsList = groupsData.results || groupsData;
        if (Array.isArray(groupsList)) {
          groupsList.forEach((group: { id: number; name: string }) => {
            groupMap[group.id] = group.name;
          });
        }
        setGroups(groupMap);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      // Continue without groups data
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGroupName = (groupId?: number): string => {
    if (!groupId) return 'Unknown group';

    // First try fetched groups data
    if (groups[groupId]) {
      return groups[groupId];
    }

    // Fallback to hardcoded mapping
    const fallbackGroups: Record<number, string> = {
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
      17: 'Lichens',
    };

    return fallbackGroups[groupId] || `Group ${groupId}`;
  };

  const getValidationStatus = (status?: string) => {
    // Based on waarneming.nl validation status codes
    switch (status) {
      case 'G': // Goedgekeurd (Approved)
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          label: 'Validated',
        };
      case 'J': // Juist (Correct)
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          label: 'Validated',
        };
      case 'P': // Pending
        return {
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
          label: 'Pending Review',
        };
      case 'A': // Afgewezen (Rejected)
        return {
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          label: 'Rejected',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-gray-500" />,
          label: 'Unknown Status',
        };
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: observation?.species_detail?.name || 'Observation',
        text: `Check out this ${observation?.species_detail?.name} observation`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !observation) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Observation Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'This observation could not be loaded.'}
          </p>
          <Button onClick={() => router.push('/observations')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Observations
          </Button>
        </div>
      </div>
    );
  }

  const coordinates = observation.point?.coordinates || [];
  const latitude = coordinates[1] || 0;
  const longitude = coordinates[0] || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/observations')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Observations
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {observation.species_detail?.name || 'Unknown species'}
            {observation.is_validated && (
              <CheckCircle className="w-7 h-7 text-green-500" />
            )}
          </h1>
          {observation.species_detail?.scientific_name && (
            <p className="text-xl text-muted-foreground italic">
              {observation.species_detail.scientific_name}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-sm">
              {getGroupName(
                observation.species_detail?.group || observation.species_group
              )}
            </Badge>
            {observation.rarity && (
              <Badge
                variant={
                  observation.rarity === 'very_rare'
                    ? 'destructive'
                    : observation.rarity === 'rare'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-sm"
              >
                {String(observation.rarity).replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Observation Info */}
            <Card>
              <CardHeader>
                <CardTitle>Observation Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(observation.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {observation.displayLocation || 'Unknown location'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Observer</p>
                    <p className="text-sm text-muted-foreground">
                      {observation.user_detail?.name || 'Unknown observer'}
                    </p>
                  </div>
                </div>
                {observation.number && (
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Count</p>
                      <p className="text-sm text-muted-foreground">
                        {observation.number} individual(s)
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Validation & Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Validation Status</span>
                  <div className="flex items-center gap-2">
                    {getValidationStatus(observation.validation_status).icon}
                    <span className="text-sm">
                      {getValidationStatus(observation.validation_status).label}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://waarneming.nl/observation/${observation.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Waarneming.nl
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          {observation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Field Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{observation.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Observation Photos
              </CardTitle>
              <CardDescription>
                Photos from the observation on waarneming.nl
              </CardDescription>
            </CardHeader>
            <CardContent>
              {observation.photos && observation.photos.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {observation.photos.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={photoUrl}
                          alt={`${observation.species_detail?.name} observation photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => console.error('Failed to load image')}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{observation.photos.length} photo(s) available</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    No photos available for this observation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Latitude
                  </p>
                  <p className="font-mono text-lg">{latitude.toFixed(6)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Longitude
                  </p>
                  <p className="font-mono text-lg">{longitude.toFixed(6)}</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <MapComponent
                  observations={[
                    {
                      id: observation.id?.toString() || '',
                      latitude,
                      longitude,
                      species_name:
                        observation.species_detail?.name || 'Unknown species',
                      date: observation.date || new Date().toISOString(),
                      location:
                        observation.displayLocation || 'Unknown location',
                      species_group: getGroupName(
                        observation.species_detail?.group ||
                          observation.species_group
                      ),
                      rarity: observation.rarity,
                      observer_name: observation.user_detail?.name,
                    },
                  ]}
                  height="400px"
                  showControls={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Related Observations
              </CardTitle>
              <CardDescription>
                Other observations of the same species or nearby
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Related observations coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
