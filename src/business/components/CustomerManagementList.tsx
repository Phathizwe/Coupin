import React, { useState, useEffect } from 'react';
import { fetchBusinessCustomers, BusinessCustomer } from '../services/customerManagementService';
import { useAuth } from '../../hooks/useAuth';
import { CustomerPhoneLookup } from './CustomerPhoneLookup';

export const CustomerManagementList: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<BusinessCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<BusinessCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<BusinessCustomer | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadCustomers();
    }
  }, [user]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const businessCustomers = await fetchBusinessCustomers(user.uid);
      setCustomers(businessCustomers);
      
      if (businessCustomers.length === 0) {
        setError('No customers found. Add customers to see them here.');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = customers.filter(customer => 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTermLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchTermLower)) ||
      (customer.phone && customer.phone.includes(searchTerm.replace(/\s+/g, '')))
    );
    
    setFilteredCustomers(filtered);
  };

  const handleCustomerFound = (customer: BusinessCustomer) => {
    setSelectedCustomer(customer);
    
    // Check if this customer is already in our list
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    
    if (existingIndex === -1) {
      // Add the customer to our list if not already present
      setCustomers(prev => [customer, ...prev]);
    } else {
      // Update the existing customer in our list
      setCustomers(prev => {
        const updated = [...prev];
        updated[existingIndex] = customer;
        return updated;
      });
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customer-management">
      <div className="search-section">
        <h2>Find Customer by Phone</h2>
        <CustomerPhoneLookup onCustomerFound={handleCustomerFound} />
      </div>
      
      <div className="customer-list-section">
        <div className="list-header">
          <h2>Your Customers</h2>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {error && !customers.length ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadCustomers} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <>
            {filteredCustomers.length > 0 ? (
              <div className="customers-grid">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id} 
                    className={`customer-card ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="customer-header">
                      <h3>{customer.firstName} {customer.lastName}</h3>
                    </div>
                    <div className="customer-details">
                      <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                      <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                      <p><strong>Joined:</strong> {formatDate(customer.joinDate?.toDate?.())}</p>
                      <p><strong>Last Visit:</strong> {formatDate(customer.lastVisit)}</p>
                    </div>
                    <div className="customer-stats">
                      <div className="stat">
                        <span className="value">{customer.totalVisits || 0}</span>
                        <span className="label">Visits</span>
                      </div>
                      <div className="stat">
                        <span className="value">{customer.totalCoupons || 0}</span>
                        <span className="label">Coupons</span>
                      </div>
                      <div className="stat">
                        <span className="value">R{(customer.totalSpent || 0).toFixed(2)}</span>
                        <span className="label">Spent</span>
                      </div>
                    </div>
                    {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
                      <div className="loyalty-section">
                        <h4>Loyalty Programs</h4>
                        {customer.loyaltyPrograms.map((program, index) => (
                          <div key={index} className="program-item">
                            <span className="program-name">{program.programName}</span>
                            <div className="program-stats">
                              <span>{program.points} pts</span>
                              <span>{program.visits} visits</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="record-visit-btn">
                      Record Visit
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No customers found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};