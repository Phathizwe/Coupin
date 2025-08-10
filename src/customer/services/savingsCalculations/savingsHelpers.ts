import { findCustomerByUserId } from '../../../services/customerLinkingService';

/**
 * Gets the IDs to search for (user ID and possibly customer ID)
 * @param userId User ID to get linked customer for
 * @returns Array of IDs to search
 */
export const getSearchIds = async (userId: string): Promise<string[]> => {
  // Get the customer ID if available
  const linkedCustomer = await findCustomerByUserId(userId);
  const customerId = linkedCustomer?.id;
  
  // IDs to search for
  const idsToSearch = [userId];
  if (customerId) {
    idsToSearch.push(customerId);
  }
  
  return idsToSearch;
};

/**
 * Estimates the value of a coupon based on its type and value
 * @param couponData Coupon document data
 * @returns Estimated value of the coupon
 */
export const estimateCouponValue = (couponData: any): number => {
  // For fixed amount discounts, use the value directly
  if (couponData.type === 'fixed' && couponData.value) {
    return Number(couponData.value) || 0;
  }
  // For percentage discounts, use an estimated average purchase value of R100
  else if (couponData.type === 'percentage' && couponData.value) {
    const estimatedPurchase = 100; // R100 as average purchase value
    const discountPercent = Number(couponData.value) || 0;
    return (estimatedPurchase * discountPercent) / 100;
  }
  // For other types, use a fixed estimated value of R30
  else {
    return 30; // R30 as default estimated savings
  }
};