import React, { useState, useEffect } from 'react';
import { searchBusinessesByName } from '../services/businessService.enhanced';
import { Business } from '../types/store';

interface StoreSearchFilterProps {
  onSearchResults: (results: Business[]) => void;
  onSearching: (isSearching: boolean) => void;
}

const StoreSearchFilter: React.FC<StoreSearchFilterProps> = ({ 
  onSearchResults, 
  onSearching 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle search when the search term changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Perform the search
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      onSearching(true);
      
      console.log(`Searching for stores with term: "${searchTerm}"`);
      const results = await searchBusinessesByName(searchTerm);
      
      console.log(`Search returned ${results.length} results`);
      onSearchResults(results);
    } catch (error) {
      console.error('Error searching stores:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
      onSearching(false);
    }
  };

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="store-search-filter">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search for stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default StoreSearchFilter;