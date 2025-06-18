import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  Challenge,
  Country,
  Species,
  Region,
  RegionSpeciesList,
} from 'observation-js';

type DataItem = Challenge | Country | Species | Region | RegionSpeciesList;

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DataItem | null;
  type: 'challenge' | 'country' | 'species' | 'list' | 'region';
}

export function DetailModal({ isOpen, onClose, item, type }: DetailModalProps) {
  if (!item) return null;

  const renderTitle = (): string => {
    if (!item) return 'Item Details';

    switch (type) {
      case 'challenge':
        return (
          ('title' in item ? String(item.title) : '') ||
          ('id' in item ? `Challenge #${item.id}` : 'Challenge')
        );
      case 'country':
        return (
          ('name' in item ? String(item.name) : '') ||
          ('code' in item ? `Country ${item.code}` : 'Country')
        );
      case 'species':
        return (
          ('name' in item ? String(item.name) : '') ||
          ('id' in item ? `Species #${item.id}` : 'Species')
        );
      case 'list':
        return 'id' in item ? `Species List #${item.id}` : 'Species List';
      case 'region':
        return (
          ('name' in item ? String(item.name) : '') ||
          ('id' in item ? `Region #${item.id}` : 'Region')
        );
      default:
        return 'id' in item ? `Item #${item.id}` : 'Item Details';
    }
  };

  const renderDescription = (): string => {
    if (!item) return 'Detailed information';

    switch (type) {
      case 'challenge':
        return (
          ('header' in item ? String(item.header) : '') ||
          'Biodiversity challenge details'
        );
      case 'country':
        const countryName = 'name' in item ? String(item.name) : 'this country';
        const countryCode = 'code' in item ? ` (${item.code})` : '';
        return `Country information for ${countryName}${countryCode}`;
      case 'species':
        return (
          ('scientific_name' in item ? String(item.scientific_name) : '') ||
          'Species information'
        );
      case 'list':
        return 'Regional species list details';
      case 'region':
        const regionName = 'name' in item ? String(item.name) : 'this region';
        return `Regional information for ${regionName}`;
      default:
        return 'Detailed information';
    }
  };

  const renderDetails = () => {
    const details: Array<{ key: string; value: unknown }> = [];

    // Add all available properties
    Object.entries(item || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        details.push({ key, value });
      }
    });

    return (
      <div className="space-y-3">
        {details.map(({ key, value }) => (
          <div key={key} className="flex justify-between items-start gap-4">
            <span className="text-sm font-medium text-muted-foreground capitalize min-w-0">
              {key.replace(/_/g, ' ')}:
            </span>
            <div className="text-sm text-right flex-1 min-w-0">
              {renderValue(key, value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderValue = (key: string, value: unknown) => {
    // Handle boolean values
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    // Handle special fields
    if (key === 'is_active') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      );
    }

    if (key.includes('count') || key.includes('Count')) {
      return <Badge variant="outline">{String(value)}</Badge>;
    }

    if (key === 'code' && type === 'country') {
      return <Badge variant="outline">{String(value)}</Badge>;
    }

    if (key === 'type' && type === 'region') {
      return <Badge variant="secondary">{String(value)}</Badge>;
    }

    if (key === 'group_name' && type === 'species') {
      return <Badge variant="outline">{String(value)}</Badge>;
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="text-xs text-muted-foreground">
          {JSON.stringify(value, null, 2)}
        </div>
      );
    }

    // Handle long text
    if (typeof value === 'string' && value.length > 100) {
      return <div className="text-sm break-words">{value}</div>;
    }

    // Default string/number rendering
    return <span className="break-words">{String(value)}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{renderTitle()}</DialogTitle>
          <DialogDescription>{renderDescription()}</DialogDescription>
        </DialogHeader>

        <div className="mt-6">{renderDetails()}</div>
      </DialogContent>
    </Dialog>
  );
}
