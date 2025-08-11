import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchPopularBusinesses, 
  fetchBusinessesWithLoyaltyPrograms,
  fetchBusinessesByIndustry,
  searchBusinesses
} from './services/storeService.enhanced';
import { Business } from './types/store';
import LoadingSpinner from './components/LoadingSpinner';

const StoreDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [popularStores, setPopularStores] = useState<Business[]>([]);
  const [loyaltyStores, setLoyaltyStores] = useState<Business[]>([]);
  const [industryStores, setIndustryStores] = useState<{[key: string]: Business[]}>({}); 
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  
  // Common industries
  const industries = [
    'Restaurant', 
    'Retail', 
    'Beauty', 
    'Health', 
    'Fitness', 
    'Cafe'
  ];

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch popular businesses
        const popular = await fetchPopularBusinesses();
        setPopularStores(popular);
        
        // Fetch businesses with loyalty programs
        const withLoyalty = await fetchBusinessesWithLoyaltyPrograms(8);
        setLoyaltyStores(withLoyalty);
        
        // Fetch businesses by industry (for each industry)
        const industryData: {[key: string]: Business[]} = {};
        
        for (const industry of industries) {
          const businesses = await fetchBusinessesByIndustry(industry, 6);
          if (businesses.length > 0) {
            industryData[industry] = businesses;
          }
        }
        
        setIndustryStores(industryData);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setError('Failed to load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStores();
  }, []);
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchBusinesses(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleStoreClick = (storeId: string) => {
    navigate(`/customer/stores/${storeId}`);
  };
  
  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(selectedIndustry === industry ? null : industry);
  };

  // Helper function to safely get the first character of a store name
  const getStoreInitial = (store: Business): string => {
    if (store.name && store.name.length > 0) {
      return store.name.charAt(0);
    }
    if (store.businessName && store.businessName.length > 0) {
      return store.businessName.charAt(0);
    }
    return 'S'; // Default initial for Store
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discover Stores</h1>
      
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for stores..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {searchResults.map(store => (
              <div 
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name || store.businessName || 'Store'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-gray-400">
                        {getStoreInitial(store)}
                      </span>
                    </div>
                  )}
                  
                  {store.hasLoyaltyProgram && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Loyalty Program
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{store.name || store.businessName}</h3>
                  <p className="text-gray-500 text-sm mb-2">{store.industry}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{store.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Industry Filters */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Browse by Category</h2>
        
        <div className="flex flex-wrap gap-2">
          {industries.map(industry => (
            <button
              key={industry}
              onClick={() => handleIndustrySelect(industry)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedIndustry === industry
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>
      
      {/* Stores with Loyalty Programs */}
      {!selectedIndustry && loyaltyStores.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Stores with Loyalty Programs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loyaltyStores.map(store => (
              <div 
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name || store.businessName || 'Store'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-gray-400">
                        {getStoreInitial(store)}
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Loyalty Program
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{store.name || store.businessName}</h3>
                  <p className="text-gray-500 text-sm mb-2">{store.industry}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{store.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Popular Stores */}
      {!selectedIndustry && popularStores.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Popular Stores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularStores.map(store => (
              <div 
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name || store.businessName || 'Store'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-gray-400">
                        {getStoreInitial(store)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{store.name || store.businessName}</h3>
                  <p className="text-gray-500 text-sm mb-2">{store.industry}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{store.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Industry-specific Stores */}
      {selectedIndustry && industryStores[selectedIndustry] && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">{selectedIndustry} Stores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {industryStores[selectedIndustry].map(store => (
              <div 
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name || store.businessName || 'Store'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-gray-400">
                        {getStoreInitial(store)}
                      </span>
                    </div>
                  )}
                  
                  {store.hasLoyaltyProgram && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Loyalty Program
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{store.name || store.businessName}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{store.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Display other industry sections if no industry is selected */}
      {!selectedIndustry && Object.keys(industryStores).map(industry => (
        <div key={industry} className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{industry} Stores</h2>
            <button 
              onClick={() => handleIndustrySelect(industry)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industryStores[industry].slice(0, 3).map(store => (
              <div 
                key={store.id}
                onClick={() => handleStoreClick(store.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {store.logo ? (
                    <img 
                      src={store.logo} 
                      alt={store.name || store.businessName || 'Store'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-3xl font-bold text-gray-400">
                        {getStoreInitial(store)}
                      </span>
                    </div>
                  )}
                  
                  {store.hasLoyaltyProgram && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Loyalty Program
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{store.name || store.businessName}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{store.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default StoreDiscoveryPage;