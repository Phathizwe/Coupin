import { db } from '@/config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { PricingPlan } from '@/types/billing.types';
class PricingPlansService {
  /**
   * Get all pricing plans with prices in the specified currency
   * If a plan doesn't have pricing in the requested currency, uses the base currency (ZAR by default)
   */
  async getPricingPlans(currency: string = 'ZAR'): Promise<PricingPlan[]> {
    try {
      const plansRef = collection(db, 'pricing_plans');
      const plansQuery = query(plansRef, orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(plansQuery);
      
      if (snapshot.empty) {
        console.log('No pricing plans found in Firestore');
        return [];
      }
      
      // Extract plans from Firestore
      const pricingPlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingPlan[];
      
      // Apply appropriate pricing for the requested currency
      return pricingPlans.map(plan => {
        // If the requested currency matches the plan's base currency, return as is
        if (plan.currency === currency) {
          return plan;
        }
        
        // Check if the plan has a price for the requested currency
        const currencyPrice = plan.currencyPrices?.find(cp => 
          cp.currencyCode === currency
      );
      
        if (currencyPrice) {
          // Return plan with the price in the requested currency
          return {
            ...plan,
            price: currencyPrice.price,
            currency: currency
          };
    }
        
        // If no matching currency price, keep the original price and currency
        // This means we're not converting prices on the fly, just using what's in Firestore
        return plan;
      });
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
  }
}
}

export const pricingPlansService = new PricingPlansService();