import React from 'react';
import { BRAND } from '../../constants/brandConstants';

interface TYCAWatermarkProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
}

const TYCAWatermark: React.FC<TYCAWatermarkProps> = ({ 
  className = '',
  position = 'bottom-right',
  opacity = 0.1,
  size = 'medium'
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
      default:
        return 'bottom-0 right-0';
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xl';
      case 'large':
        return 'text-5xl';
      case 'medium':
      default:
        return 'text-3xl';
    }
  };
  
  return (
    <div 
      className={`absolute pointer-events-none select-none font-bold ${getPositionClasses()} ${getSizeClasses()} ${className}`}
      style={{ opacity }}
    >
      {BRAND.name}
    </div>
  );
};

export default TYCAWatermark;