import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '../../config/firebase';

interface PlanDetails {
      name: string;
      price: number;
      currency: string;
      features: string[];
      limits: {
        customers: number;
        coupons: number;
        communications: number;
      };
}
      
interface UserSubscription {
  userId: string;
  businessId: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due';
  startDate: Timestamp;
  endDate: Timestamp;
  renewalDate: Timestamp;
  trialEndDate?: Timestamp;
  amount: number;
      currency: string;
  features: string[];
  limits: {
    customers: number;
    coupons: number;
    communications: number;
      };
  createdAt: Timestamp;
  updatedAt: Timestamp;
    }

type PlanTier = 'starter' | 'growth' | 'professional';

class SubscriptionService {
  /**
   * Upgrade a business subscription to a new plan
   */
  async upgradeSubscription(
    businessId: string,
    userId: string,
    planId: string,
    planDetails: PlanDetails
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const now = Timestamp.now();
      
      // Set renewal date to 30 days from now
      const renewalDate = new Timestamp(
        now.seconds + (30 * 24 * 60 * 60),
        now.nanoseconds
      );
      
      // Create the subscription document
      const subscriptionRef = collection(db, 'subscriptions');
      const newSubscription: Omit<UserSubscription, 'id'> = {
        userId,
        businessId,
        planId,
        planName: planDetails.name,
        status: 'active',
        startDate: now,
        endDate: new Timestamp(now.seconds + (365 * 24 * 60 * 60), now.nanoseconds), // 1 year from now
        renewalDate,
        amount: planDetails.price,
        currency: planDetails.currency,
        features: planDetails.features,
        limits: planDetails.limits,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(subscriptionRef, newSubscription);
      
      // Update the business profile with the new subscription tier
      await this.updateBusinessSubscriptionStatus(businessId, planDetails.name.toLowerCase() as PlanTier);
      
      // Create a billing history record
      await this.createBillingRecord(businessId, userId, planId, planDetails, docRef.id);
      
      return {
        success: true,
        subscriptionId: docRef.id
      };
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
  }
}

  /**
   * Updates the business profile with new subscription status
   */
  private async updateBusinessSubscriptionStatus(businessId: string, tier: PlanTier): Promise<void> {
    try {
      const businessRef = doc(db, 'businesses', businessId);
      
      await runTransaction(db, async (transaction) => {
        const businessDoc = await transaction.get(businessRef);
        
        if (!businessDoc.exists()) {
          throw new Error('Business document does not exist');
        }
        
        // Map the plan tier to the subscription tier in the business profile
        const tierMapping: Record<PlanTier, string> = {
          starter: 'free',
          growth: 'basic',
          professional: 'premium'
        };
        
        transaction.update(businessRef, {
          subscriptionTier: tierMapping[tier] || 'free',
          subscriptionStatus: 'active',
          subscriptionExpiry: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year from now
          updatedAt: serverTimestamp()
        });
      });
    } catch (error) {
      console.error('Error updating business subscription status:', error);
      throw error;
    }
  }
  
  /**
   * Creates a billing history record
   */
  private async createBillingRecord(
    businessId: string,
    userId: string,
    planId: string,
    planDetails: {
      name: string;
      price: number;
      currency: string;
    },
    subscriptionId: string
  ): Promise<void> {
    try {
      const historyRef = collection(db, 'billing_history');
      
      await addDoc(historyRef, {
        businessId,
        userId,
        planId,
        planName: planDetails.name,
        amount: planDetails.price,
        currency: planDetails.currency,
        status: 'paid',
        paymentMethod: 'card',
        paymentDate: Timestamp.now(),
        subscriptionId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating billing record:', error);
      throw error;
    }
  }
  
  /**
   * Cancels a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
      
      await updateDoc(subscriptionRef, {
        status: 'canceled',
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default new SubscriptionService();