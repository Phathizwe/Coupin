import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { CouponTypeOption } from '../components/EmotionalCouponTypeSelector';

/**
 * Fetches coupon types from Firestore
 * @returns Array of coupon type options
 */
export const getCouponTypesFromFirestore = async (): Promise<CouponTypeOption[]> => {
  try {
    const couponTypesRef = collection(db, 'couponTypes');
    const couponTypesSnapshot = await getDocs(couponTypesRef);
    
    if (couponTypesSnapshot.empty) {
      console.log('No coupon types found in Firestore, using fallback data');
      return getFallbackCouponTypes();
    }
    
    return couponTypesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        icon: data.icon,
        color: data.color,
        textColor: data.textColor,
        borderColor: data.borderColor
      } as CouponTypeOption;
    });
  } catch (error) {
    console.error('Error fetching coupon types:', error);
    // Return fallback data in case of error
    return getFallbackCouponTypes();
  }
};

/**
 * Provides fallback coupon types in case Firestore data is unavailable
 * @returns Array of default coupon type options
 */
const getFallbackCouponTypes = (): CouponTypeOption[] => {
  return [
    {
      id: 'return',
      title: 'Bring Them Back',
      description: '10% OFF their next visit',
      icon: '🔄',
      color: 'bg-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300'
    },
    {
      id: 'share',
      title: 'Share the Love',
      description: 'FREE APPETIZER with purchase',
      icon: '💝',
      color: 'bg-rose-100',
      textColor: 'text-rose-800',
      borderColor: 'border-rose-300'
    },
    {
      id: 'double',
      title: 'Double the Joy',
      description: 'BUY 1 GET 1 on select items',
      icon: '✌️',
      color: 'bg-emerald-100',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300'
    },
    {
      id: 'custom',
      title: 'Your Special Touch',
      description: 'Create a custom offer',
      icon: '✨',
      color: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300'
    }
  ];
};