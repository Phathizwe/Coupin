import React from 'react';
import { animated } from '@react-spring/web';
import { UserSubscription } from '../../types/billing.types';
import { formatDate, getDaysRemaining, isInTrialPeriod } from '../../utils/pricing.utils';
import { useAnimations } from '../../hooks/useAnimations';
import AnimatedButton from '../ui/AnimatedButton';
import { ClockIcon, CheckBadgeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface SubscriptionSummaryProps {
  subscription: UserSubscription | null;
  onUpgrade: () => void;
  onCancel: () => void;
  className?: string;
  isProcessing?: boolean;
}

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({
  subscription,
  onUpgrade,
  onCancel,
  className = '',
  isProcessing = false
}) => {
  const { useFadeIn, animationPreference } = useAnimations();
  const { ref, props } = useFadeIn(100);
  
  // Get subscription status info
  const getStatusInfo = () => {
    if (!subscription) return null;
    
    const inTrial = isInTrialPeriod(subscription);
    const daysRemaining = inTrial 
      ? getDaysRemaining(subscription.trialEndDate)
      : getDaysRemaining(subscription.endDate);
    
    switch (subscription.status) {
      case 'active':
        return {
          icon: inTrial ? (
            <ClockIcon className="h-6 w-6 text-blue-500" />
          ) : (
            <CheckBadgeIcon className="h-6 w-6 text-green-500" />
          ),
          title: inTrial ? 'Trial Active' : 'Active',
          description: inTrial
            ? `Your trial ends in ${daysRemaining} days`
            : `Your subscription renews on ${formatDate(subscription.renewalDate)}`,
          color: inTrial ? 'blue' : 'green'
        };
      case 'past_due':
        return {
          icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />,
          title: 'Payment Due',
          description: 'Your payment is past due. Please update your payment method.',
          color: 'yellow'
        };
      case 'canceled':
        return {
          icon: <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
          title: 'Canceled',
          description: `Your subscription ends on ${formatDate(subscription.endDate)}`,
          color: 'red'
        };
      default:
        return {
          icon: <ClockIcon className="h-6 w-6 text-gray-500" />,
          title: 'Unknown',
          description: 'Subscription status unknown',
          color: 'gray'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // If no subscription, show a default state
  if (!subscription) {
    return (
      <animated.div 
        ref={ref}
        style={animationPreference ? props : undefined}
        className={`bg-white p-6 rounded-lg shadow-md ${className}`}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Plan</h2>
        <div className="p-4 border border-primary-200 bg-primary-50 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-primary-700">Free Trial</h3>
              <p className="text-gray-800 font-medium">Your trial ends in 30 days</p>
            </div>
            <AnimatedButton
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isProcessing}
            >
              Upgrade Plan
            </AnimatedButton>
          </div>
        </div>
      </animated.div>
    );
  }
  
  // Create safe class names to avoid Tailwind purge issues
  const getBgClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50';
      case 'green': return 'bg-green-50';
      case 'yellow': return 'bg-yellow-50';
      case 'red': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
};

  const getBorderClass = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200';
      case 'green': return 'border-green-200';
      case 'yellow': return 'border-yellow-200';
      case 'red': return 'border-red-200';
      default: return 'border-gray-200';
    }
  };
  
  const getBadgeBgClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100';
      case 'green': return 'bg-green-100';
      case 'yellow': return 'bg-yellow-100';
      case 'red': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };
  
  const getBadgeTextClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-800';
      case 'green': return 'text-green-800';
      case 'yellow': return 'text-yellow-800';
      case 'red': return 'text-red-800';
      default: return 'text-gray-800';
    }
  };
  
  const color = statusInfo?.color || 'gray';
  
  return (
    <animated.div 
      ref={ref}
      style={animationPreference ? props : undefined}
      className={`bg-white p-6 rounded-lg shadow-md ${className}`}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Plan</h2>
      
      <div className={`p-4 border ${getBorderClass(color)} ${getBgClass(color)} rounded-md`}>
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className="mr-4 mt-1">{statusInfo?.icon}</div>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-gray-900">{subscription.planName}</h3>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeBgClass(color)} ${getBadgeTextClass(color)}`}>
                  {statusInfo?.title}
                </span>
              </div>
              <p className="text-gray-700">{statusInfo?.description}</p>
              
              {/* Additional plan details */}
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Started on:</span>
                  <p className="font-medium text-gray-900">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Next billing:</span>
                  <p className="font-medium text-gray-900">{formatDate(subscription.renewalDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <AnimatedButton
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={subscription.status === 'canceled' || isProcessing}
            >
              {subscription.status === 'canceled' ? 'Renew Subscription' : 'Change Plan'}
            </AnimatedButton>
            
            {subscription.status !== 'canceled' && (
              <AnimatedButton
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={isProcessing}
              >
                Cancel Plan
              </AnimatedButton>
            )}
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default SubscriptionSummary;