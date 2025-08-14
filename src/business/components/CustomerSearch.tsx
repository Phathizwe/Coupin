import React, { useState } from 'react';
import { customerLookupService, BusinessCustomer } from '../services/customerLookupService';
import { useAuth } from '../../hooks/useAuth'; // Fixed import path

export const CustomerSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<BusinessCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !user) return;
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    try {
      const customer = await customerLookupService.findCustomerByPhone(
        user.uid, // businessId
        searchTerm
      );
      if (customer) {
        setSearchResult(customer);
      } else {
        setError(`No customer found with phone number: ${searchTerm}`);
      }
    } catch (err) {
      setError('Failed to search for customer. Please try again.');
      console.error('Customer search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="customer-search">
      <div className="search-container">
        <input
          type="text"
          placeholder="Find someone in your community..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading || !searchTerm.trim()}
          className="search-button"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && (
        <div className="search-error">
          {error}
        </div>
      )}
      {searchResult && (
        <div className="customer-result">
          <div className="customer-header">
            <h3>{searchResult.name}</h3>
            <p>{searchResult.phone}</p>
            <p>{searchResult.email}</p>
          </div>
          <div className="customer-stats">
            <div className="stat">
              <span className="stat-value">{searchResult.totalVisits}</span>
              <span className="stat-label">Total Visits</span>
            </div>
            <div className="stat">
              <span className="stat-value">R{searchResult.totalSpent.toFixed(2)}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
          <div className="loyalty-programs">
            <h4>Loyalty Programs</h4>
            {searchResult.loyaltyPrograms.map((program) => (
              <div key={program.programId} className="program-info">
                <span className="program-name">{program.programName}</span>
                <span className="program-stats">
                  {program.currentPoints > 0 && `${program.currentPoints} points`}
                  {program.currentVisits > 0 && `${program.currentVisits} visits`}
                </span>
              </div>
            ))}
          </div>
          <button className="record-visit-button">
            Record Visit
          </button>
        </div>
      )}
    </div>
  );
};