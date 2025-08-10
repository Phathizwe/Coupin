import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth/AuthContext';
import billingService from '../services/firestore/billingService';
import { PricingPlan, UserSubscription, BillingHistory, UsageMetrics } from '../types/billing.types';
import { initializePricingPlans } from '../utils/setupPricingPlans';

export const useBillingData = () => {
  // Access AuthContext without type assertion
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user; // Adjust based on actual structure
  const businessProfile = authContext?.businessProfile; // Adjust based on actual structure
  
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add a refresh function
  const refreshBillingData = async () => {
    if (!currentUser || !businessProfile) {
      return;
    }
    try {
      setIsLoading(true);
        const [plansData, subscriptionData, historyData, metricsData] = await Promise.all([
          billingService.getPricingPlans(),
          billingService.getUserSubscription(businessProfile.businessId),
          billingService.getBillingHistory(businessProfile.businessId),
          billingService.getUsageMetrics(businessProfile.businessId)
        ]);
        
      // If no pricing plans found, initialize default ones and fetch again
      if (plansData.length === 0) {
        await initializePricingPlans();
        const updatedPlansData = await billingService.getPricingPlans();
        setPricingPlans(updatedPlansData);
      } else {
        setPricingPlans(plansData);
      }
      
        setSubscription(subscriptionData);
        setBillingHistory(historyData);
        setUsageMetrics(metricsData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching billing data:', err);
        setError(err.message || 'Failed to load billing data');
      } finally {
        setIsLoading(false);
      }
};

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!currentUser || !businessProfile) {
        setIsLoading(false);
        return;
      }
  
      try {
        setIsLoading(true);
        
        // Fetch all billing data in parallel
        const [plansData, subscriptionData, historyData, metricsData] = await Promise.all([
          billingService.getPricingPlans(),
          billingService.getUserSubscription(businessProfile.businessId),
          billingService.getBillingHistory(businessProfile.businessId),
          billingService.getUsageMetrics(businessProfile.businessId)
        ]);
        
        // If no pricing plans found, initialize default ones and fetch again
        if (plansData.length === 0) {
          await initializePricingPlans();
          const updatedPlansData = await billingService.getPricingPlans();
          setPricingPlans(updatedPlansData);
        } else {
          setPricingPlans(plansData);
        }
        
        setSubscription(subscriptionData);
        setBillingHistory(historyData);
        setUsageMetrics(metricsData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching billing data:', err);
        setError(err.message || 'Failed to load billing data');
      } finally {
        setIsLoading(false);
      }
};

    fetchBillingData();
  }, [currentUser, businessProfile]);
  
  return {
    pricingPlans,
    subscription,
    billingHistory,
    usageMetrics,
    isLoading,
    error,
    refreshBillingData
};
};