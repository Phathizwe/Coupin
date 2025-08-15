import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedStoreSearch from '../components/EnhancedStoreSearch';
import { Business } from '../types/store';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPopularBusinesses, getBusinessesWithLoyaltyPrograms, getBusinessesByIndustry } from '../../services/businessDiscoveryService';

/**
 * Enhanced Store Discovery Page
 * This page provides a robust interface for customers to discover businesses
 * It addresses the critical store discovery failure issue
 */
const EnhancedStoreDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularStores, setPopularStores] = useState<Business[]>([]);
  const [loyaltyStores, setLoyaltyStores] = useState<Business[]>([]);
  const [industryStores, setIndustryStores] = useState<{[key: string]: Business[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'search'>('all');

  // Common industries
  const industries = ['Restaurant', 'Cafe', 'Retail', 'Beauty', 'Fitness'];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch popular businesses
        const popular = await getPopularBusinesses(5);
        setPopularStores(popular);
        
        // Fetch businesses with loyalty programs
        const withLoyalty = await getBusinessesWithLoyaltyPrograms(5);
        setLoyaltyStores(withLoyalty);
        
        // Fetch businesses by industry
        const industryData: {[key: string]: Business[]} = {};
        
        for (const industry of industries) {
          const businesses = await getBusinessesByIndustry(industry, 3);
          if (businesses.length > 0) {
            industryData[industry] = businesses;
          }
        }
        
        setIndustryStores(industryData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle search results
  const handleSearchResults = (results: Business[]) => {
    setSearchResults(results);
    setActiveTab('search');
  };

  // Navigate to store detail page
  const navigateToStore = (storeId: string) => {
    navigate(`/customer/store/${storeId}`);
  };

  // Render store card
  const renderStoreCard = (store: Business) => (
    <div 
      key={store.id} 
      className="store-card" 
      onClick={() => navigateToStore(store.id)}
    >
      <div className="store-logo">
        {store.logo ? (
          <img src={store.logo} alt={`${store.businessName || 'Business'} logo`} />
        ) : (
          <div className="default-logo" style={{ backgroundColor: store.colors?.primary || '#3B82F6' }}>
            {(store.businessName || 'B').charAt(0)}
          </div>
        )}
      </div>
      <div className="store-info">
        <h3>{store.businessName || 'Unknown Business'}</h3>
        <p className="industry">{store.industry || 'Business'}</p>
        {(store.couponCount || 0) > 0 && (
          <p className="coupon-count">{store.couponCount} active coupons</p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Discovering amazing businesses for you...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-store-discovery">
      <div className="search-section">
        <h1>Discover Businesses</h1>
        <p>Find and join loyalty programs at your favorite places</p>
        
        <EnhancedStoreSearch 
          onSearchResults={handleSearchResults}
          onSearching={setIsSearching}
        />
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Discover
        </button>
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
          disabled={searchResults.length === 0}
        >
          Search Results {searchResults.length > 0 && `(${searchResults.length})`}
        </button>
      </div>
      
      {activeTab === 'search' ? (
        <div className="search-results">
          <h2>Search Results</h2>
          
          {isSearching ? (
            <div className="searching">
              <LoadingSpinner />
              <p>Searching for businesses...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="store-grid">
              {searchResults.map(renderStoreCard)}
            </div>
          ) : (
            <div className="no-results">
              <p>No businesses found matching your search.</p>
              <p>Try a different search term or browse our featured businesses.</p>
              <button 
                className="browse-button"
                onClick={() => setActiveTab('all')}
              >
                Browse Featured Businesses
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="discover-content">
          {/* Popular Stores */}
          {popularStores.length > 0 && (
            <div className="section">
              <h2>Popular Businesses</h2>
              <div className="store-grid">
                {popularStores.map(renderStoreCard)}
              </div>
            </div>
          )}
          
          {/* Loyalty Program Stores */}
          {loyaltyStores.length > 0 && (
            <div className="section">
              <h2>Businesses with Loyalty Programs</h2>
              <div className="store-grid">
                {loyaltyStores.map(renderStoreCard)}
              </div>
            </div>
          )}
          
          {/* Industry Sections */}
          {Object.entries(industryStores).map(([industry, stores]) => (
            <div className="section" key={industry}>
              <h2>{industry} Businesses</h2>
              <div className="store-grid">
                {stores.map(renderStoreCard)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedStoreDiscoveryPage;