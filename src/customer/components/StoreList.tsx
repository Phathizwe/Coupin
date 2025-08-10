import React from 'react';
import { Business } from '../../customer/types/store';
import StoreCard from './StoreCard';
import LoadMoreButton from './LoadMoreButton';

interface StoreListProps {
  stores: Business[];
  searchQuery: string;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreStores: () => Promise<void>;
}

const StoreList: React.FC<StoreListProps> = ({ 
  stores, 
  searchQuery, 
  hasMore, 
  loadingMore, 
  loadMoreStores 
}) => {
  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        Showing {stores.length} {stores.length === 1 ? 'store' : 'stores'}
        {searchQuery ? ` for "${searchQuery}"` : ''}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      
      {hasMore && (
        <LoadMoreButton onClick={loadMoreStores} isLoading={loadingMore} />
      )}
    </>
  );
};

export default StoreList;