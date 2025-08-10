import { ReactNode } from 'react';

// Define the coupon data interface
export interface CouponData {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  validUntil: string;
  usageCount: number;
  maxUses: number;
  active: boolean;
  type: 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem';
}

// Define the action type and the mapping to CelebrationType
export type CouponActionType = 'copy' | 'view' | 'success';
export type CelebrationType = 'confetti' | 'sparkle' | 'bounce' | 'pulse' | 'none';

// Define the filter option interface
export interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

// Define the stats interface
export interface CouponStatistic {
  label: string;
  value: number;
  icon: string;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

// Define time of day type
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';