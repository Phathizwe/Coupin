import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth/AuthContext';
import { collection, getDocs, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import billingService from '../services/firestore/billingService';
import { PricingPlan } from '../types/billing.types';
export const useSubscription = () => {
  // Access AuthContext without type assertion
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user; // Adjust based on actual structure
  const businessId = authContext?.businessProfile?.businessId; // Adjust based on actual structure
  
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Function to get the limit value for a specific feature from the plan
  const getPlanLimit = (plan: PricingPlan, feature: string): number => {
    const featureItem = plan.features.find(f => f.name.toLowerCase().includes(feature.toLowerCase()));
    if (!featureItem) return 0;
    
    // Extract the limit from the feature name if it contains a number
    const limitMatch = featureItem.name.match(/(\d+)/);
    return limitMatch ? parseInt(limitMatch[0], 10) : 0;
  };

  // Reset state after operations
  const resetState = () => {
    setIsProcessing(false);
    setSuccess(false);
  };
  
  // Upgrade subscription function
  const upgradeSubscription = async (planId: string) => {
    if (!currentUser || !businessId) return { success: false };
    
    setIsProcessing(true);
    try {
      // Implement subscription upgrade logic here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPlan(planId);
      setSuccess(true);
      return { success: true };
    } catch (err) {
      setError('Failed to upgrade subscription');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel subscription function - no parameters needed
  const cancelSubscription = async () => {
    if (!currentUser || !businessId) return { success: false };
    
    setIsProcessing(true);
    try {
      // Implement subscription cancellation logic here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      return { success: true };
    } catch (err) {
      setError('Failed to cancel subscription');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
};
  
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!currentUser || !businessId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get the user's current subscription
        // Using a direct implementation since the service method might not exist
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(
          subscriptionsRef,
          where('businessId', '==', businessId),
          where('status', '==', 'active'),
          orderBy('startDate', 'desc'),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const subscription = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
            planId: snapshot.docs[0].data().planId || '' // Make sure planId exists
          };
          setCurrentPlan(subscription.planId);
        } else {
          // If no subscription found, create a free tier subscription
          const plans = await billingService.getPricingPlans();
          const freePlan = plans.find(p => p.price === 0) || plans[0];
          
          if (freePlan) {
            const planDetails = freePlan;
            // Create a new subscription directly
            const newSubscription = {
              businessId,
              userId: currentUser.uid,
              planId: planDetails.id,
              planName: planDetails.name,
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
              renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              amount: planDetails.price,
              currency: planDetails.currency,
              features: planDetails.features.filter((f: any) => f.included).map((f: any) => f.name),
              limits: {
                customers: getPlanLimit(planDetails, 'customers'),
                coupons: getPlanLimit(planDetails, 'coupons'),
                communications: getPlanLimit(planDetails, 'communications')
              }
            };
            
            // Add the subscription to Firestore
            const subscriptionsCollection = collection(db, 'subscriptions');
            await addDoc(subscriptionsCollection, newSubscription);
            
            setCurrentPlan(planDetails.id);
          }
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching subscription data:', err);
        setError(err.message || 'Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [currentUser, businessId]);
  
  return {
    currentPlan,
    isLoading,
    error,
    upgradeSubscription,
    cancelSubscription,
    isProcessing,
    success,
    resetState
  };
};