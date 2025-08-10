import { collection, addDoc, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PricingPlan } from '../types/billing.types';

// Define default pricing plans with currency-specific pricing
const defaultPricingPlans: Omit<PricingPlan, 'id'>[] = [
  {
    name: 'Starter',
    description: 'For small businesses just getting started',
    price: 0,
    currency: 'USD',
    billingCycle: 'month',
    popularPlan: false,
    ctaText: 'Start Free',
    active: true, // This is now valid with our updated type
    currencyPrices: [
      { currencyCode: 'USD', price: 0 },
      { currencyCode: 'ZAR', price: 0 },
      { currencyCode: 'EUR', price: 0 },
      { currencyCode: 'GBP', price: 0 }
    ],
    features: [
      { id: 'free-1', name: '100 customers', included: true },
      { id: 'free-2', name: '5 coupons', included: true },
      { id: 'free-3', name: 'Basic analytics', included: true },
      { id: 'free-4', name: 'Email support', included: true },
      { id: 'free-5', name: 'Custom branding', included: false },
      { id: 'free-6', name: 'Advanced analytics', included: false },
      { id: 'free-7', name: 'Priority support', included: false },
    ]
  },
  {
    name: 'Growth',
    description: 'For growing businesses with more customers',
    price: 29,
    currency: 'USD',
    billingCycle: 'month',
    popularPlan: true,
    ctaText: 'Go Pro',
    active: true, // This is now valid with our updated type
    currencyPrices: [
      { currencyCode: 'USD', price: 29 },
      { currencyCode: 'ZAR', price: 199.99 },
      { currencyCode: 'EUR', price: 27 },
      { currencyCode: 'GBP', price: 23 }
    ],
    features: [
      { id: 'pro-1', name: 'Up to 500 customers', included: true, highlight: true },
      { id: 'pro-2', name: 'Up to 50 coupons', included: true, highlight: true },
      { id: 'pro-3', name: 'Advanced analytics', included: true },
      { id: 'pro-4', name: 'Custom branding', included: true },
      { id: 'pro-5', name: 'Email & phone support', included: true },
      { id: 'pro-6', name: 'API access', included: false },
      { id: 'pro-7', name: 'White-label option', included: false },
    ]
  },
  {
    name: 'Professional',
    description: 'For established businesses with custom needs',
    price: 99,
    currency: 'USD',
    billingCycle: 'month',
    popularPlan: false,
    ctaText: 'Contact Sales',
    active: true, // This is now valid with our updated type
    currencyPrices: [
      { currencyCode: 'USD', price: 99 },
      { currencyCode: 'ZAR', price: 399.99 },
      { currencyCode: 'EUR', price: 89 },
      { currencyCode: 'GBP', price: 79 }
    ],
    features: [
      { id: 'ent-1', name: 'Unlimited customers', included: true, highlight: true },
      { id: 'ent-2', name: 'Unlimited coupons', included: true, highlight: true },
      { id: 'ent-3', name: 'Advanced analytics', included: true },
      { id: 'ent-4', name: 'Custom branding', included: true },
      { id: 'ent-5', name: 'Priority support 24/7', included: true },
      { id: 'ent-6', name: 'API access', included: true },
      { id: 'ent-7', name: 'White-label option', included: true },
      { id: 'ent-8', name: 'Dedicated account manager', included: true },
    ]
  }
];

// Initialize default pricing plans in Firestore
export const initializePricingPlans = async (): Promise<void> => {
  try {
    // FIXED: Use the correct collection name with underscore
    const plansRef = collection(db, 'pricing_plans');
    const querySnapshot = await getDocs(plansRef);
    
    // Only add default plans if none exist
    if (querySnapshot.empty) {
      console.log('No pricing plans found. Adding default plans...');
      
      const batch = writeBatch(db);
      
      for (const plan of defaultPricingPlans) {
        // FIXED: Use the correct collection name with underscore
        const planRef = doc(collection(db, 'pricing_plans'));
        batch.set(planRef, {
          ...plan,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await batch.commit();
      console.log('Default pricing plans added successfully');
    } else {
      console.log('Pricing plans already exist. Skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing pricing plans:', error);
    throw error;
  }
};

// Force refresh pricing plans (delete existing and add default ones)
export const forceRefreshPricingPlans = async (): Promise<void> => {
  try {
    // FIXED: Use the correct collection name with underscore
    const plansRef = collection(db, 'pricing_plans');
    const querySnapshot = await getDocs(plansRef);
    
    // Delete all existing plans
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Existing pricing plans deleted');
    
    // Add default plans
    await initializePricingPlans();
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error refreshing pricing plans:', error);
    throw error;
  }
};