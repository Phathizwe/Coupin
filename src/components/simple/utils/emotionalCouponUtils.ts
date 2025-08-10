import { CouponActionType, CelebrationType, TimeOfDay, CouponData } from '../types/EmotionalViewCouponsTypes';

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

// Get greeting based on time of day
export const getGreeting = (timeOfDay: TimeOfDay) => {
  switch (timeOfDay) {
    case 'morning': return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening': return 'Good evening';
    default: return 'Welcome back';
  }
};

// Get celebration message based on action type
export const getCelebrationMessage = (celebrationAction: CouponActionType) => {
  switch (celebrationAction) {
    case 'copy': return 'Copied to clipboard!';
    case 'view': return 'Viewing details';
    case 'success': return 'Success!';
    default: return 'Success!';
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
    result = result.filter(coupon =>
      activeFilter === 'active' ? coupon.active : !coupon.active
    );
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