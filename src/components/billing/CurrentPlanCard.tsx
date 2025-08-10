import React from 'react';
import { animated } from '@react-spring/web';
import { 
  ClockIcon, 
  ChartBarIcon, 
  ArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { UserSubscription, UsageMetrics } from '../../types/billing.types';
import AnimatedButton from '../ui/AnimatedButton';
import { formatDate, getDaysRemaining, calculateUsagePercentage } from '../../utils/pricing.utils';

interface CurrentPlanCardProps {
  subscription?: UserSubscription;
  usageMetrics?: UsageMetrics;
  onUpgrade: () => void;
  onCancel: (id: string) => Promise<void>;
  isProcessing: boolean;
  animation?: any;
  animationPreference?: boolean;
}

/**
 * CurrentPlanCard - Enhanced current plan display with emotional design
 * 
 * Implements:
 * - Visceral: Beautiful visual design, micro-animations
 * - Behavioral: Clear usage indicators, intuitive actions
 * - Reflective: Status indicators, progress visualization
 */
const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ 
  subscription, 
  usageMetrics, 
  onUpgrade, 
  onCancel, 
  isProcessing,
  animation,
  animationPreference = true
}) => {
  if (!subscription) {
    return (
      <animated.div 
        style={animationPreference ? animation : {}} 
        className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100"
      >
        <div className="text-center py-8">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-500 mb-6">Choose a plan below to get started</p>
          <AnimatedButton 
            onClick={onUpgrade}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Choose a Plan
          </AnimatedButton>
        </div>
    </animated.div>
  );
  }

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

  const daysRemaining = getDaysRemaining(subscription.renewalDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <animated.div 
      style={animationPreference ? animation : {}} 
      className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900 mr-3">Current Plan: {subscription.planName}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-500">
            {subscription.currency} {subscription.amount.toFixed(2)}/month
          </p>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-3">
          {subscription.status === 'active' && (
            <>
              <AnimatedButton
                onClick={onUpgrade}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                disabled={isProcessing}
              >
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                Upgrade
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => onCancel(subscription.id)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={isProcessing}
              >
                Cancel Plan
              </AnimatedButton>
            </>
          )}
          
          {subscription.status === 'canceled' && (
            <AnimatedButton
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isProcessing}
            >
              Reactivate
            </AnimatedButton>
          )}
        </div>
      </div>
      
      {/* Subscription period info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>Started On</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatDate(subscription.startDate)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>Renewal Date</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatDate(subscription.renewalDate)}
          </div>
          {isExpiringSoon && (
            <div className="flex items-center text-yellow-600 mt-1 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              <span>Renews in {daysRemaining} days</span>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>Status</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {subscription.status === 'active' ? 'Active' : 'Canceled'}
          </div>
          {subscription.status === 'canceled' && (
            <div className="text-sm text-red-600 mt-1">
              Access until {formatDate(subscription.endDate)}
            </div>
          )}
        </div>
      </div>
      
      {/* Usage metrics */}
      {usageMetrics && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customers usage */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                <span>Customers</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {usageMetrics.customers.used} / {usageMetrics.customers.limit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${calculateUsagePercentage(usageMetrics.customers.used, usageMetrics.customers.limit)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Coupons usage */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                <span>Coupons</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {usageMetrics.coupons.used} / {usageMetrics.coupons.limit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${calculateUsagePercentage(usageMetrics.coupons.used, usageMetrics.coupons.limit)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Communications usage */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                <span>Communications</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {usageMetrics.communications.used} / {usageMetrics.communications.limit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 bg-purple-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${calculateUsagePercentage(usageMetrics.communications.used, usageMetrics.communications.limit)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </animated.div>
  );
};

export default CurrentPlanCard;