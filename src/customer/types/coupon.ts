export interface Coupon {
  id: string;
  businessId: string;
  distributionId?: string; // Added for redemption tracking
  businessName?: string;
  businessLogo?: string;
  businessColors?: {
    primary: string;
    secondary: string;
  };
  title: string;
  description: string;
  discount: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  code: string;
  terms?: string;
  category?: string;
  redemptionCount?: number;
  maxRedemptions?: number;
  createdAt?: Date;
  value?: number; // For percentage or amount
  status?: 'sent' | 'viewed' | 'redeemed'; // Added for status tracking
  redeemedAt?: Date; // Added for redemption timestamp
  usageCount?: number; // Added for analytics
}

export interface CouponDistribution {
  id: string;
  couponId: string;
  businessId: string;
  customerId: string;
  status: 'sent' | 'viewed' | 'redeemed';
  sentAt: Date;
  redeemedAt?: Date;
}

export interface CouponFilters {
  sortBy: 'endDate' | 'startDate' | 'businessName' | 'value';
  sortDirection: 'asc' | 'desc';
  businessId?: string;
  status?: 'active' | 'expired' | 'redeemed' | 'all';
}

export interface CouponAnalytics {
  couponId: string;
  userId: string;
  eventType: string;
  timestamp: Date;
}