import { useMemo } from 'react';
import { Business } from '../types/store';

export const useStoreFiltering = (
  stores: Business[],
  searchQuery: string,
  showOnlyWithCoupons: boolean
) => {
  // Filter stores based on search query and coupon availability
  const filteredStores = useMemo(() => {
    console.log('Filtering stores:', { stores, searchQuery, showOnlyWithCoupons });
    
    if (!stores || stores.length === 0) {
      console.log('No stores to filter');
      return [];
    }
    
    return stores.filter(store => {
      // Filter by coupon availability if the toggle is on
      if (showOnlyWithCoupons && (!store.couponCount || store.couponCount === 0)) {
        console.log(`Store ${store.businessName} filtered out - no coupons`);
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim() === '') {
        return true;
      }
      
      const query = searchQuery.toLowerCase();
      const matches = (
        store.businessName?.toLowerCase().includes(query) ||
        store.industry?.toLowerCase().includes(query) ||
        store.description?.toLowerCase().includes(query) ||
        store.address?.toLowerCase().includes(query)
      );
      
      if (!matches) {
        console.log(`Store ${store.businessName} filtered out - doesn't match search`);
      }
      
      return matches;
    });
  }, [stores, searchQuery, showOnlyWithCoupons]);

  console.log('Filtered stores result:', filteredStores);
  return filteredStores;
};

export default useStoreFiltering;