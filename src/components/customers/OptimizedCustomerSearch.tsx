// src/components/customers/OptimizedCustomerSearch.tsx
import React, { useState } from 'react';
import { OptimizedCouponService } from '../../services/firestore/queries/optimizedCouponQueries';

interface CustomerSearchProps {
  onCustomerFound?: (customer: any) => void;
}

const OptimizedCustomerSearch: React.FC<CustomerSearchProps> = ({ onCustomerFound }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the optimized phone lookup
      const result = await OptimizedCouponService.findCustomerByPhoneOptimized(phoneNumber);
      
      if (result) {
        setCustomer(result);
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

  return (
    <div className="optimized-customer-search">
      <h3>Find Customer by Phone</h3>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number (any format)"
          disabled={loading}
          className="phone-input"
        />
        
        <button 
          type="submit" 
          disabled={loading || !phoneNumber.trim()}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
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
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedCustomerSearch;