import React, { useState, useEffect } from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface SavingsMascotProps {
  state: 'welcoming' | 'encouraging' | 'celebrating' | 'grateful';
  onStateChange: (state: 'welcoming' | 'encouraging' | 'celebrating' | 'grateful') => void;
  savingsStreak: number;
  monthlySaved: number;
  totalSaved: number;
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
    pulse: 'hover:animate-pulse',
  },
  celebrate: {
    confetti: 'animate-confetti',
    bounce: 'animate-bounce',
    tada: 'animate-tada',
  }
};

// Mascot states with expressions and messages
const MASCOT_STATES = {
  welcoming: {
    emoji: '👋',
    messages: [
      "Welcome back! Ready to save?",
      "Hi there! Let's find some deals!",
      "Great to see you! Let's save today!"
    ]
  },
  encouraging: {
    emoji: '👍',
    messages: [
      "You're doing great! Keep going!",
      "Smart saving choices today!",
      "Every coupon helps your wallet!"
    ]
  },
  celebrating: {
    emoji: '🎉',
    messages: [
      "Amazing job on your savings!",
      "You're a savings superstar!",
      "Look at those savings add up!"
    ]
  },
  grateful: {
    emoji: '🙏',
    messages: [
      "Thanks for being a smart saver!",
      "Your wallet thanks you!",
      "Saving money looks good on you!"
    ]
  }
};

const SavingsMascot: React.FC<SavingsMascotProps> = ({ 
  state, 
  onStateChange,
  savingsStreak,
  monthlySaved,
  totalSaved
}) => {
  const [message, setMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Update message when state changes
  useEffect(() => {
    const messages = MASCOT_STATES[state].messages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    
    // Trigger animation
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    
    return () => clearTimeout(timer);
  }, [state]);
  
  // Automatically change state based on user activity
  useEffect(() => {
    const timer = setTimeout(() => {
      // Cycle through states for engagement
      if (state === 'welcoming') {
        onStateChange('encouraging');
      } else if (state === 'celebrating') {
        onStateChange('grateful');
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [state, onStateChange]);
  
  // Get personalized tip based on user data
  const getPersonalizedTip = () => {
    if (savingsStreak > 7) {
      return "You're on a hot streak! Keep it up!";
    }
    if (monthlySaved > 200) {
      return "Great savings this month!";
    }
    if (totalSaved > 1000) {
      return "You've saved over R1000 in total!";
    }
    return "Use coupons regularly to build your streak!";
  };
  
  return (
    <div className="sticky top-6">
      <div 
        className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 ${ANIMATIONS.transition.medium} ${
          isAnimating ? ANIMATIONS.celebrate.tada : ANIMATIONS.hover.scale
        }`}
      >
        {/* Mascot header */}
        <div 
          className="p-4 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND_COLORS.primary[50]}, ${BRAND_COLORS.primary[100]})` 
          }}
        >
          <div 
            className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-3xl"
            onClick={() => {
              // Cycle through states on click
              const states: Array<'welcoming' | 'encouraging' | 'celebrating' | 'grateful'> = [
                'welcoming', 'encouraging', 'celebrating', 'grateful'
              ];
              const currentIndex = states.indexOf(state);
              const nextIndex = (currentIndex + 1) % states.length;
              onStateChange(states[nextIndex]);
            }}
          >
            {MASCOT_STATES[state].emoji}
          </div>
        </div>
        
        {/* Mascot message */}
        <div className="p-4 text-center">
          <p 
            className="text-sm font-medium mb-3"
            style={{ color: BRAND_COLORS.primary[700] }}
          >
            {message}
          </p>
          
          <div className="text-xs text-gray-600 italic">
            {getPersonalizedTip()}
          </div>
        </div>
        
        {/* Streak indicator */}
        <div 
          className="p-3 text-center text-sm"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND_COLORS.secondary[50]}, ${BRAND_COLORS.secondary[100]})`,
            color: BRAND_COLORS.secondary[700]
          }}
        >
          {savingsStreak > 0 ? (
            <div className="flex items-center justify-center">
              <span className="mr-1">🔥</span>
              <span className="font-medium">{savingsStreak} day streak</span>
            </div>
          ) : (
            <div>Start your savings streak today!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsMascot;