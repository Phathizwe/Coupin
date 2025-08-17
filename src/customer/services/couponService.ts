import { 
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { Coupon } from '../types/coupon.enhanced';
import { findCustomerByUserId } from '../../services/customerLinkingService';
import { fetchCouponIds } from './couponFetchService';
import { fetchCouponDetails } from './couponDetailsService.enhanced';

export enum CouponAnalyticsEvent {
  VIEW = 'view',
  COPY = 'copy',
  REDEEM = 'redeem'
}

interface CouponResult {
  coupons: Coupon[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

/**
 * Fetch coupons for the current customer
 * @param userId User ID to fetch coupons for
 * @param lastDoc Last document for pagination
 * @param pageSize Number of items per page
 * @returns Object containing coupons and pagination info
 */
export const fetchCustomerCoupons = async (
  userId: string, 
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null, 
  pageSize = 10
): Promise<CouponResult> => {
  try {
    // Validate the user ID to prevent unnecessary lookups
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to fetchCustomerCoupons');
      return { coupons: [], lastDoc: null };
    }
    
    console.log('Fetching coupons for user:', userId);
    
    // First, check if the user is linked to a customer profile
    const linkedCustomer = await findCustomerByUserId(userId);
    const customerId = linkedCustomer?.id;
    
    console.log('Linked customer ID:', customerId || 'Not linked');
    
    // If we have both IDs, we'll search using both
    const idsToSearch = [userId];
    if (customerId) {
      idsToSearch.push(customerId);
    }
    
    // Get all coupon IDs from distributions and customer coupons
    const couponIds = await fetchCouponIds(idsToSearch, pageSize);
    
    if (couponIds.length === 0) {
      console.log('No coupons found for user:', userId);
      return { coupons: [], lastDoc: null };
    }
    
    // Fetch the actual coupon details with business colors
    const customerCoupons = await fetchCouponDetails(couponIds);
    
    console.log('Returning', customerCoupons.length, 'coupons');
    return {
      coupons: customerCoupons,
      lastDoc: null // We're not using pagination in this implementation
    };
  } catch (error) {
    console.error('Error fetching customer coupons:', error);
    // Return empty result instead of throwing to prevent cascading failures
    return { coupons: [], lastDoc: null };
  }
};

/**
 * Copy coupon code to clipboard
 * @param code Coupon code to copy
 * @returns Promise resolving to success status
 */
export const copyCouponCode = (code: string): Promise<boolean> => {
  try {
    navigator.clipboard.writeText(code);
    return Promise.resolve(true);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return Promise.resolve(false);
  }
};

/**
 * Track coupon events (view, copy, redeem)
 * @param couponId Coupon ID
 * @param userId User ID
 * @param eventType Type of event
 */
export const trackCouponEvent = async (
  couponId: string, 
  userId: string, 
  eventType: CouponAnalyticsEvent
): Promise<void> => {
  // Implementation for tracking coupon events
  console.log(`Tracking event ${eventType} for coupon ${couponId} by user ${userId}`);
  // In a real implementation, this would save analytics data to Firestore
};

/**
 * Redeem a coupon
 * @param distributionId Distribution ID to redeem
 * @returns Promise resolving to success status
 */
export const redeemCoupon = async (distributionId: string): Promise<boolean> => {
  // Implementation for redeeming a coupon
  console.log(`Redeeming coupon with distribution ID: ${distributionId}`);
  // In a real implementation, this would update the coupon status in Firestore
  return Promise.resolve(true); // Placeholder
};