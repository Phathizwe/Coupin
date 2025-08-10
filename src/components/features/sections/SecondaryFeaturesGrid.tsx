import React from 'react';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
// Import from the renamed file
import { secondaryFeatures, FeatureItem } from '../data/feature-data-jsx';

export const SecondaryFeaturesGrid: React.FC = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Advanced Business Tools</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Professional-grade features that scale with your business growth
          </p>
        </div>
        <BentoGrid className="lg:grid-rows-2">
          {secondaryFeatures.map((feature: FeatureItem) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
};