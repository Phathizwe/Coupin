import React from 'react';
import { animated } from '@react-spring/web';
import { CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface BillingHeaderProps {
  animation?: any;
  animationPreference?: boolean;
}

/**
 * BillingHeader - Enhanced header component with emotional design
 * 
 * Implements:
 * - Visceral: Beautiful typography, micro-animations
 * - Behavioral: Clear information hierarchy
 * - Reflective: Professional appearance
 */
const BillingHeader: React.FC<BillingHeaderProps> = ({ 
  animation,
  animationPreference = true
}) => {
  return (
    <animated.div 
      style={animationPreference ? animation : {}} 
      className="mb-8"
    >
      <div className="flex items-center mb-2">
        <CreditCardIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
      </div>
      
      <p className="text-lg text-gray-600 mt-2">
        Manage your subscription, view usage metrics, and billing history
      </p>
      
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Upgrade your plan to unlock premium features and increase your usage limits.
            </p>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default BillingHeader;