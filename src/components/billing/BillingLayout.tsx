import React, { useState, ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { ShieldCheckIcon, LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { UserSubscription, UsageMetrics, PricingPlan, BillingHistory } from '../../types/billing.types';
import CurrentPlanCard from './CurrentPlanCard';
import PricingGrid from './PricingGrid';
import TrustBadges from './TrustBadges';
import PlanComparison from './PlanComparison';
import BillingHistoryComponent from './BillingHistory';
import useBillingAnimations from '../../hooks/useBillingAnimations';
import { useAnimations } from '../../hooks/useAnimations';

interface BillingLayoutProps {
  currentSubscription: UserSubscription | null;
  usageMetrics: UsageMetrics | null;
  pricingPlans: PricingPlan[];
  billingHistory: BillingHistory[];
  onSelectPlan: (planId: string) => Promise<void>;
  onCancelPlan: (subscriptionId: string) => Promise<void>;
  isProcessing: boolean;
  children?: ReactNode;
}

const BillingLayout: React.FC<BillingLayoutProps> = ({
  currentSubscription,
  usageMetrics,
  pricingPlans,
  billingHistory,
  onSelectPlan,
  onCancelPlan,
  isProcessing,
  children
}) => {
  const [showComparison, setShowComparison] = useState(false);
  
  // Get animations for the billing page
  const {
    headerAnimation,
    currentPlanAnimation,
    pricingGridAnimation,
    trustBadgesAnimation,
    comparisonAnimation,
    historyAnimation,
    playCelebrationAnimation,
    animationPreference,
    setAnimationPreference
  } = useBillingAnimations();
  
  // Get general animations
  const { useFadeIn } = useAnimations();
  const { ref: pageRef } = useFadeIn(100);
  
  // Handle plan selection
  const handleSelectPlan = async (planId: string) => {
    await onSelectPlan(planId);
    playCelebrationAnimation();
  };

  // Handle plan cancellation
  const handleCancelPlan = async (subscriptionId: string) => {
    await onCancelPlan(subscriptionId);
  };
  
  // Trust badges data
  const trustBadges = [
    {
      id: 'secure',
      icon: <LockClosedIcon className="h-6 w-6" />,
      text: 'Secure Payments',
      tooltip: 'Your payment information is encrypted and secure'
    },
    {
      id: 'cancel',
      icon: <CreditCardIcon className="h-6 w-6" />,
      text: 'Cancel Anytime',
      tooltip: 'No long-term contracts, cancel your subscription anytime'
    },
    {
      id: 'guarantee',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      text: '30-Day Guarantee',
      tooltip: 'Not satisfied? Get a full refund within 30 days'
    }
  ];
  
  // Toggle animation preference
  const toggleAnimations = () => {
    setAnimationPreference(!animationPreference);
  };

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section with emotional design */}
      <animated.div style={headerAnimation} className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription & Billing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your business needs with transparent pricing and flexible options.
        </p>
        
        {/* Animation toggle */}
        <div className="mt-4">
          <button
            onClick={toggleAnimations}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
          >
            <span className="relative inline-block w-10 h-5 mr-2">
              <input
                type="checkbox"
                checked={animationPreference}
                onChange={toggleAnimations}
                className="opacity-0 w-0 h-0"
              />
              <span className={`
                absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300
                ${animationPreference ? 'bg-blue-500' : 'bg-gray-300'}
              `}>
                <span className={`
                  absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-300
                  ${animationPreference ? 'transform translate-x-5' : ''}
                `}></span>
              </span>
            </span>
            {animationPreference ? 'Animations On' : 'Animations Off'}
          </button>
        </div>
      </animated.div>
      
      {/* Current plan section */}
      <animated.div style={currentPlanAnimation} className="mb-16">
        {currentSubscription ? (
          <CurrentPlanCard 
            subscription={currentSubscription}
            usageMetrics={usageMetrics || undefined}
            onUpgrade={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
            onCancel={handleCancelPlan}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-500 mb-6">Choose a plan below to get started</p>
              <button 
                onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Choose a Plan
              </button>
            </div>
          </div>
        )}
      </animated.div>
      
      {/* Trust badges section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustBadges.map((badge, index) => (
            <animated.div 
              key={badge.id}
              style={animationPreference ? trustBadgesAnimation[index] : undefined}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center border border-gray-100"
            >
              <div className="mr-4 bg-blue-50 p-3 rounded-full">
                {badge.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{badge.text}</h3>
                {badge.tooltip && (
                  <p className="text-sm text-gray-500">{badge.tooltip}</p>
                )}
              </div>
            </animated.div>
          ))}
        </div>
      </div>
      
      {/* Pricing grid section */}
      <animated.div style={pricingGridAnimation} className="mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-500 mt-1">Select the plan that fits your needs</p>
          </div>
        </div>
        
        {pricingPlans.length > 0 ? (
          <PricingGrid 
            plans={pricingPlans}
            currentPlanId={currentSubscription?.planId}
            onSelectPlan={handleSelectPlan}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-500 mb-6">Please contact support to set up pricing plans.</p>
          </div>
        )}
        
        {/* Comparison toggle - only show if there are plans */}
        {pricingPlans.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-blue-600 font-medium hover:text-blue-700 focus:outline-none"
            >
              {showComparison ? 'Hide detailed comparison' : 'Compare all features'}
            </button>
          </div>
        )}
      </animated.div>
      
      {/* Plan comparison section */}
      {showComparison && pricingPlans.length > 0 && (
        <animated.div style={comparisonAnimation}>
          <PlanComparison 
            plans={pricingPlans}
            currentPlanId={currentSubscription?.planId}
            onSelectPlan={handleSelectPlan}
          />
        </animated.div>
      )}
      
      {/* Billing history section */}
      {billingHistory.length > 0 && (
        <animated.div style={historyAnimation}>
          <BillingHistoryComponent 
            history={billingHistory}
            className="mt-16"
          />
        </animated.div>
      )}
      
      {/* Additional content */}
      {children}
    </div>
  );
};

export default BillingLayout;