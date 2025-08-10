import React from 'react';
import { FeaturesHero } from '@/components/features/sections/FeaturesHero';
import { PrimaryFeaturesGrid } from '@/components/features/sections/PrimaryFeaturesGrid';
import { InteractiveDemos } from '@/components/features/sections/InteractiveDemos';
import { SecondaryFeaturesGrid } from '@/components/features/sections/SecondaryFeaturesGrid';
import { FeatureComparisonTable } from '@/components/features/sections/FeatureComparisonTable';
import { Testimonials } from '@/components/features/sections/Testimonials';
import { FeaturesCTA } from '@/components/features/sections/FeaturesCTA';

const FeaturesPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <FeaturesHero />

      {/* Main Features Bento Grid */}
      <PrimaryFeaturesGrid />

      {/* Interactive Demo Section */}
      <InteractiveDemos />

      {/* Secondary Features */}
      <SecondaryFeaturesGrid />

      {/* Feature Comparison */}
      <FeatureComparisonTable />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA section */}
      <FeaturesCTA />
    </div>
  );
};

export default FeaturesPage;