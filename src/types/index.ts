export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'business' | 'customer';
  createdAt: any;
  updatedAt: any;
  businessId?: string; // For customers linked to a business
  businessProfile?: BusinessProfile;
}

export interface BusinessProfile {
  businessId: string; // Added businessId property
  businessName: string;
  description?: string; // Added description property
  email?: string; // Added email property
  industry: string;
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  regionalSettings?: {
    currency: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
    language: string;
  };
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  subscriptionExpiry?: any;
}

export interface Customer {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthdate?: any;
  joinDate: any;
  lastVisit?: any;
  totalSpent?: number;
  totalVisits?: number;
  notes?: string;
  tags?: string[];
  loyaltyPoints?: number;
  loyaltyProgramId?: string; // Added for loyalty program membership
  lastLoyaltyActivity?: any; // Added for tracking loyalty activity
  userId?: string; // If the customer has a Coupin account
}

export interface Coupon {
  id: string;
  businessId: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem';
  value: number; // Percentage or fixed amount
  buyQuantity?: number; // For buyXgetY
  getQuantity?: number; // For buyXgetY
  freeItem?: string; // For freeItem
  minPurchase?: number;
  maxDiscount?: number;
  startDate: any;
  endDate: any;
  usageLimit?: number;
  usageCount: number;
  distributionCount?: number; // Number of coupons sent/distributed
  customerLimit?: number; // Max uses per customer
  firstTimeOnly: boolean;
  birthdayOnly: boolean;
  active: boolean;
  code: string;
  termsAndConditions?: string;
  branding?: {
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface LoyaltyProgram {
  id: string;
  businessId: string;
  name: string;
  description: string;
  type: 'points' | 'visits' | 'tiered';
  pointsPerAmount?: number; // e.g., 1 point per R10
  amountPerPoint?: number; // e.g., R1 per point when redeeming
  visitsRequired?: number; // e.g., 10 visits for a reward
  tiers?: LoyaltyTier[];
  rewards: LoyaltyReward[];
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface LoyaltyTier {
  id: string;
  name: string; // e.g., Silver, Gold, Platinum
  threshold: number; // Points or visits required
  multiplier: number; // e.g., 1.2x points for Gold
  benefits: string[];
}

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

export interface LoyaltyAchievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
  businessId: string;
  programId: string;
  completedAt?: Date;
  createdAt?: any;
  updatedAt?: any;
}

export interface CommunicationTemplate {
  id: string;
  businessId: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  subject?: string; // For email
  content: string;
  variables: string[];
  createdAt: any;
  updatedAt: any;
}

export interface CommunicationCampaign {
  id: string;
  businessId: string;
  name: string;
  templateId: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  targetAudience: 'all' | 'segment' | 'specific';
  segmentRules?: any;
  specificCustomers?: string[];
  coupons?: string[];
  scheduledFor?: any;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    redeemed: number;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Subscription {
  id: string;
  userId: string;
  businessId: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  startDate: any;
  endDate: any;
  renewalDate: any;
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
  createdAt: any;
  updatedAt: any;
}