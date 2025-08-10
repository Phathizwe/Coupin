import { Coupon } from '../../types';

// Get coupon status label
export const getCouponStatusLabel = (coupon: Coupon): string => {
  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  
  if (!coupon.active) return 'Inactive';
  if (startDate > now) return 'Scheduled';
  if (endDate < now) return 'Expired';
  return 'Active';
};

// Get coupon status color
export const getCouponStatusColor = (status: string): string => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Inactive': return 'bg-gray-100 text-gray-800';
    case 'Scheduled': return 'bg-blue-100 text-blue-800';
    case 'Expired': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Filter coupons based on search term and filter status
export const filterCoupons = (
  coupons: Coupon[], 
  searchTerm: string, 
  filterStatus: 'all' | 'active' | 'expired' | 'scheduled'
): Coupon[] => {
  return coupons.filter(coupon => {
    // Make sure all required fields exist before filtering
    if (!coupon.title || !coupon.code || !coupon.description) {
      console.warn('Coupon missing required fields:', coupon);
      return false;
    }
    
    const matchesSearch = 
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    if (filterStatus === 'active') {
      return matchesSearch && 
        coupon.active && 
        startDate <= now && 
        endDate >= now;
    }
    
    if (filterStatus === 'expired') {
      return matchesSearch && endDate < now;
    }
    
    if (filterStatus === 'scheduled') {
      return matchesSearch && startDate > now;
    }
    
    return matchesSearch;
  });
};