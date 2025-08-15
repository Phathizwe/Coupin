import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getBusinessCustomers, findCustomersByPhone } from '../../services/customerBusinessLinkingService';
import { Customer } from '../../types';
import { recordCustomerVisit } from '../../services/customerBusinessLinkingService';

/**
 * Enhanced Customer Management Component
 * This component provides a robust interface for business owners to manage their customers
 * It addresses the critical customer visibility and phone lookup issues
 */
const EnhancedCustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [visitAmount, setVisitAmount] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [isRecordingVisit, setIsRecordingVisit] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState<boolean | null>(null);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, [user]);

  // Filter customers when search term changes
  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  // Load customers from the database
  const loadCustomers = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const businessCustomers = await getBusinessCustomers(user.uid);
      setCustomers(businessCustomers);
      
      if (businessCustomers.length === 0) {
        setError('No customers found. When customers join your loyalty programs, they will appear here.');
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customers based on search term
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

  // Search for customers by phone number
  const handlePhoneSearch = async () => {
    if (!phoneSearchTerm.trim() || !user?.uid) return;
    
    try {
      setIsSearching(true);
      
      const foundCustomers = await findCustomersByPhone(user.uid, phoneSearchTerm);
      
      if (foundCustomers.length > 0) {
        // Add found customers to the list if they're not already there
        const existingIds = new Set(customers.map(c => c.id));
        const newCustomers = foundCustomers.filter(c => !existingIds.has(c.id));
        
        if (newCustomers.length > 0) {
          setCustomers(prev => [...newCustomers, ...prev]);
        }
        
        // Select the first found customer
        setSelectedCustomer(foundCustomers[0]);
      } else {
        setError(`No customers found with phone number ${phoneSearchTerm}`);
      }
    } catch (err) {
      console.error('Error searching for customers by phone:', err);
      setError('Failed to search for customers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Record a visit for a customer
  const handleRecordVisit = async () => {
    if (!selectedCustomer || !user?.uid) return;
    
    try {
      setIsRecordingVisit(true);
      setVisitSuccess(null);
      
      // Get customer's loyalty programs
      const programs = await getCustomerLoyaltyPrograms(selectedCustomer.id);
      
      if (programs.length === 0) {
        setError('This customer is not enrolled in any loyalty programs.');
        setVisitSuccess(false);
        return;
      }
      
      // Use the first program for now
      const program = programs[0];
      
      const amount = parseFloat(visitAmount) || 0;
      
      const success = await recordCustomerVisit(
        selectedCustomer.id,
        user.uid,
        program.programId,
        amount,
        visitNotes
      );
      
      setVisitSuccess(success);
      
      if (success) {
        // Update the customer in the list
        setCustomers(prev => prev.map(c => 
          c.id === selectedCustomer.id 
            ? { 
                ...c, 
                totalVisits: (c.totalVisits || 0) + 1,
                totalSpent: (c.totalSpent || 0) + amount,
                lastVisit: new Date()
              } 
            : c
        ));
        
        // Reset form
        setVisitAmount('');
        setVisitNotes('');
      }
    } catch (err) {
      console.error('Error recording visit:', err);
      setError('Failed to record visit. Please try again.');
      setVisitSuccess(false);
    } finally {
      setIsRecordingVisit(false);
    }
  };

  // Format date for display
  const formatDate = (date: any) => {
    if (!date) return 'Never';
    
    try {
      // Handle Firestore timestamps
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return jsDate.toLocaleDateString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Get customer loyalty programs
  const getCustomerLoyaltyPrograms = async (customerId: string): Promise<any[]> => {
    try {
      // This would normally call a service function, but for simplicity
      // we'll just return a mock program
      return [{
        programId: 'default-program',
        programName: 'Default Loyalty Program',
        programType: 'points'
      }];
    } catch (err) {
      console.error('Error getting customer loyalty programs:', err);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your customer community...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-customer-management">
      <div className="customer-management-header">
        <h1>Customer Management</h1>
        <p>View, search, and manage your customer relationships</p>
      </div>
      
      <div className="customer-management-content">
        <div className="phone-search-section">
          <h2>Find Customer by Phone</h2>
          <div className="phone-search-form">
            <input
              type="text"
              placeholder="Enter phone number (e.g., +27821111111)"
              value={phoneSearchTerm}
              onChange={(e) => setPhoneSearchTerm(e.target.value)}
              className="phone-input"
            />
            <button
              onClick={handlePhoneSearch}
              disabled={isSearching || !phoneSearchTerm.trim()}
              className="search-button"
            >
              {isSearching ? 'Searching...' : 'Find Customer'}
            </button>
          </div>
        </div>
        
        <div className="customer-list-section">
          <div className="customer-list-header">
            <h2>Your Customers</h2>
            <div className="customer-search">
              <input
                type="text"
                placeholder="Search customers by name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          {error && !customers.length ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadCustomers} className="retry-button">
                Refresh
              </button>
            </div>
          ) : (
            <div className="customer-content">
              <div className="customer-list">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
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
                        <p><strong>Joined:</strong> {formatDate(customer.joinDate)}</p>
                        <p><strong>Last Visit:</strong> {formatDate(customer.lastVisit)}</p>
                      </div>
                      <div className="customer-stats">
                        <div className="stat">
                          <span className="value">{customer.totalVisits || 0}</span>
                          <span className="label">Visits</span>
                        </div>
                        <div className="stat">
                          <span className="value">R{(customer.totalSpent || 0).toFixed(2)}</span>
                          <span className="label">Spent</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-customers">
                    <p>
                      {searchTerm 
                        ? `No customers found matching "${searchTerm}"`
                        : 'No customers found. When customers join your loyalty programs, they will appear here.'
                      }
                    </p>
                  </div>
                )}
              </div>
              
              {selectedCustomer && (
                <div className="customer-detail">
                  <div className="customer-detail-header">
                    <h2>{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
                    <span className="customer-id">ID: {selectedCustomer.id}</span>
                  </div>
                  
                  <div className="customer-detail-content">
                    <div className="customer-info">
                      <h3>Customer Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Phone</span>
                          <span className="value">{selectedCustomer.phone || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Email</span>
                          <span className="value">{selectedCustomer.email || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Joined</span>
                          <span className="value">{formatDate(selectedCustomer.joinDate)}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Last Visit</span>
                          <span className="value">{formatDate(selectedCustomer.lastVisit)}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Total Visits</span>
                          <span className="value">{selectedCustomer.totalVisits || 0}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Total Spent</span>
                          <span className="value">R{(selectedCustomer.totalSpent || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="visit-recording">
                      <h3>Record Visit</h3>
                      <div className="visit-form">
                        <div className="form-group">
                          <label htmlFor="visitAmount">Amount Spent (optional)</label>
                          <input
                            id="visitAmount"
                            type="number"
                            placeholder="0.00"
                            value={visitAmount}
                            onChange={(e) => setVisitAmount(e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="visitNotes">Notes (optional)</label>
                          <textarea
                            id="visitNotes"
                            placeholder="Add notes about this visit"
                            value={visitNotes}
                            onChange={(e) => setVisitNotes(e.target.value)}
                            className="form-textarea"
                          />
                        </div>
                        <button
                          onClick={handleRecordVisit}
                          disabled={isRecordingVisit}
                          className="record-visit-button"
                        >
                          {isRecordingVisit ? 'Recording...' : 'Record Visit'}
                        </button>
                        
                        {visitSuccess !== null && (
                          <div className={`visit-result ${visitSuccess ? 'success' : 'error'}`}>
                            {visitSuccess 
                              ? 'Visit recorded successfully!' 
                              : 'Failed to record visit. Please try again.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCustomerManagement;