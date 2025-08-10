import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PricingPlan, UserSubscription, BillingHistory, UsageMetrics } from '../../types/billing.types';

/**
 * Service for managing billing and subscription data
 */
class BillingService {
  /**
   * Get a user's current subscription
   * @param businessId Business ID
   * @returns Promise with subscription data
   */
  async getUserSubscription(businessId: string): Promise<UserSubscription | null> {
    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef,
        where('businessId', '==', businessId),
        where('status', 'in', ['active', 'past_due']),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return querySnapshot.docs[0].data() as UserSubscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  /**
   * Get billing history for a business
   * @param businessId Business ID
   * @returns Promise with billing history array
   */
  async getBillingHistory(businessId: string): Promise<BillingHistory[]> {
    try {
      const historyRef = collection(db, 'billingHistory');
      const q = query(
        historyRef,
        where('businessId', '==', businessId),
        orderBy('paymentDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BillingHistory[];
    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  }

  /**
   * Get usage metrics for a business
   * @param businessId Business ID
   * @returns Promise with usage metrics
   */
  async getUsageMetrics(businessId: string): Promise<UsageMetrics | null> {
    try {
      const metricsRef = doc(db, 'usageMetrics', businessId);
      const metricsDoc = await getDoc(metricsRef);
      
      if (!metricsDoc.exists()) {
        return null;
      }
      
      return metricsDoc.data() as UsageMetrics;
    } catch (error) {
      console.error('Error fetching usage metrics:', error);
      throw error;
    }
  }

  /**
   * Get all available pricing plans
   * @returns Promise with pricing plans array
   */
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      // Log which collection we're accessing
      console.log('Fetching pricing plans from collection: pricing_plans');
      
      // Updated to use the correct collection name with underscore
      const plansRef = collection(db, 'pricing_plans');
      
      // Query for plans with active flag set to true
      const q = query(plansRef, where('active', '==', true));
      
      const querySnapshot = await getDocs(q);
      
      // Log how many plans we found
      console.log(`Found ${querySnapshot.size} active pricing plans`);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingPlan[];
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  }

  /**
   * Change a user's subscription plan
   * @param businessId Business ID
   * @param planId New plan ID
   * @returns Promise with updated subscription
   */
  async changePlan(businessId: string, planId: string): Promise<UserSubscription> {
    try {
      // In a real implementation, this would integrate with your payment processor
      // to update the subscription and then update your database
      
      // For now, we'll just return a mock response
      throw new Error('Not implemented: This would integrate with your payment processor');
    } catch (error) {
      console.error('Error changing plan:', error);
      throw error;
}
  }

  /**
   * Update payment method
   * @param businessId Business ID
   * @param paymentMethodId Payment method ID from payment processor
   * @returns Promise with success status
   */
  async updatePaymentMethod(businessId: string, paymentMethodId: string): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with your payment processor
      // to update the payment method and then update your database
      
      // For now, we'll just return a mock response
      throw new Error('Not implemented: This would integrate with your payment processor');
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * @param businessId Business ID
   * @returns Promise with success status
   */
  async cancelSubscription(businessId: string): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with your payment processor
      // to cancel the subscription and then update your database
      
      // For now, we'll just return a mock response
      throw new Error('Not implemented: This would integrate with your payment processor');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

const billingService = new BillingService();
export default billingService;