import React from 'react';
import { MapPin } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Region } from '@/hooks/useRegionDetection';

interface RegionSelectorProps {
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  selectedRegionData?: Region;
}

export function RegionSelector({
  regions,
  selectedRegion,
  onRegionChange,
  selectedRegionData
}: RegionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Region
      </label>
      <Select value={selectedRegion} onValueChange={onRegionChange}>
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedRegionData?.flag}</span>
              <span>{selectedRegionData?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.code} value={region.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{region.flag}</span>
                <span>{region.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}