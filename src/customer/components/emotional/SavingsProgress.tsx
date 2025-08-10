import React from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface SavingsProgressProps {
  currentAmount: number;
  goalAmount: number;
  variant: 'detailed' | 'compact';
}

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  }
};

const SavingsProgress: React.FC<SavingsProgressProps> = ({ 
  currentAmount, 
  goalAmount,
  variant
}) => {
  // Calculate percentage with max of 100%
  const percentage = Math.min(Math.round((currentAmount / goalAmount) * 100), 100);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (percentage < 25) return BRAND_COLORS.primary[400];
    if (percentage < 50) return BRAND_COLORS.primary[500];
    if (percentage < 75) return BRAND_COLORS.primary[600];
    if (percentage < 100) return BRAND_COLORS.secondary[500];
    return BRAND_COLORS.secondary[600]; // 100% complete
  };
  
  // Get encouraging message based on progress
  const getMessage = () => {
    if (percentage < 25) return "Just getting started!";
    if (percentage < 50) return "Making progress!";
    if (percentage < 75) return "Well on your way!";
    if (percentage < 100) return "Almost there!";
    return "Goal achieved! 🎉";
  };
  
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Monthly Savings Goal</h3>
          <div className="text-xs font-medium" style={{ color: getProgressColor() }}>
            {percentage}%
          </div>
        </div>
        
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full rounded-full ${ANIMATIONS.transition.medium}`}
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${getProgressColor()}80, ${getProgressColor()})`,
              boxShadow: `0 0 8px ${getProgressColor()}80`
            }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            R{currentAmount} of R{goalAmount}
          </div>
          <div className="text-xs" style={{ color: getProgressColor() }}>
            {getMessage()}
          </div>
        </div>
      </div>
    );
  }
  
  // Detailed variant
  return (
    <div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full ${ANIMATIONS.transition.medium}`}
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${getProgressColor()}80, ${getProgressColor()})`,
            boxShadow: `0 0 8px ${getProgressColor()}80`
          }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {getMessage()}
        </div>
        <div className="text-xs font-medium" style={{ color: getProgressColor() }}>
          {percentage}% complete
        </div>
      </div>
    </div>
  );
};

export default SavingsProgress;