import { Customer } from '../types';

export interface CustomerWithCouponStats extends Customer {
  couponStats?: {
    totalAllocated: number;
    totalUsed: number;
    unusedCoupons: number;
  };
}