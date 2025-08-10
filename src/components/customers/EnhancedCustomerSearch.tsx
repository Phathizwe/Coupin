import React, { useState, useEffect } from 'react';
import { OptimizedCouponService } from '../../services/firestore/queries/optimizedCouponQueries';
import { QueryOptimizer } from '../../services/firestore/optimizers/queryOptimizer';
import { performanceMonitor } from '../../utils/performanceMonitor';

interface CustomerSearchProps {
  onCustomerFound?: (customer: any) => void;
  businessId?: string; // Optional business filter
  autoFocus?: boolean;
  showPerformanceMetrics?: boolean;
}

const EnhancedCustomerSearch: React.FC<CustomerSearchProps> = ({ 
  onCustomerFound, 
  businessId,
  autoFocus = true,
  showPerformanceMetrics = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [searchMetrics, setSearchMetrics] = useState<{time: number, cached: boolean} | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentPhoneSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load recent searches', err);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (phone: string) => {
    try {
      const updatedSearches = [phone, ...recentSearches.filter(p => p !== phone)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentPhoneSearches', JSON.stringify(updatedSearches));
    } catch (err) {
      console.error('Failed to save recent search', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Record start time for performance measurement
      const startTime = performance.now();
      
      // Check if the result is already in cache
      const normalizedPhone = QueryOptimizer.normalizePhoneNumber(phoneNumber);
      const cacheKey = `customer_phone_${normalizedPhone}`;
      const isCached = await OptimizedCouponService['cache']?.get(cacheKey) !== null;
      
      // Use the optimized phone lookup
      const result = await OptimizedCouponService.findCustomerByPhoneOptimized(phoneNumber);
      
      // Record search metrics
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      setSearchMetrics({ time: searchTime, cached: isCached });
      
      if (result) {
        setCustomer(result);
        saveRecentSearch(phoneNumber);
        if (onCustomerFound) {
          onCustomerFound(result);
        }
      } else {
        setCustomer(null);
        setError('No customer found with this phone number');
      }
    } catch (err: any) {
      setError(err.message || 'Error searching for customer');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearchClick = (phone: string) => {
    setPhoneNumber(phone);
    // Trigger search immediately
    const event = { preventDefault: () => {} } as React.FormEvent;
    setTimeout(() => handleSearch(event), 0);
  };

  return (
    <div className="enhanced-customer-search">
      <h3>Find Customer by Phone</h3>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number (any format)"
          disabled={loading}
          className="phone-input"
          autoFocus={autoFocus}
        />
        
        <button 
          type="submit" 
          disabled={loading || !phoneNumber.trim()}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <small>Recent searches:</small>
          <div className="recent-search-pills">
            {recentSearches.map((phone, index) => (
              <button 
                key={index} 
                className="recent-search-pill"
                onClick={() => handleRecentSearchClick(phone)}
                type="button"
              >
                {phone}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {customer && (
        <div className="customer-result">
          <h4>Customer Found</h4>
          <div className="customer-details">
            <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            {customer.totalSpent && (
              <p><strong>Total Spent:</strong> ${customer.totalSpent.toFixed(2)}</p>
            )}
            {customer.lastVisit && (
              <p><strong>Last Visit:</strong> {new Date(customer.lastVisit.toDate()).toLocaleDateString()}</p>
            )}
            {customer.loyaltyPoints && (
              <p><strong>Loyalty Points:</strong> {customer.loyaltyPoints}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Performance metrics */}
      {showPerformanceMetrics && searchMetrics && (
        <div className="search-metrics">
          <small>
            Search completed in {searchMetrics.time.toFixed(2)}ms 
            {searchMetrics.cached ? ' (cached)' : ' (database query)'}
          </small>
        </div>
      )}
    </div>
  );
};

export default EnhancedCustomerSearch;