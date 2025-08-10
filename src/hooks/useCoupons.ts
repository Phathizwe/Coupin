import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useUser } from './useUser';

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount: string;
  status: string;
  validFrom: string;
  validUntil: string;
  usage: {
    used: number;
    limit: number;
  };
  sent: number;
  description?: string;
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user?.businessId) {
        // If no businessId, return empty array
        setCoupons([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Helper function to get the correct businessId (same fix as in BusinessCoupons)
        const getCorrectBusinessId = (businessId: string): string => {
          // Handle the known businessId mismatch
          if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
            return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
          }
          return businessId;
        };

        const correctedBusinessId = getCorrectBusinessId(user.businessId);
        console.log('[useCoupons] Using corrected businessId:', correctedBusinessId);

        // Query the main coupons collection with businessId filter (same as getCoupons service)
        const couponsRef = collection(db, 'coupons');
        const q = query(couponsRef, where('businessId', '==', correctedBusinessId));
        const querySnapshot = await getDocs(q);

        const fetchedCoupons = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            code: data.code || '',
            discount: data.value?.toString() || data.discount || '0',
            status: data.active ? 'active' : 'inactive',
            validFrom: data.startDate?.toDate?.()?.toISOString() || data.validFrom || '',
            validUntil: data.endDate?.toDate?.()?.toISOString() || data.validUntil || '',
            usage: {
              used: data.usageCount || 0,
              limit: data.usageLimit || 1
            },
            sent: data.sent || 0,
            description: data.description || ''
          };
        }) as Coupon[];

        console.log('[useCoupons] Fetched coupons:', fetchedCoupons);
        setCoupons(fetchedCoupons);
        setError(null);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Failed to load coupons. Please try again later.');
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [user?.businessId]);

  return { coupons, loading, error };
};