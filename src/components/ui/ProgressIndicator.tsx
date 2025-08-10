import React from 'react';
import { animated, useSpring } from '@react-spring/web';

interface ProgressIndicatorProps {
  value: number;
  maxValue: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  animated?: boolean;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  maxValue,
  label,
  showPercentage = false,
  size = 'md',
  color = 'primary',
  className = '',
  animated: shouldAnimate = true,
  showValue = false,
  valuePrefix = '',
  valueSuffix = ''
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (color !== 'auto') return `bg-${color}-600`;
    
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Determine height based on size
  const getHeightClass = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-3';
      case 'md':
      default: return 'h-2';
    }
  };
  
  // Animation for the progress bar
  const props = useSpring({
    width: `${percentage}%`,
    from: { width: '0%' },
    config: { tension: 120, friction: 14 },
  });
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          <div className="flex items-center gap-2">
            {showValue && (
              <span className="text-sm font-medium text-gray-700">
                {valuePrefix}{value}{valueSuffix}/{maxValue}{valueSuffix}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
            )}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${getHeightClass()}`}>
        {shouldAnimate ? (
          <animated.div 
            className={`${getColorClass()} rounded-full h-full`} 
            style={props}
          />
        ) : (
          <div 
            className={`${getColorClass()} rounded-full h-full`} 
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;