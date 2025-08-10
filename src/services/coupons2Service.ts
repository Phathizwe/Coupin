import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentSnapshot } from 'firebase/firestore';

// Define Coupon interface locally to avoid import issues
interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  active: boolean;
  businessId: string;
  createdAt: any;
  [key: string]: any;
}

export interface CouponQueryResult {
  coupons: Coupon[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

// CACHE COMPLETELY DISABLED - Always fetch fresh data
console.log('[coupons2Service] Cache completely disabled - fetching fresh data only');

export const getCoupons2 = async (
  businessId: string,
  status?: 'active' | 'expired' | 'scheduled',
  maxResults: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<CouponQueryResult> => {
  console.log('[coupons2Service] Fetching fresh coupons for business:', businessId, 'status:', status);

  if (!businessId) {
    console.error('[coupons2Service] No business ID provided');
    return { coupons: [], lastDoc: null, hasMore: false };
  }

  try {
    // Build base query
    const couponsRef = collection(db, 'coupons');
    let q = query(
      couponsRef,
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    // Add status filter if provided
    if (status === 'active') {
      q = query(
        couponsRef,
        where('businessId', '==', businessId),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
    } else if (status === 'expired') {
      q = query(
        couponsRef,
        where('businessId', '==', businessId),
        where('active', '==', false),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
    }

    // Add pagination if lastDoc is provided
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    console.log('[coupons2Service] Executing Firestore query...');
    const querySnapshot = await getDocs(q);

    const coupons: Coupon[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      coupons.push({
        id: doc.id,
        ...data,
      } as Coupon);
    });

    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const hasMore = querySnapshot.docs.length === maxResults;

    console.log('[coupons2Service] Successfully fetched', coupons.length, 'coupons');
    console.log('[coupons2Service] Coupon titles:', coupons.map(c => c.title));

    return {
      coupons,
      lastDoc: newLastDoc,
      hasMore,
    };
  } catch (error) {
    console.error('[coupons2Service] Error fetching coupons:', error);
    throw error;
  }
};

export const clearCouponsCache = async (): Promise<void> => {
  console.log('[coupons2Service] Cache clearing requested - but cache is already disabled');

  // Clear browser storage just in case
  if (typeof window !== 'undefined') {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('coupon') || key.includes('cache_')) {
        localStorage.removeItem(key);
        console.log('[coupons2Service] Removed localStorage key:', key);
      }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('coupon') || key.includes('cache_')) {
        sessionStorage.removeItem(key);
        console.log('[coupons2Service] Removed sessionStorage key:', key);
      }
    });
  }
};

// Export default getCoupons2 for backward compatibility
export default getCoupons2;