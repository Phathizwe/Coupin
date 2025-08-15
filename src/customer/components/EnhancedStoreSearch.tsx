import React, { useState, useEffect } from 'react';
import { searchBusinessesByName, getDefaultBusinesses } from '../../services/businessDiscoveryService';
import { Business } from '../types/store';

interface EnhancedStoreSearchProps {
  onSearchResults: (results: Business[]) => void;
  onSearching: (isSearching: boolean) => void;
  initialSearchTerm?: string;
}

/**
 * Enhanced store search component
 * This component provides a robust search interface for customers to find businesses
 * It addresses the critical store discovery failure issue
 */
const EnhancedStoreSearch: React.FC<EnhancedStoreSearchProps> = ({
  onSearchResults,
  onSearching,
  initialSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load default businesses on mount
  useEffect(() => {
    const loadDefaultBusinesses = async () => {
      try {
        setIsSearching(true);
        onSearching(true);
        
        const businesses = await getDefaultBusinesses();
        onSearchResults(businesses);
      } catch (error) {
        console.error('Error loading default businesses:', error);
        setError('Failed to load businesses. Please try again.');
      } finally {
        setIsSearching(false);
        onSearching(false);
      }
    };

    if (!initialSearchTerm) {
      loadDefaultBusinesses();
    } else {
      // If there's an initial search term, perform search
      handleSearch(initialSearchTerm);
    }
  }, []);

  // Handle search when the search term changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm && searchTerm !== initialSearchTerm) {
        handleSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Perform the search
  const handleSearch = async (term: string) => {
    try {
      setIsSearching(true);
      onSearching(true);
      setError(null);
      
      console.log(`Searching for businesses with term: "${term}"`);
      const results = await searchBusinessesByName(term);
      
      console.log(`Search returned ${results.length} results`);
      onSearchResults(results);
      
      if (results.length === 0) {
        setError(`No businesses found matching "${term}"`);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      setError('Failed to search businesses. Please try again.');
      onSearchResults([]);
    } finally {
      setIsSearching(false);
      onSearching(false);
    }
  };

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  };

  return (
    <div className="enhanced-store-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for businesses (e.g., Mike's Coffee Shop)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search for businesses"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching || !searchTerm.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="search-error">
            <p>{error}</p>
            <button 
              onClick={() => handleSearch(searchTerm)}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedStoreSearch;