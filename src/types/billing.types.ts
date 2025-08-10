import { Timestamp } from 'firebase/firestore';

export interface PlanCurrencyPrice {
  currencyCode: string;
  price: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'month' | 'year';
  popularPlan?: boolean;
  ctaText?: string;
  valueProposition?: string;
  active?: boolean;
  displayOrder?: number; // Added for controlling the order of plans
  features: {
    id: string;
    name: string;
    included: boolean;
    highlight?: boolean;
    tooltip?: string;
  }[];
  currencyPrices?: PlanCurrencyPrice[]; // For multi-currency support
}

export interface UserSubscription {
  id: string;
  userId: string;
  businessId: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due';
  startDate: Timestamp;
  endDate: Timestamp;
  renewalDate: Timestamp;
  trialEndDate?: Timestamp;
  paymentMethod?: string;
  paymentId?: string;
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

export interface BillingHistory {
  id: string;
  businessId: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  paymentDate: Timestamp;
  subscriptionId: string;
  receiptUrl?: string;
  createdAt: Timestamp;
}

export interface UsageMetrics {
  customers: {
    used: number;
    limit: number;
  };
  coupons: {
    used: number;
    limit: number;
  };
  communications: {
    used: number;
    limit: number;
  };
}

export type PlanTier = 'starter' | 'growth' | 'professional';