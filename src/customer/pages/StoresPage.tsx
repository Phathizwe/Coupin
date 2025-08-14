import React from 'react';
import { StoreSearch } from '../components/StoreSearch';
import { BusinessSearchResult } from '../services/storeDiscoveryService';

export const StoresPage: React.FC = () => {
  const handleBusinessSelect = (business: BusinessSearchResult) => {
    // Navigate to business detail page or show enrollment options
    console.log('Selected business:', business);
    // TODO: Implement business detail view
  };

  return (
    <div className="stores-page">
      <h1>Discover Stores</h1>
      <p>Find businesses and join their loyalty programs</p>
      <StoreSearch onBusinessSelect={handleBusinessSelect} />
    </div>
  );
};