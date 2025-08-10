import { useState, useEffect, useCallback } from 'react';
import { getCoupons2 } from '../services/coupons2Service';

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

export interface UseOptimizedCouponsOptions {
  businessId: string;
  status?: string;
  active?: boolean;  // Added the missing active property
  maxResults?: number;
  autoLoad?: boolean;
}

export const useOptimizedCoupons = ({
  businessId,
  status,
  active,
  maxResults = 20,
  autoLoad = true
}: UseOptimizedCouponsOptions) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchCoupons = useCallback(async (reset = false) => {
    if (!businessId) {
      console.error('[useOptimizedCoupons] No business ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useOptimizedCoupons] Fetching coupons for business:', businessId);

      // Convert status to the correct type
      let statusFilter: 'active' | 'expired' | 'scheduled' | undefined;
      
      // If active parameter is provided, it overrides the status parameter
      if (active !== undefined) {
        statusFilter = active ? 'active' : 'expired';
      } else if (status === 'active' || status === 'expired' || status === 'scheduled') {
        statusFilter = status;
      }

      const result = await getCoupons2(
        businessId,
        statusFilter,
        maxResults,
        reset ? undefined : lastDoc
      );

      // CRITICAL FIX: Handle null result properly
      if (!result) {
        console.error('[useOptimizedCoupons] Received null result from getCoupons2');
        setError(new Error('Failed to fetch coupons: null result'));
        setCoupons([]);
        setHasMore(false);
        setLastDoc(null);
        return;
      }

      // CRITICAL FIX: Handle null coupons array properly
      if (!result.coupons) {
        console.error('[useOptimizedCoupons] Received null coupons array from getCoupons2');
        setError(new Error('Failed to fetch coupons: null coupons array'));
        setCoupons([]);
        setHasMore(false);
        setLastDoc(null);
        return;
      }

      console.log('[useOptimizedCoupons] Successfully fetched', result.coupons.length, 'coupons');
      console.log('[useOptimizedCoupons] Coupon titles:', result.coupons.map(c => c.title));

      if (reset) {
        setCoupons(result.coupons);
      } else {
        setCoupons(prev => [...prev, ...result.coupons]);
      }

      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      console.error('[useOptimizedCoupons] Error fetching coupons:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setCoupons([]);
      setHasMore(false);
      setLastDoc(null);
    } finally {
      setLoading(false);
    }
  }, [businessId, status, active, maxResults, lastDoc]);

  const refresh = useCallback(() => {
    console.log('[useOptimizedCoupons] Refreshing coupons...');
    setLastDoc(null);
    fetchCoupons(true);
  }, [fetchCoupons]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCoupons(false);
    }
  }, [fetchCoupons, loading, hasMore]);

  useEffect(() => {
    if (autoLoad && businessId) {
      console.log('[useOptimizedCoupons] Auto-loading coupons for business:', businessId);
      refresh();
    }
  }, [autoLoad, businessId, refresh]);

  return {
    coupons,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};