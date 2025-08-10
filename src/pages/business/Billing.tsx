import React, { useState } from 'react';
import { useBillingData } from '../../hooks/useBillingData';
import { useSubscription } from '../../hooks/useSubscription';
import { PricingPlan } from '../../types/billing.types';
import BillingHeader from '../../components/billing/BillingHeader';
import CelebrationEffect from '../../components/billing/CelebrationEffect';
import PricingCardsGrid from '../../components/billing/PricingCardsGrid';
import PlanComparison from '../../components/billing/PlanComparison';
import CurrentPlanCard from '../../components/billing/CurrentPlanCard';
import TrustBadges from '../../components/billing/TrustBadges';
import BillingHistory from '../../components/billing/BillingHistory';
import { ShieldCheckIcon, LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { forceRefreshPricingPlans } from '../../utils/setupPricingPlans';

const Billing: React.FC = () => {
  const {
    pricingPlans,
    subscription,
    billingHistory,
    usageMetrics,
    isLoading,
    error,
    refreshBillingData
  } = useBillingData();

  const {
    upgradeSubscription,
    cancelSubscription,
    isProcessing,
    success,
    resetState
  } = useSubscription();

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [refreshingPlans, setRefreshingPlans] = useState(false);

  // Function to handle plan upgrade - modified to accept either a plan object or a planId
  const handleUpgrade = async (planOrId: PricingPlan | string) => {
    if (isProcessing) return;

    // Extract the planId whether we receive a plan object or just an ID
    const planId = typeof planOrId === 'string' ? planOrId : planOrId.id;
    const planName = typeof planOrId === 'string'
      ? pricingPlans.find(p => p.id === planOrId)?.name || 'selected'
      : planOrId.name;

    const result = await upgradeSubscription(planId);

    if (result.success) {
      setCelebrationMessage(`You've successfully upgraded to the ${planName} plan!`);
      setShowCelebration(true);
      await refreshBillingData();
    }
  };

  // Function to handle subscription cancellation
  // This is a wrapper function that ignores the subscriptionId parameter
  const handleCancel = async (_subscriptionId: string) => {
    if (isProcessing || !subscription) return;

    const result = await cancelSubscription();

    if (result.success) {
      await refreshBillingData();
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    resetState();
  };

  // Add a function to handle pricing plan refresh
  const handleRefreshPricingPlans = async () => {
    try {
      setRefreshingPlans(true);
      await forceRefreshPricingPlans();
      await refreshBillingData();
      setCelebrationMessage("Pricing plans have been successfully loaded!");
      setShowCelebration(true);
    } catch (error) {
      console.error('Error refreshing pricing plans:', error);
    } finally {
      setRefreshingPlans(false);
    }
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

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error, show an error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Error loading billing information: {error}</p>
        <button 
          onClick={refreshBillingData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription & Billing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your business needs with transparent pricing and flexible options.
        </p>
        
        {/* Animation toggle */}
        <div className="mt-4">
          <button
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
          >
            <span className="relative inline-block w-10 h-5 mr-2">
              <input
                type="checkbox"
                checked={true}
                className="opacity-0 w-0 h-0"
              />
              <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 bg-blue-500">
                <span className="absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-300 transform translate-x-5"></span>
              </span>
            </span>
            Animations On
          </button>
        </div>
      </div>
      
      {/* Current plan section */}
      <div className="mb-16">
        {subscription ? (
          <CurrentPlanCard 
            subscription={subscription}
            usageMetrics={usageMetrics || undefined}
            onUpgrade={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
            onCancel={handleCancel}
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
      </div>
      
      {/* Trust badges section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustBadges.map((badge) => (
            <div 
              key={badge.id}
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
            </div>
          ))}
        </div>
      </div>
      
      {/* Pricing grid section */}
      <div className="mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-500 mt-1">Select the plan that fits your needs</p>
          </div>
        </div>
        
        {pricingPlans.length > 0 ? (
          <PricingCardsGrid 
            plans={pricingPlans}
            currentPlanId={subscription?.planId}
            onSelectPlan={handleUpgrade}
            isProcessing={isProcessing}
            onCompareClick={() => setShowComparisonTable(!showComparisonTable)}
            showComparisonTable={showComparisonTable}
          />
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-500 mb-6">Please click the button below to load pricing plans.</p>
            <button 
              onClick={handleRefreshPricingPlans}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={refreshingPlans}
            >
              {refreshingPlans ? 'Loading...' : 'Load Pricing Plans'}
            </button>
          </div>
        )}
      </div>
      
      {/* Plan comparison section */}
      {showComparisonTable && pricingPlans.length > 0 && (
        <PlanComparison 
          plans={pricingPlans}
          currentPlanId={subscription?.planId}
          onSelectPlan={handleUpgrade}
        />
      )}
      
      {/* Billing history section */}
      {billingHistory && billingHistory.length > 0 && (
        <div className="mt-16">
          <BillingHistory history={billingHistory} />
        </div>
      )}
      
      <CelebrationEffect 
        show={showCelebration}
        message={celebrationMessage}
        onComplete={handleCloseCelebration}
      />
    </div>
  );
};

export default Billing;