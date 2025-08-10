import React, { useState, useMemo } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PricingPlan } from '../../types/billing.types';
import { formatPrice } from '../../utils/pricing.utils';
import { useAnimations } from '../../hooks/useAnimations';

interface PlanComparisonProps {
  plans: PricingPlan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
  animation?: any; // Add animation prop
  animationPreference?: boolean; // Add animation preference prop
}

interface FeatureGroup {
  name: string;
  features: {
    id: string;
    name: string;
    included: Record<string, boolean>;
    highlight?: boolean;
    tooltip?: string;
  }[];
}

const PlanComparison: React.FC<PlanComparisonProps> = ({
  plans,
  currentPlanId,
  onSelectPlan,
  animation, // Use the passed animation
  animationPreference = true // Default to true
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { useFadeIn } = useAnimations();
  const { ref, props } = useFadeIn(200);

  // Group features by category for comparison
  const featureGroups: FeatureGroup[] = [
    {
      name: 'Core Features',
      features: [
        {
          id: 'coupons',
          name: 'Active Coupons',
          included: {
            starter: true,
            growth: true,
            professional: true
          },
          tooltip: 'Number of coupons you can have active at once'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          included: {
            starter: false,
            growth: true,
            professional: true
          }
        },
        {
          id: 'templates',
          name: 'Coupon Templates',
          included: {
            starter: true,
            growth: true,
            professional: true
          }
        }
      ]
    },
    {
      name: 'Advanced Features',
      features: [
        {
          id: 'loyalty',
          name: 'Loyalty Programs',
          included: {
            starter: false,
            growth: true,
            professional: true
          }
        },
        {
          id: 'communications',
          name: 'Customer Communications',
          included: {
            starter: false,
            growth: true,
            professional: true
          }
        },
        {
          id: 'api',
          name: 'API Access',
          included: {
            starter: false,
            growth: false,
            professional: true
          },
          highlight: true
        }
      ]
    },
    {
      name: 'Support',
      features: [
        {
          id: 'email-support',
          name: 'Email Support',
          included: {
            starter: true,
            growth: true,
            professional: true
          }
        },
        {
          id: 'priority-support',
          name: 'Priority Support',
          included: {
            starter: false,
            growth: true,
            professional: true
          }
        },
        {
          id: 'dedicated-support',
          name: 'Dedicated Account Manager',
          included: {
            starter: false,
            growth: false,
            professional: true
          },
          highlight: true
        }
      ]
    }
  ];

  // Toggle section expansion
  const toggleSection = (sectionName: string) => {
    if (expandedSection === sectionName) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionName);
    }
  };

  // Create individual springs for each section - moved inside the component
  const coreFeatureSpring = useSpring({
    height: expandedSection === 'Core Features' ? 'auto' : 0,
    opacity: expandedSection === 'Core Features' ? 1 : 0,
    config: { tension: 300, friction: 20 }
  });
  
  const advancedFeatureSpring = useSpring({
    height: expandedSection === 'Advanced Features' ? 'auto' : 0,
    opacity: expandedSection === 'Advanced Features' ? 1 : 0,
    config: { tension: 300, friction: 20 }
  });
    
  const supportSpring = useSpring({
    height: expandedSection === 'Support' ? 'auto' : 0,
    opacity: expandedSection === 'Support' ? 1 : 0,
    config: { tension: 300, friction: 20 }
  });

  // Function to get the appropriate spring for a section - using the already created springs
  const getSectionSpring = (sectionName: string) => {
    switch(sectionName) {
      case 'Core Features':
        return coreFeatureSpring;
      case 'Advanced Features':
        return advancedFeatureSpring;
      case 'Support':
        return supportSpring;
      default:
        return { height: 0, opacity: 0 };
    }
  };

  return (
    <animated.div
      ref={ref}
      style={animationPreference ? (animation || props) : undefined}
      className="mt-12 bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Plan Comparison</h2>
        <p className="text-gray-600 mt-1">Compare features across different plans</p>
      </div>

      {/* Plan headers */}
      <div className="grid grid-cols-4 border-b border-gray-200">
        <div className="p-4 font-medium text-gray-700">Feature</div>
        {plans.map(plan => (
          <div key={plan.id} className="p-4 text-center">
            <h3 className="font-bold text-gray-900">{plan.name}</h3>
            <p className="text-gray-700 font-medium">
              {formatPrice(plan.price, plan.currency)}/{plan.billingCycle}
            </p>
            {plan.id === currentPlanId && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                Current Plan
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Feature groups */}
      {featureGroups.map(group => (
        <div key={group.name} className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => toggleSection(group.name)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:outline-none"
          >
            <span className="font-medium text-gray-800">{group.name}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSection === group.name ? 'rotate-180' : ''
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <animated.div
            style={animationPreference ? getSectionSpring(group.name) : undefined}
            className="overflow-hidden"
          >
            {group.features.map(feature => (
              <div
                key={feature.id}
                className={`grid grid-cols-4 py-3 px-4 ${feature.highlight ? 'bg-blue-50' : ''
                  }`}
              >
                <div className="flex items-center">
                  <span
                    className={`text-sm ${feature.highlight ? 'font-medium' : ''}`}
                    title={feature.tooltip || ''}
                  >
                    {feature.name}
                  </span>
                </div>

                {plans.map(plan => {
                  const planKey = plan.name.toLowerCase();
                  const isIncluded = feature.included[planKey];

                  return (
                    <div key={`${feature.id}-${plan.id}`} className="flex items-center justify-center">
                      {isIncluded ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </animated.div>
        </div>
      ))}

      {/* Action buttons */}
      <div className="grid grid-cols-4 p-4 bg-gray-50 border-t border-gray-200">
        <div></div>
        {plans.map(plan => (
          <div key={`action-${plan.id}`} className="flex justify-center">
            <button
              onClick={() => onSelectPlan(plan.id)}
              disabled={plan.id === currentPlanId}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                ${plan.id === currentPlanId
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'}
              `}
            >
              {plan.id === currentPlanId ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </animated.div>
  );
};

export default PlanComparison;