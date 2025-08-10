import { db } from '../config/firebase';
import { forceRefreshPricingPlans } from '../utils/setupPricingPlans';

console.log('Starting initialization of pricing plans...');

// Using forceRefreshPricingPlans to ensure we delete any existing plans and add new ones
forceRefreshPricingPlans()
  .then(() => {
    console.log('Pricing plans initialized successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error initializing pricing plans:', error);
    process.exit(1);
  });