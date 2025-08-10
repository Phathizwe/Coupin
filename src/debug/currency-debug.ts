/**
 * This file contains debugging utilities to help diagnose issues with currency display
 * in the pricing page.
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PricingPlan } from '../types/billing.types';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

/**
 * Debug utility for checking currency configurations
 */
export async function debugCurrencySetup() {
  console.log('🔍 Starting currency debug...');

  // Check pricing plans and their currency prices
  console.log('\n📋 Checking pricing plans:');
  try {
    const plansRef = collection(db, 'pricing_plans');
    const snapshot = await getDocs(plansRef);

    if (snapshot.empty) {
      console.log('❌ No pricing plans found!');
    } else {
      console.log(`✅ Found ${snapshot.docs.length} pricing plans`);

      snapshot.docs.forEach(doc => {
        const plan = { id: doc.id, ...doc.data() } as PricingPlan;
        console.log('Plan:', plan.name);
        console.log('Base price:', plan.price, plan.currency);

        if (plan.currencyPrices && Array.isArray(plan.currencyPrices)) {
          console.log('Currency-specific prices:');
          plan.currencyPrices.forEach((cp: any) => {
            console.log(`- ${cp.currencyCode}: ${cp.price}`);
          });
        } else {
          console.log('❌ No currency-specific prices found for this plan');
        }
        console.log('---');
      });
    }
  } catch (error) {
    console.error('❌ Error checking pricing plans:', error);
  }

  // Check currencies collection
  console.log('\n💱 Checking currencies collection:');
  try {
    const currenciesRef = collection(db, 'currencies');
    const snapshot = await getDocs(currenciesRef);

    if (snapshot.empty) {
      console.log('❌ No currencies found!');
    } else {
      console.log(`✅ Found ${snapshot.docs.length} currencies`);

      snapshot.docs.forEach(doc => {
        const currency = { code: doc.id, ...doc.data() } as Currency;
        console.log('Currency:', currency.code, currency.name, currency.symbol);
        console.log('Active:', currency.isActive);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('❌ Error checking currencies:', error);
  }

  console.log('\n🏁 Currency debug complete');
}

// Auto-run the debug function if this file is executed directly
if (require.main === module) {
  debugCurrencySetup().catch(console.error);
}