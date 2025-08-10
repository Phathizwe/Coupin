import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { CouponData } from '../components/EnhancedCouponCard';

// Helper function to validate coupon type
const validateCouponType = (type: string): 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem' => {
  const validTypes = ['percentage', 'fixed', 'buyXgetY', 'freeItem'];
  return validTypes.includes(type) ? type as 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem' : 'percentage';
};

export const fetchCouponsForBusiness = async (businessId: string): Promise<CouponData[]> => {
  if (!businessId) {
    console.log('No business ID provided');
    return [];
  }
  
  try {
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('businessId', '==', businessId));
    const couponsSnapshot = await getDocs(q);
    
    if (couponsSnapshot.empty) {
      console.log('No coupons found for this business');
      return [];
    }
    
    const couponsList = couponsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Coupon',
        description: data.description || '',
        code: data.code || 'NOCODE',
        discount: data.discount || '',
        validUntil: data.validUntil ? new Date(data.validUntil.toDate()).toLocaleDateString() : 'No expiration',
        usageCount: data.usageCount || 0,
        maxUses: data.maxUses || 0,
        active: data.active !== undefined ? data.active : true,
        type: validateCouponType(data.type || 'percentage')
      } as CouponData;
    });
    
    return couponsList;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};