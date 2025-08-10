import React, { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import AnimatedButton from '../ui/AnimatedButton';
import { PricingPlan } from '../../types/billing.types';
import { formatPrice, getPlanBadgeText, getPlanColorScheme } from '../../utils/pricing.utils';
import { useAnimations } from '../../hooks/useAnimations';

interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: string) => void;
  isProcessing?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isCurrentPlan = false,
  onSelectPlan,
  isProcessing = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { animationPreference } = useAnimations();
  
  // Get color scheme for this plan
  const colorScheme = getPlanColorScheme(plan.id);
  
  // Get badge text
  const badgeText = getPlanBadgeText(plan.id);
  
  // Animation for hover effect
  const cardSpring = useSpring({
    transform: isHovered && animationPreference ? 'translateY(-8px)' : 'translateY(0px)',
    boxShadow: isHovered && animationPreference 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    config: { tension: 300, friction: 20 }
  });
  
  // Animation for features
  const { useStaggeredAnimation } = useAnimations();
  const { ref: featuresRef, trail: featuresTrail } = useStaggeredAnimation(plan.features, 50);
  
  // Handle card interaction
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  // Determine button text
  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    return plan.ctaText || 'Select Plan';
  };
  
  return (
    <animated.div
      style={animationPreference ? cardSpring : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative rounded-xl overflow-hidden border transition-colors
        ${isCurrentPlan ? `border-2 ${colorScheme.border}` : 'border-gray-200'}
        ${isHovered ? colorScheme.background : 'bg-white'}
      `}
    >
      {/* Badge */}
      {badgeText && (
        <div 
          className={`absolute top-0 right-0 py-1 px-3 text-xs font-medium rounded-bl-lg ${colorScheme.badgeText} ${colorScheme.badgeBg}`}
        >
          {badgeText}
        </div>
      )}
      
      {/* Card content */}
      <div className="p-6">
        {/* Plan name */}
        <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
        
        {/* Price */}
        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(plan.price, plan.currency)}
            <span className="text-sm text-gray-700 font-medium">/{plan.billingCycle}</span>
          </p>
          {plan.description && (
            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
          )}
        </div>
        
        {/* Features */}
        <ul className="mb-6 space-y-2" ref={featuresRef}>
          {plan.features.map((feature, index) => (
            <animated.li 
              key={feature.id}
              style={animationPreference ? featuresTrail[index] : undefined}
              className={`flex items-center ${feature.highlight ? 'font-medium' : ''}`}
            >
              {feature.included ? (
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={`text-sm ${feature.included ? 'text-gray-800' : 'text-gray-500'}`}>
                {feature.name}
                {feature.tooltip && (
                  <span className="ml-1 inline-block text-gray-400 cursor-help" title={feature.tooltip}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </span>
            </animated.li>
          ))}
        </ul>
        
        {/* Action button */}
        <AnimatedButton
          onClick={() => !isCurrentPlan && onSelectPlan(plan.id)}
          disabled={isCurrentPlan || isProcessing}
          className={`
            w-full py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isCurrentPlan 
              ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500' 
              : `${colorScheme.buttonBg} text-white ${colorScheme.buttonHover} focus:ring-blue-500`}
          `}
        >
          {getButtonText()}
        </AnimatedButton>
        
        {/* Trust indicator */}
        {plan.name.toLowerCase() !== 'starter' && (
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-500" />
            <span>Secure payment</span>
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default PricingCard;