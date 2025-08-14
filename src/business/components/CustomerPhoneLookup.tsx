import React, { useState } from 'react';
import { findCustomerByPhone, BusinessCustomer } from '../services/customerManagementService';
import { useAuth } from '../../hooks/useAuth';

interface CustomerPhoneLookupProps {
  onCustomerFound?: (customer: BusinessCustomer) => void;
}

export const CustomerPhoneLookup: React.FC<CustomerPhoneLookupProps> = ({ onCustomerFound }) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    customer: BusinessCustomer | null;
    message: string;
  } | null>(null);

  const handleSearch = async () => {
    if (!phoneNumber.trim() || !user?.uid) return;
    
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const customer = await findCustomerByPhone(user.uid, phoneNumber);
      
      if (customer) {
        setSearchResult({
          customer,
          message: 'Customer found!'
        });
        
        if (onCustomerFound) {
          onCustomerFound(customer);
        }
      } else {
        setSearchResult({
          customer: null,
          message: `No customer found with phone number ${phoneNumber}`
        });
      }
    } catch (error) {
      console.error('Error searching for customer:', error);
      setSearchResult({
        customer: null,
        message: 'Error searching for customer. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  };

  return (
    <div className="customer-phone-lookup">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter customer phone number..."
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="phone-input"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !phoneNumber.trim()}
          className="search-button"
        >
          {isSearching ? 'Searching...' : 'Find Customer'}
        </button>
      </div>
      
      {searchResult && (
        <div className={`search-result ${searchResult.customer ? 'success' : 'error'}`}>
          {searchResult.customer ? (
            <div className="customer-details">
              <h3>{searchResult.customer.firstName} {searchResult.customer.lastName}</h3>
              <p><strong>Phone:</strong> {searchResult.customer.phone}</p>
              <p><strong>Email:</strong> {searchResult.customer.email}</p>
              <p><strong>Joined:</strong> {formatDate(searchResult.customer.joinDate?.toDate?.())}</p>
              <p><strong>Last Visit:</strong> {formatDate(searchResult.customer.lastVisit)}</p>
              
              {searchResult.customer.loyaltyPrograms && searchResult.customer.loyaltyPrograms.length > 0 && (
                <div className="loyalty-programs">
                  <h4>Loyalty Programs</h4>
                  {searchResult.customer.loyaltyPrograms.map((program, index) => (
                    <div key={index} className="program">
                      <p><strong>{program.programName}</strong></p>
                      <p>Points: {program.points} | Visits: {program.visits}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="record-visit-btn">
                Record Visit
              </button>
            </div>
          ) : (
            <p>{searchResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};