import React, { useState } from 'react';

interface SearchFilterProps {
  onSearch: (term: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Search campaigns..."
          className="border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="absolute left-3 top-2.5">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;