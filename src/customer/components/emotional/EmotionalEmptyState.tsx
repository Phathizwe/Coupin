import React from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

export interface EmotionalEmptyStateProps {
  searchQuery?: string;
}

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  hover: {
    scale: 'hover:scale-105',
    glow: 'hover:shadow-lg',
  }
};

const EmotionalEmptyState: React.FC<EmotionalEmptyStateProps> = ({ searchQuery = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 ${ANIMATIONS.transition.medium}`}>
      <div 
        className={`w-32 h-32 mb-6 rounded-full flex items-center justify-center ${ANIMATIONS.transition.medium} ${ANIMATIONS.hover.scale}`}
        style={{ 
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary[50]}, ${BRAND_COLORS.primary[100]})`,
          boxShadow: `0 10px 15px -3px ${BRAND_COLORS.primary[100]}, 0 4px 6px -2px ${BRAND_COLORS.primary[100]}`
        }}
      >
        {searchQuery ? (
          <span className="text-5xl">🔍</span>
        ) : (
          <span className="text-5xl">🎟️</span>
        )}
      </div>
      
      {searchQuery ? (
        <>
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: BRAND_COLORS.primary[700] }}
          >
            No coupons match your search
          </h3>
          <p className="text-gray-600 text-center mb-4">
            We couldn't find any coupons matching "{searchQuery}".
          </p>
          <p className="text-sm text-gray-500 text-center">
            Try a different search term or check back later for new offers!
          </p>
        </>
      ) : (
        <>
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: BRAND_COLORS.primary[700] }}
          >
            Your coupon journey begins!
          </h3>
          <p className="text-gray-600 text-center mb-4">
            You don't have any coupons yet, but great savings are on the way.
          </p>
          <div className="text-sm text-gray-500 text-center flex items-center">
            <span className="mr-2">👀</span>
            Check back soon for special offers tailored just for you!
          </div>
        </>
      )}
    </div>
  );
};

export default EmotionalEmptyState;