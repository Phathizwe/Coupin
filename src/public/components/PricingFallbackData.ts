import { PricingPlan } from '../../types/billing.types';

// Fallback pricing plans in case Firestore fetch fails
export const fallbackPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for: New businesses testing digital coupons',
    price: 0,
    currency: 'USD',
    billingCycle: 'month',
    features: [
      { id: 'starter-1', name: 'Unlimited coupon creation & sending', included: true },
      { id: 'starter-2', name: 'Basic coupon templates', included: true },
      { id: 'starter-3', name: 'Customer management', included: true },
      { id: 'starter-4', name: 'Basic analytics', included: true },
      { id: 'starter-5', name: 'Email support', included: true },
      { id: 'starter-6', name: 'Advanced customization', included: false },
    ],
    popularPlan: false,
    valueProposition: 'Create and share unlimited coupons. Upgrade only when customers start redeeming!',
    ctaText: 'Start for free'
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Perfect for: Active businesses ready to drive sales',
    price: 11.99,
    currency: 'USD',
    billingCycle: 'month',
    features: [
      { id: 'growth-1', name: 'Everything in Starter', included: true },
      { id: 'growth-2', name: 'Unlimited coupon redemption', included: true },
      { id: 'growth-3', name: 'Advanced coupon templates', included: true },
      { id: 'growth-4', name: 'Customer segmentation', included: true },
      { id: 'growth-5', name: 'Detailed analytics', included: true },
      { id: 'growth-6', name: 'Priority support', included: true },
    ],
    popularPlan: true,
    valueProposition: 'Start converting customers into sales. Pay only when you\'re ready to redeem!',
    ctaText: 'Start 14-day free trial'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Perfect for: Established businesses with regular customers',
    price: 22.99,
    currency: 'USD',
    billingCycle: 'month',
    features: [
      { id: 'pro-1', name: 'Everything in Growth', included: true },
      { id: 'pro-2', name: 'Advanced loyalty programs (tiers, rewards)', included: true },
      { id: 'pro-3', name: 'White-label experience', included: true },
      { id: 'pro-4', name: 'API access', included: true },
      { id: 'pro-5', name: 'Custom integrations', included: true },
      { id: 'pro-6', name: 'Dedicated account manager', included: true },
    ],
    popularPlan: false,
    valueProposition: 'Automate customer retention and scale your marketing efforts.',
    ctaText: 'Start free trial'
  }
];