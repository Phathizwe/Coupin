import React from 'react';
import { animated } from '@react-spring/web';
import { UsageMetrics as UsageMetricsType } from '../../types/billing.types';
import ProgressIndicator from '../ui/ProgressIndicator';
import { calculateUsagePercentage, getUsageColorClass } from '../../utils/pricing.utils';
import { useAnimations } from '../../hooks/useAnimations';

interface UsageMetricsProps {
  metrics: UsageMetricsType;
  className?: string;
}

const UsageMetrics: React.FC<UsageMetricsProps> = ({ metrics, className = '' }) => {
  const { useStaggeredAnimation, animationPreference } = useAnimations();
  
  // Create metrics array for animation
  const metricsArray = [
    {
      id: 'customers',
      label: 'Customers',
      value: metrics.customers.used,
      limit: metrics.customers.limit,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
        </svg>
      )
    },
    {
      id: 'coupons',
      label: 'Active Coupons',
      value: metrics.coupons.used,
      limit: metrics.coupons.limit,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
        </svg>
      )
    },
    {
      id: 'communications',
      label: 'Communications',
      value: metrics.communications.used,
      limit: metrics.communications.limit,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      )
    }
  ];
  
  const { ref, trail } = useStaggeredAnimation(metricsArray, 100);
  
  // Function to get color based on usage percentage
  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return '#ef4444'; // red-500
    if (percentage >= 75) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
};

  return (
    <div 
      ref={ref}
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Usage Metrics</h2>
      
      <div className="space-y-6">
        {metricsArray.map((metric, index) => {
          const percentage = calculateUsagePercentage(metric.value, metric.limit);
          const color = getUsageColor(percentage);
          
          return (
            <animated.div 
              key={metric.id}
              style={animationPreference ? trail[index] : undefined}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">{metric.icon}</span>
                  <span className="font-medium">{metric.label}</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {metric.value} / {metric.limit === Infinity ? 'Unlimited' : metric.limit}
                </div>
              </div>
              
              <ProgressIndicator
                value={metric.value}
                maxValue={metric.limit === Infinity ? metric.value * 2 : metric.limit}
                size="md"
                color={color.replace('#', '')}
                animated={animationPreference}
              />
              
              {percentage >= 80 && (
                <p className="text-sm text-amber-600">
                  {percentage >= 95 
                    ? 'You\'re almost at your limit! Consider upgrading your plan.' 
                    : 'You\'re approaching your limit. Monitor your usage.'}
                </p>
              )}
            </animated.div>
          );
        })}
      </div>
    </div>
  );
};

export default UsageMetrics;