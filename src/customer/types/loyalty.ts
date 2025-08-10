/**
 * Represents a loyalty program with business details for customer view
 */
export interface CustomerLoyaltyProgram {
  id: string;
  businessId: string;
  name: string;
  description: string;
  type: 'points' | 'visits' | 'tiered';
  pointsPerAmount?: number;
  amountPerPoint?: number;
  visitsRequired?: number;
  tiers?: LoyaltyTier[];
  active: boolean;
  createdAt: any;
  updatedAt: any;
  
  // Business details
  businessName?: string;
  businessLogo?: string;
  businessColors?: {
    primary: string;
    secondary: string;
  };
  
  // Customer-specific data
  customerPoints?: number;
  customerVisits?: number;
  customerTier?: string;
}

/**
 * Represents a loyalty tier in a tiered program
 */
export interface LoyaltyTier {
  id: string;
  name: string;
  threshold: number;
  multiplier: number;
  benefits: string[];
}

/**
 * Represents a loyalty reward that customers can redeem
 */
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost?: number;
  visitsCost?: number;
  tierRequired?: string;
  type: 'discount' | 'freeItem' | 'custom';
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  freeItem?: string;
  customDescription?: string;
  active: boolean;
}

/**
 * Filters for loyalty programs list
 */
export interface LoyaltyFilters {
  sortBy: 'name' | 'points' | 'visits';
  sortDirection: 'asc' | 'desc';
  businessId?: string;
  status?: 'all' | 'active';
}