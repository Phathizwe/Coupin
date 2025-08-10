import React from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  }
};

const EmotionalLoadingState: React.FC = () => {
  // Loading messages with personality
  const loadingMessages = [
    "Finding your best savings...",
    "Gathering your coupon collection...",
    "Preparing your deals...",
    "Calculating your potential savings...",
    "Almost there! Your coupons are loading..."
  ];
  
  // Pick a random message
  const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className="w-16 h-16 mb-6 relative"
        style={{ color: BRAND_COLORS.primary[600] }}
      >
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse"
        >
          💰
        </div>
      </div>
      
      <h3 
        className="text-lg font-semibold mb-2 animate-pulse"
        style={{ color: BRAND_COLORS.primary[700] }}
      >
        {randomMessage}
      </h3>
      
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
        <div 
          className="h-full rounded-full animate-pulse"
          style={{ 
            background: `linear-gradient(90deg, ${BRAND_COLORS.primary[400]}, ${BRAND_COLORS.primary[600]})`,
            width: '60%'
          }}
        ></div>
      </div>
    </div>
  );
};

export default EmotionalLoadingState;