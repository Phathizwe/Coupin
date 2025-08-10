import React, { useEffect, useRef, useState } from 'react';
import { EmotionalCard } from './EmotionalAnimations';
import { CountUpValue, GrowthIndicator } from './MicroInteractions';
import './emotionalDesign.css';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  changePercentage?: number | string;
  loading?: boolean;
  iconBgColor?: string;
  iconColor?: string;
  index?: number;
  achievement?: boolean;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon,
  changePercentage,
  loading = false,
  iconBgColor = 'bg-green-100',
  iconColor = 'text-green-600',
  index = 0,
  achievement = false
}) => {
  const isPositive = typeof changePercentage === 'number' && changePercentage >= 0;
  const [hasShown, setHasShown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track if the card has been viewed to trigger animations only once
  useEffect(() => {
    if (hasShown || !cardRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(cardRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [hasShown]);
  
  // Format the value for display
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    // Format numbers with commas for thousands
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <EmotionalCard 
      index={index} 
      achievement={achievement}
      className="bg-white p-6 rounded-lg shadow-md"
      ref={cardRef}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-3xl font-bold">
            {loading ? (
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <CountUpValue 
                value={typeof value === 'number' ? value : 0}
                prefix={typeof value === 'string' && value.startsWith('R') ? 'R' : ''}
                formatter={(val) => formatValue(val)}
                duration={1200}
              />
            )}
          </h2>
        </div>
        <div className={`p-3 rounded-md ${iconBgColor} transition-transform duration-300 hover:scale-110`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        {changePercentage !== undefined && changePercentage !== '-' ? (
          <div className="flex items-center">
            <GrowthIndicator value={typeof changePercentage === 'number' ? changePercentage : 0} />
            <span className="text-gray-500 text-sm ml-2">vs last period</span>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">No previous data</span>
        )}
      </div>
    </EmotionalCard>
  );
};

export default AnalyticsCard;