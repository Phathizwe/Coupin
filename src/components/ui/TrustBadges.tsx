import React from 'react';
import { animated } from '@react-spring/web';
import { useAnimations } from '../../hooks/useAnimations';

interface TrustBadge {
  id: string;
  icon: React.ReactNode;
  text: string;
  tooltip?: string;
}

interface TrustBadgesProps {
  badges: TrustBadge[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({
  badges,
  size = 'md',
  className = ''
}) => {
  const { useStaggeredAnimation } = useAnimations();
  const { ref, trail } = useStaggeredAnimation(badges, 100);
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  };
  
  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div 
      ref={ref}
      className={`flex flex-wrap justify-center items-center gap-4 ${className}`}
    >
      {trail.map((style: any, index: number) => (
        <animated.div 
          key={badges[index].id}
          style={style}
          className={`flex items-center ${sizeClasses[size]} text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full`}
          title={badges[index].tooltip}
        >
          <span className={iconSizeClasses[size]}>
            {badges[index].icon}
          </span>
          <span className="font-medium">{badges[index].text}</span>
        </animated.div>
      ))}
    </div>
  );
};

export default TrustBadges;