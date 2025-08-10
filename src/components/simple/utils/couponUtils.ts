import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { CouponActionType, CelebrationType, TimeOfDay, CouponData } from '../types/TYCATypes';
import { BRAND_MESSAGES } from '../../../constants/brandConstants';

// Function to map action types to celebration types
export const mapActionToCelebrationType = (
  actionType: CouponActionType
): CelebrationType => {
  switch (actionType) {
    case 'copy':
      return 'confetti';
    case 'view':
      return 'pulse';
    case 'success':
      return 'sparkle';
    default:
      return 'none';
  }
};

// Get greeting based on time of day using TYCA brand messaging
export const getGreeting = (timeOfDay: TimeOfDay) => {
  switch (timeOfDay) {
    case 'morning': return BRAND_MESSAGES.dashboard.morning;
    case 'afternoon': return BRAND_MESSAGES.dashboard.afternoon;
    case 'evening': return BRAND_MESSAGES.dashboard.evening;
    default: return BRAND_MESSAGES.dashboard.standard;
  }
};

// Get celebration message based on action type using TYCA brand messaging
export const getCelebrationMessage = (celebrationAction: CouponActionType) => {
  switch (celebrationAction) {
    case 'copy': return BRAND_MESSAGES.success.couponCreated;
    case 'view': return BRAND_MESSAGES.welcome.standard;
    case 'success': return BRAND_MESSAGES.success.standard;
    default: return BRAND_MESSAGES.success.standard;
  }
};

/**
 * Get the count of customers a coupon was distributed to
 * @param couponId Coupon ID
 * @returns Promise that resolves to the count of customers
 */
export const getCouponDistributionCount = async (couponId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'couponDistributions'),
      where('couponId', '==', couponId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting coupon distribution count:', error);
    return 0;
  }
};

/**
 * Get the customers a coupon was distributed to
 * @param couponId Coupon ID
 * @returns Promise that resolves to an array of customer IDs
 */
export const getCouponRecipients = async (couponId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'couponDistributions'),
      where('couponId', '==', couponId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().customerId);
  } catch (error) {
    console.error('Error getting coupon recipients:', error);
    return [];
  }
};

// Filter coupons based on active filter and search query
export const filterCoupons = (
  coupons: CouponData[], 
  activeFilter: string, 
  searchQuery: string
): CouponData[] => {
  let result = [...coupons];

  // Apply filter
  if (activeFilter !== 'all') {
    if (activeFilter === 'active') {
      result = result.filter(coupon => coupon.active);
    } else if (activeFilter === 'inactive') {
      result = result.filter(coupon => !coupon.active);
    } else if (activeFilter === 'expiring') {
      // This would normally check dates, but for demo we'll just show a subset
      result = result.filter(coupon =>
        coupon.active && coupon.validUntil.includes('Nov')
      );
    }
  }

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(coupon =>
      coupon.title.toLowerCase().includes(query) ||
      coupon.description.toLowerCase().includes(query) ||
      coupon.code.toLowerCase().includes(query)
    );
  }

  return result;
};

// Get current time of day
export const getCurrentTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};