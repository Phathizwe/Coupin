import React, { useState, useEffect } from 'react';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Business } from './types/store';
import { fetchInitialStores, fetchMoreStores } from './services/storeService';
import useStoreFiltering from './hooks/useStoreFiltering';
// Components
import StoreSearchFilter from './components/StoreSearchFilter';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyStoreState from './components/EmptyStoreState';
import StoreList from './components/StoreList';

const StoresPage: React.FC = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithCoupons, setShowOnlyWithCoupons] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  // Use our custom hook for filtering stores
  const filteredStores = useStoreFiltering(stores, searchQuery, showOnlyWithCoupons);

  // Initial load of stores
  useEffect(() => {
    const loadStores = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch stores from the service
          const result = await fetchInitialStores(user.uid);
        
        if (result.stores.length > 0) {
          setStores(result.stores);
          setLastVisible(result.lastVisible);
          setHasMore(result.hasMore);
        }
      } catch (error) {
        setStores([]);
      } finally {
        setLoading(false);
      }
  };

    loadStores();
  }, [user]);

  // Load more stores
  const loadMoreStores = async () => {
    if (!user || !lastVisible || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      const result = await fetchMoreStores(user.uid, lastVisible);
      
      setStores(prevStores => [...prevStores, ...result.stores]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingMore(false);
    }
};

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Stores</h1>
        
        <StoreSearchFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showOnlyWithCoupons={showOnlyWithCoupons}
          setShowOnlyWithCoupons={setShowOnlyWithCoupons}
        />
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : filteredStores.length === 0 ? (
        <EmptyStoreState 
          searchQuery={searchQuery}
          showOnlyWithCoupons={showOnlyWithCoupons}
          setShowOnlyWithCoupons={setShowOnlyWithCoupons}
        />
      ) : (
          <StoreList 
            stores={filteredStores}
            searchQuery={searchQuery}
            hasMore={hasMore && !loading}
            loadingMore={loadingMore}
            loadMoreStores={loadMoreStores}
          />
      )}
    </div>
  );
};

export default StoresPage;