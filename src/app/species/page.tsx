'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SpeciesCard } from '@/components/SpeciesCard';
import { DetailModal } from '@/components/DetailModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Search,
  Grid3X3,
  List,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import type { SpeciesDataWithCount } from '@/types/observations';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'observations' | 'group' | 'recent';

export default function SpeciesPage() {
  const router = useRouter();

  const [species, setSpecies] = useState<SpeciesDataWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedSpecies, setSelectedSpecies] =
    useState<SpeciesDataWithCount | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchSpecies();
    fetchGroups();
  }, [selectedGroup, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSpecies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: '100',
      });

      if (selectedGroup !== 'all') {
        params.append('group', selectedGroup);
      }

      if (sortBy) {
        params.append('sort', sortBy);
      }

      const response = await fetch(`/api/species?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch species');
      }

      const data = await response.json();
      console.log('Fetched species data:', data);
      if (data.results && data.results.length > 0) {
        console.log('First species item:', data.results[0]);
      }
      setSpecies(data.results || []);
    } catch (err) {
      console.error('Error fetching species:', err);
      setError('Failed to load species');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        const groupsList = data.results || data;
        if (Array.isArray(groupsList)) {
          setGroups(groupsList);
        }
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleRefresh = () => {
    fetchSpecies();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewDetails = (speciesItem: SpeciesDataWithCount) => {
    console.log('Species item details:', speciesItem);
    if (!speciesItem.id) {
      console.error('Species ID is missing:', speciesItem);
      return;
    }
    router.push(`/species/${speciesItem.id}`);
  };

  const handleViewModal = (speciesItem: SpeciesDataWithCount) => {
    setSelectedSpecies(speciesItem);
    setModalOpen(true);
  };

  const filteredSpecies = species.filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(query) ||
      s.name_scientific?.toLowerCase().includes(query) ||
      s.group_name?.toLowerCase().includes(query)
    );
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Species Browser</h1>
          <p className="text-muted-foreground">
            Explore and discover species from biodiversity observations
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search species..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="observations">Most Observed</SelectItem>
              <SelectItem value="group">Taxonomic Group</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="whitespace-nowrap">
            {filteredSpecies.length} species
          </Badge>

          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Loading species...
              </p>
            </div>
          </div>
        )}

        {filteredSpecies.length === 0 && !loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No species found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredSpecies.map((speciesItem, index) => (
                  <SpeciesCard
                    key={`species-grid-${speciesItem.id}-${index}`}
                    species={speciesItem}
                    onViewDetails={handleViewDetails}
                    onViewObservations={handleViewModal}
                    showObservationCount={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Species List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredSpecies.map((speciesItem, index) => (
                      <div
                        key={`species-list-${speciesItem.id}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleViewDetails(speciesItem)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{speciesItem.name}</h4>
                          {speciesItem.name_scientific && (
                            <p className="text-sm text-muted-foreground italic">
                              {speciesItem.name_scientific}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {speciesItem.group_name && (
                            <Badge variant="outline" className="text-xs">
                              {speciesItem.group_name}
                            </Badge>
                          )}
                          {speciesItem.observation_count !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {speciesItem.observation_count} obs
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Load More Button */}
      {filteredSpecies.length >= 100 && (
        <div className="text-center">
          <Button variant="outline" onClick={handleRefresh}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Load More Species
          </Button>
        </div>
      )}

      {/* Species Detail Modal */}
      <DetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedSpecies}
        type="species"
      />
    </div>
  );
}
