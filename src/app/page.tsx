'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DetailModal } from '@/components/DetailModal';
import { SpeciesCard } from '@/components/SpeciesCard';
import { StatsCard } from '@/components/StatsCard';
import { MapComponent } from '@/components/MapComponent';
import { Globe, Eye, Leaf, MapPin, TrendingUp, Award } from 'lucide-react';
import type {
  Challenge,
  Country,
  Species,
  Region,
  RegionSpeciesList as SpeciesList,
} from 'observation-js';

export default function Home() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [speciesLists, setSpeciesLists] = useState<SpeciesList[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  type DataItem = Challenge | Country | Species | SpeciesList | Region;
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [modalType, setModalType] = useState<
    'challenge' | 'country' | 'species' | 'list' | 'region'
  >('challenge');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (
    item: DataItem,
    type: 'challenge' | 'country' | 'species' | 'list' | 'region'
  ) => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch challenges from our API route
        const challengesResponse = await fetch('/api/challenges');
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData.results || []); // Show all challenges

        // Fetch countries from our API route
        const countriesResponse = await fetch('/api/countries');
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.results || []); // Show all countries

        // Fetch species lists from our API route
        const speciesListsResponse = await fetch('/api/species-groups');
        const speciesListsData = await speciesListsResponse.json();
        setSpeciesLists(speciesListsData.results || []); // Show all species lists

        // Fetch regions from our API route
        const regionsResponse = await fetch('/api/regions');
        const regionsData = await regionsResponse.json();
        setRegions(regionsData.results || []); // Show all regions

        // Fetch species from our API route
        const speciesResponse = await fetch('/api/species');
        const speciesData = await speciesResponse.json();
        setSpecies(speciesData.results || []); // Show all species
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from the observation database');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading observation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              🌍 Observation Explorer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover biodiversity through real-time species observations and
              interactive data visualization
            </p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatsCard
              title="Species Observed"
              value={species.length}
              icon={Leaf}
              badge="Live"
            />
            <StatsCard
              title="Active Challenges"
              value={
                challenges.filter((c) => {
                  const now = new Date();
                  const start = new Date(c.start_date_time);
                  const end = new Date(c.end_date_time);
                  return now >= start && now <= end;
                }).length
              }
              icon={Award}
              badge="Now"
            />
            <StatsCard
              title="Countries"
              value={countries.length}
              icon={Globe}
              badge="Global"
            />
            <StatsCard
              title="Regions"
              value={regions.length}
              icon={MapPin}
              badge="Areas"
            />
          </div>
        </div>
      </section>

      {/* Data Showcase Section */}
      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="challenges">
              Challenges ({challenges.length})
            </TabsTrigger>
            <TabsTrigger value="countries">
              Countries ({countries.length})
            </TabsTrigger>
            <TabsTrigger value="species">
              Species ({species.length})
            </TabsTrigger>
            <TabsTrigger value="lists">
              Lists ({speciesLists.length})
            </TabsTrigger>
            <TabsTrigger value="regions">
              Regions ({regions.length})
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge, index) => (
                <Card
                  key={challenge.id || `challenge-${index}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(challenge, 'challenge')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {challenge.title}
                      </CardTitle>
                      <Badge
                        variant={(() => {
                          const now = new Date();
                          const start = new Date(challenge.start_date_time);
                          const end = new Date(challenge.end_date_time);
                          return now >= start && now <= end
                            ? 'default'
                            : 'secondary';
                        })()}
                      >
                        {(() => {
                          const now = new Date();
                          const start = new Date(challenge.start_date_time);
                          const end = new Date(challenge.end_date_time);
                          return now >= start && now <= end
                            ? 'Active'
                            : 'Inactive';
                        })()}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {challenge.header || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Challenge #{challenge.id}
                      </span>
                      <Badge variant="outline">
                        {challenge.observation_count} observations
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="countries" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {countries.map((country, index) => (
                <Card
                  key={country.code || `country-${index}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(country, 'country')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {country.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {country.code}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      Code: {country.code}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="species" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {species.map((speciesItem, index) => (
                <SpeciesCard
                  key={speciesItem.id || `species-${index}`}
                  species={speciesItem}
                  onViewDetails={(species) =>
                    handleItemClick(species, 'species')
                  }
                  onViewObservations={(species) => {
                    // TODO: Implement observation viewing
                    console.log('View observations for:', species.name);
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {speciesLists.map((list, index) => (
                <Card
                  key={list.id || `list-${index}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(list, 'list')}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {list.species?.name || 'Unknown Species'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {list.species?.scientific_name || 'No scientific name'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {list.observation_count} observations
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Regional Species
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regions.map((region, index) => (
                <Card
                  key={region.id || `region-${index}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(region, 'region')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base line-clamp-1">
                        {region.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {region.slug}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Region #{region.id}
                      </span>
                      {region.parent && (
                        <Badge variant="outline" className="text-xs">
                          Parent: {region.parent.name}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Platform Statistics"
                value="Live Data"
                description="Real-time biodiversity insights"
                icon={TrendingUp}
                className="md:col-span-2 lg:col-span-1"
              />
              <StatsCard
                title="Total Observations"
                value={species.reduce(
                  (sum, s) =>
                    sum +
                    ((s as unknown as { observation_count?: number })
                      .observation_count || 0),
                  0
                )}
                description="Across all species"
                icon={Eye}
              />
              <StatsCard
                title="Data Coverage"
                value={`${countries.length}+ countries`}
                description="Global biodiversity data"
                icon={Globe}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>
                    Observation locations across regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MapComponent observations={[]} height="300px" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Species Diversity
                  </CardTitle>
                  <CardDescription>
                    Species breakdown by taxonomic groups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {species.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {s.group_name || 'Unknown Group'}
                      </span>
                      <Badge variant="outline">
                        {(s as unknown as { observation_count?: number })
                          .observation_count || 0}
                      </Badge>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Species</span>
                      <Badge>{species.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About the Data</CardTitle>
                <CardDescription>
                  Real-time biodiversity information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data displayed on this dashboard is fetched in real-time
                  from the Observation International database using the
                  observation-js library. This demonstrates the power and
                  accessibility of biodiversity data through public API
                  endpoints for research and conservation efforts.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                Powered by observation-js API • Live biodiversity data
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="https://robbeverhelst.github.io/observation-js/modules.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                API Documentation
              </a>
              <a
                href="https://github.com/robbeverhelst/observation-js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        item={selectedItem}
        type={modalType}
      />
    </div>
  );
}
