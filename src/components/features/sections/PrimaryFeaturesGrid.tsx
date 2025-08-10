import React from 'react';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
// Import from the renamed file
import { primaryFeatures, FeatureItem } from '../data/feature-data-jsx';

export const PrimaryFeaturesGrid: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <BentoGrid className="lg:grid-rows-3">
          {primaryFeatures.map((feature: FeatureItem) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
};