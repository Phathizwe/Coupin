import React from 'react';
import { PricingPlan } from '../../types/billing.types';
import PricingCard from './PricingCard';
import { useAnimations } from '../../hooks/useAnimations';

interface PricingGridProps {
  plans: PricingPlan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
  isProcessing?: boolean;
}

const PricingGrid: React.FC<PricingGridProps> = ({
  plans,
  currentPlanId,
  onSelectPlan,
  isProcessing = false
}) => {
  const { useStaggeredAnimation, animationPreference } = useAnimations();
  const { ref, trail } = useStaggeredAnimation(plans, 100);
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Choose Your Plan</h2>
      
      <div 
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {plans.map((plan, index) => (
          <div 
            key={plan.id}
            style={animationPreference ? (trail[index] as any) : undefined}
          >
            <PricingCard 
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onSelectPlan={onSelectPlan}
              isProcessing={isProcessing}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingGrid;