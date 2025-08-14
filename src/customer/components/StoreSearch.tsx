import React, { useState, useEffect } from 'react';
import { storeDiscoveryService, BusinessSearchResult } from '../services/storeDiscoveryService';

interface StoreSearchProps {
  onBusinessSelect?: (business: BusinessSearchResult) => void;
}

export const StoreSearch: React.FC<StoreSearchProps> = ({ onBusinessSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const results = await storeDiscoveryService.searchBusinesses(term);
      setSearchResults(results);
      if (results.length === 0) {
        setError(`No businesses found for "${term}". Try a different search term.`);
      }
    } catch (err) {
      setError('Failed to search businesses. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="store-search">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {isLoading && <div className="search-loading">Searching...</div>}
      </div>
      {error && (
        <div className="search-error">
          {error}
        </div>
      )}
      <div className="search-results">
        {searchResults.map((business) => (
          <div
            key={business.id}
            className="business-card"
            onClick={() => onBusinessSelect?.(business)}
          >
            <h3>{business.businessName}</h3>
            {business.description && <p>{business.description}</p>}
            {business.hasActivePrograms && (
              <div className="loyalty-programs">
                <h4>Available Loyalty Programs:</h4>
                {business.loyaltyPrograms.map((program) => (
                  <div key={program.id} className="program-summary">
                    <span className="program-name">{program.name}</span>
                    <span className="program-type">{program.type}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="join-button">
              View Programs
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};