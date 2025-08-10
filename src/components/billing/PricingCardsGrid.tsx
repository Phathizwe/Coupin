import React from 'react';
import { animated } from '@react-spring/web';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import PricingCard from './PricingCard';
import useBillingAnimations from '../../hooks/useBillingAnimations';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';
import { PricingPlan } from '../../types/billing.types';

interface PricingCardsGridProps {
  plans: PricingPlan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => Promise<void>;
  isProcessing: boolean;
  onCompareClick: () => void;
  showComparisonTable: boolean;
  animation?: any;
  animationPreference?: boolean;
}

/**
 * PricingCardsGrid - Grid display of pricing cards with emotional design
 * 
 * Implements:
 * - Visceral: Beautiful card layout, micro-animations
 * - Behavioral: Clear pricing comparison, intuitive actions
 * - Reflective: Highlighting best value, creating confidence
 */
const PricingCardsGrid: React.FC<PricingCardsGridProps> = ({
  plans,
  currentPlanId,
  onSelectPlan,
  isProcessing,
  onCompareClick,
  showComparisonTable,
  animation,
  animationPreference = true
}) => {
  const { isDetailedView } = useResponsiveLayout();

  if (!plans || plans.length === 0) {
  return (
      <animated.div 
        style={animationPreference ? animation : {}}
        className="text-center py-12"
    >
        <p className="text-gray-500">No pricing plans available</p>
          </animated.div>
  );
  }

  return (
    <animated.div 
      style={animationPreference ? animation : {}}
      className="mb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Plans</h2>
          <p className="text-gray-500 mt-1">Choose the plan that fits your needs</p>
        </div>
        
        <button
          onClick={onCompareClick}
          className="flex items-center mt-4 md:mt-0 text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showComparisonTable ? (
            <>
              <EyeSlashIcon className="h-5 w-5 mr-2" />
              <span>Hide Comparison</span>
            </>
          ) : (
            <>
              <EyeIcon className="h-5 w-5 mr-2" />
              <span>Compare All Plans</span>
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            onSelectPlan={onSelectPlan}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </animated.div>
  );
};

export default PricingCardsGrid;