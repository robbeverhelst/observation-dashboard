'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Info } from 'lucide-react';
import type { SpeciesDataWithCount as SpeciesData } from '@/types/observations';

interface SpeciesCardProps {
  species: SpeciesData;
  onViewDetails: (species: SpeciesData) => void;
  onViewObservations?: (species: SpeciesData) => void;
  showObservationCount?: boolean;
}

export function SpeciesCard({
  species,
  onViewDetails,
  onViewObservations,
  showObservationCount = true,
}: SpeciesCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getObservationCount = () => {
    // Try to get observation count from various possible fields
    const speciesWithCount = species as unknown as {
      observation_count?: number;
      observations_count?: number;
      count?: number;
    };
    return (
      speciesWithCount.observation_count ||
      speciesWithCount.observations_count ||
      speciesWithCount.count ||
      0
    );
  };

  const getRarityLevel = (count: number) => {
    if (count === 0) return { label: 'No data', variant: 'outline' as const };
    if (count < 10)
      return { label: 'Very Rare', variant: 'destructive' as const };
    if (count < 50) return { label: 'Rare', variant: 'secondary' as const };
    if (count < 200) return { label: 'Uncommon', variant: 'default' as const };
    return { label: 'Common', variant: 'default' as const };
  };

  const observationCount = getObservationCount();
  const rarity = getRarityLevel(observationCount);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {species.name}
            </CardTitle>
            {species.name_scientific && (
              <CardDescription className="text-xs italic line-clamp-1 mt-1">
                {species.name_scientific}
              </CardDescription>
            )}
          </div>
          {species.group_name && (
            <Badge variant="outline" className="text-xs shrink-0">
              {species.group_name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Species Image */}
        <div className="aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {species.photo && !imageError ? (
            <img
              src={species.photo}
              alt={species.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="text-muted-foreground text-center p-4">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                {species.photo ? 'Image failed to load' : 'No image available'}
              </p>
              <p className="text-xs opacity-70">ID: {species.id}</p>
            </div>
          )}
        </div>

        {/* Species Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">ID: {species.id}</span>
          </div>
          {showObservationCount && (
            <div className="flex items-center gap-1 justify-end">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {observationCount} obs
              </span>
            </div>
          )}
        </div>

        {/* Rarity Badge */}
        {showObservationCount && (
          <div className="flex justify-center">
            <Badge variant={rarity.variant} className="text-xs">
              {rarity.label}
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(species);
            }}
          >
            <Info className="w-3 h-3 mr-1" />
            Details
          </Button>
          {onViewObservations && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewObservations(species);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Observations
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
