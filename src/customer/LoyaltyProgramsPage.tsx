import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { fetchCustomerLoyaltyPrograms } from './services/loyaltyService';
import { fetchBusinessById } from './services/businessService';
import { CustomerLoyaltyProgram } from './types/loyalty';
import { Business } from './types/store';
import LoyaltyFilter from './components/LoyaltyFilter';
import LoyaltyProgramList from './components/LoyaltyProgramList';
import EmptyLoyaltyState from './components/EmptyLoyaltyState';
import LoadingSpinner from './components/LoadingSpinner';

const LoyaltyProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('businessId');
  
  const [programs, setPrograms] = useState<CustomerLoyaltyProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<CustomerLoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [businessFilter, setBusinessFilter] = useState<Business | null>(null);
  
  // Fetch business details if businessId is provided
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      if (businessId) {
        try {
          const business = await fetchBusinessById(businessId);
          setBusinessFilter(business);
        } catch (err) {
          console.error('Error fetching business details:', err);
        }
      } else {
        setBusinessFilter(null);
      }
    };
    
    fetchBusinessDetails();
  }, [businessId]);
  
  useEffect(() => {
    if (user?.uid) {
      fetchLoyaltyPrograms();
    }
  }, [user]);

  // Apply filters whenever programs, searchQuery, filter, or businessFilter changes
  useEffect(() => {
    applyFilters();
  }, [programs, searchQuery, filter, businessFilter]);

  const fetchLoyaltyPrograms = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer's loyalty programs
      const loyaltyPrograms = await fetchCustomerLoyaltyPrograms(user.uid);
      setPrograms(loyaltyPrograms);
      
    } catch (err) {
      console.error('Error fetching loyalty programs:', err);
      setError('Failed to load your loyalty programs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchLoyaltyPrograms();
  };

  // Apply search and status filters
  const applyFilters = () => {
    let filtered = [...programs];
    
    // Apply business filter if set
    if (businessFilter) {
      filtered = filtered.filter(program => 
        program.businessId === businessFilter.id
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(program => 
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query) ||
        program.businessName?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(program => program.active);
    }
    
    setFilteredPrograms(filtered);
  };

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'active') => {
    setFilter(newFilter);
  };

  // Clear business filter
  const clearBusinessFilter = () => {
    // Use window.history to update the URL without a full page reload
    const url = new URL(window.location.href);
    url.searchParams.delete('businessId');
    window.history.pushState({}, '', url);
    setBusinessFilter(null);
  };

  // Get the business colors for styling elements
  const getBusinessColors = () => {
    if (businessFilter && businessFilter.colors) {
      return {
        primary: businessFilter.colors.primary || '#3B82F6',
        secondary: businessFilter.colors.secondary || '#10B981'
      };
    }
    return {
      primary: '#3B82F6',
      secondary: '#10B981'
    };
  };

  const colors = getBusinessColors();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: businessFilter ? colors.primary : 'inherit' }}>
          {businessFilter ? `Loyalty Programs from ${businessFilter.businessName}` : 'My Loyalty Programs'}
        </h1>
        <div className="flex space-x-2">
          {businessFilter && (
            <button 
              onClick={clearBusinessFilter}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              View All Programs
            </button>
          )}
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 text-white rounded-md hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {businessFilter && (
        <div 
          className="mb-4 p-4 rounded-lg border"
          style={{ 
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary + '40'
          }}
        >
          <div className="flex items-center">
            {businessFilter.logo ? (
              <img 
                src={businessFilter.logo} 
                alt={businessFilter.businessName} 
                className="w-10 h-10 rounded-full mr-3 border-2"
                style={{ borderColor: colors.primary }}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full text-white flex items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary }}
              >
                {businessFilter.businessName.charAt(0)}
              </div>
            )}
            <div>
              <h2 
                className="font-medium"
                style={{ color: colors.primary }}
              >
                {businessFilter.businessName}
              </h2>
              <p className="text-sm text-gray-500">{businessFilter.industry}</p>
            </div>
          </div>
        </div>
      )}
      
      <LoyaltyFilter 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
        programCount={businessFilter ? filteredPrograms.length : programs.length}
      />
      
      {filteredPrograms.length === 0 ? (
        <EmptyLoyaltyState searchQuery={searchQuery} />
      ) : (
        <LoyaltyProgramList programs={filteredPrograms} />
      )}
    </div>
  );
};

export default LoyaltyProgramsPage;