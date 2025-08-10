import React, { useState, useEffect } from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface AchievementNotificationProps {
  message: string;
}

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  celebrate: {
    confetti: 'animate-confetti',
    bounce: 'animate-bounce',
    tada: 'animate-tada',
  }
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
    
    // Animate out after 4.5 seconds
    const timer = setTimeout(() => setIsVisible(false), 4500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 ${ANIMATIONS.transition.medium} ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-10'
      }`}
    >
      <div 
        className={`bg-white rounded-xl shadow-lg py-3 px-5 flex items-center space-x-3 border ${ANIMATIONS.celebrate.tada}`}
        style={{ borderColor: BRAND_COLORS.secondary[300] }}
      >
        <div className="text-2xl">🏆</div>
        <div>
          <h4 className="font-bold text-gray-800">Achievement Unlocked!</h4>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;