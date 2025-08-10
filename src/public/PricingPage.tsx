import React, { useState, useEffect } from 'react';
import { PricingPlan } from '../types/billing.types';
import billingService from '../services/firestore/billingService';
import { useCurrency } from '../contexts/CurrencyContext';
import PricingCard from './components/PricingCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import { fallbackPlans } from './components/PricingFallbackData';
import { CurrencyRegionSetter } from '../components/ui/currency-region/currency-region-setter';

// Define ZAR pricing directly based on Firestore data
const zarPricing = {
  starter: 0,
  growth: 199.99,
  professional: 399.99
};

// Define the correct order for pricing plans (fallback if displayOrder is not set)
const planOrder = ['starter', 'growth', 'professional'];

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, setCurrency, region, setRegion, getCurrencySymbol, isLoading: isCurrencyChanging } = useCurrency();
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['ZAR', 'USD', 'EUR', 'GBP']);

  // Helper function to apply currency-specific pricing to plans
  // Only uses direct currency prices from Firestore or falls back to ZAR
  const applyCurrencyPricing = (plansToConvert: PricingPlan[], targetCurrency: string) => {
    console.log(`[PricingPage] Applying ${targetCurrency} pricing to plans`);

    return plansToConvert.map(plan => {
      // Try to find a currency-specific price
      const currencyPrice = plan.currencyPrices?.find(cp => cp.currencyCode === targetCurrency);

      if (currencyPrice) {
        console.log(`[PricingPage] Found specific ${targetCurrency} price for ${plan.name}: ${currencyPrice.price}`);
        return {
          ...plan,
          currency: targetCurrency,
          price: currencyPrice.price
        };
      }

      // If no specific price found and it's ZAR, use hardcoded prices
      if (targetCurrency === 'ZAR') {
        const planId = plan.name.toLowerCase();
        const zarPrice = zarPricing[planId as keyof typeof zarPricing];
        if (zarPrice !== undefined) {
          console.log(`[PricingPage] Using hardcoded ZAR price for ${plan.name}: ${zarPrice}`);
          return {
            ...plan,
            currency: 'ZAR',
            price: zarPrice
          };
        }
      }

      // If we get here, no price was found for the target currency
      // Instead of converting, we'll default to ZAR pricing
      console.log(`[PricingPage] No price found for ${plan.name} in ${targetCurrency}, defaulting to ZAR`);
      const planId = plan.name.toLowerCase();
      const zarPrice = zarPricing[planId as keyof typeof zarPricing];

      if (zarPrice !== undefined) {
        return {
          ...plan,
          currency: 'ZAR',  // Fall back to ZAR
          price: zarPrice
        };
      }

      // If all else fails, keep the original price but update currency
      console.warn(`[PricingPage] No pricing found for ${plan.name} in any currency`);
      return {
        ...plan,
        currency: 'ZAR'  // Default to ZAR
      };
    });
  };

  // Helper function to sort plans by displayOrder or fallback to predefined order
  const sortPlans = (plansToSort: PricingPlan[]) => {
    return [...plansToSort].sort((a, b) => {
      // First try to use displayOrder if available
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder;
      }

      // Fall back to the predefined order if displayOrder is not set
      const aIndex = planOrder.indexOf(a.name.toLowerCase());
      const bIndex = planOrder.indexOf(b.name.toLowerCase());

      // If both plans are in the predefined order, use that
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one plan is in the predefined order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // If neither plan is in the predefined order, sort by name
      return a.name.localeCompare(b.name);
    });
  };

  // Filter plans to only show active ones
  const filterActivePlans = (plansToFilter: PricingPlan[]) => {
    return plansToFilter.filter(plan => plan.active !== false);
  };

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`[PricingPage] Fetching pricing plans for currency: ${currency}`);

        // Fetch plans from Firestore
        console.log('[PricingPage] Attempting to fetch plans from pricing_plans collection');
        const fetchedPlans = await billingService.getPricingPlans();

        if (fetchedPlans && fetchedPlans.length > 0) {
          console.log(`[PricingPage] Successfully fetched ${fetchedPlans.length} plans from Firestore`);

          // Filter active plans
          const activePlans = filterActivePlans(fetchedPlans);
          console.log(`[PricingPage] Filtered to ${activePlans.length} active plans`);

          // Apply currency-specific pricing
          const currencyPlans = applyCurrencyPricing(activePlans, currency);

          // Sort plans in the correct order
          const sortedPlans = sortPlans(currencyPlans);
          console.log('[PricingPage] Plans sorted by displayOrder:',
            sortedPlans.map(p => `${p.name} (order: ${p.displayOrder !== undefined ? p.displayOrder : 'not set'})`));

          setPlans(sortedPlans);
        } else {
          console.log('[PricingPage] No plans found in Firestore, using fallback data');

          // Apply currency-specific pricing to fallback plans
          const currencyPlans = applyCurrencyPricing(fallbackPlans, currency);

          // Sort plans in the correct order
          const sortedPlans = sortPlans(currencyPlans);

          setPlans(sortedPlans);
        }
      } catch (err) {
        console.error('[PricingPage] Error fetching pricing plans:', err);
        setError('Failed to load pricing plans. Please try again later.');

        // Apply currency-specific pricing to fallback plans on error
        const currencyPlans = applyCurrencyPricing(fallbackPlans, currency);
        const sortedPlans = sortPlans(currencyPlans);
        setPlans(sortedPlans);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingPlans();
  }, [currency]); // Re-fetch when currency changes

  // Handle currency changes directly in this component
  const handleCurrencyChange = (newCurrency: string) => {
    console.log('[PricingPage] Setting currency to:', newCurrency);

    // Mark that this was explicitly set by the user
    localStorage.setItem('userExplicitCurrencyChoice', 'true');

    // Set the currency
    setCurrency(newCurrency);
  };

  // Handle region changes directly in this component
  const handleRegionChange = (newRegion: string) => {
    console.log('[PricingPage] Setting region to:', newRegion);
    setRegion(newRegion);
  };

  // Loading state
  if (isLoading || isCurrencyChanging) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="pricing-page container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Free Forever: Generate & send unlimited coupons. Pay only when you see value.
        </p>
      </div>

      <div className="flex justify-end mb-8">
        <CurrencyRegionSetter
          defaultCurrency={currency}
          defaultRegion={region}
          onCurrencyChange={handleCurrencyChange}
          onRegionChange={handleRegionChange}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id || plan.name}
            plan={plan}
            currency={currency}
            currencySymbol={getCurrencySymbol(currency)}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Need a custom plan for your business?</h2>
        <p className="text-gray-600 mb-6">
          Contact our sales team to discuss a tailored solution for your specific needs.
        </p>
        <a
          href="mailto:sales@coupin.app"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Contact Sales
        </a>
      </div>
    </div>
  );
};

export default PricingPage;