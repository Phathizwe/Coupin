import React from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface EmotionalLoadMoreButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
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

const EmotionalLoadMoreButton: React.FC<EmotionalLoadMoreButtonProps> = ({ onClick, isLoading }) => {
  return (
    <div className="flex justify-center my-6">
      <button
        onClick={() => onClick()}
        disabled={isLoading}
        className={`px-6 py-3 rounded-xl font-medium text-white ${ANIMATIONS.transition.medium} ${
          isLoading ? 'opacity-70' : `${ANIMATIONS.hover.scale} ${ANIMATIONS.hover.glow}`
        }`}
        style={{ 
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary[500]}, ${BRAND_COLORS.primary[600]})`,
          boxShadow: `0 4px 6px -1px ${BRAND_COLORS.primary[500]}40, 0 2px 4px -1px ${BRAND_COLORS.primary[500]}30`
        }}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading more...
          </div>
        ) : (
          <div className="flex items-center">
            <span className="mr-2">Discover More Savings</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

export default EmotionalLoadMoreButton;