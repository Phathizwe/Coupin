import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { fetchCustomerCoupons } from './services/couponService.enhanced';
import { fetchBusinessById } from './services/businessService';
import { Coupon } from './types/coupon.enhanced';
import { Business } from './types/store';
import CouponFilter from './components/CouponFilter';
import CouponList from './components/CouponList.enhanced';
import EmptyCouponState from './components/EmptyCouponState';
import LoadingSpinner from './components/LoadingSpinner';

// Define the props interfaces here if they're not exported from the components
interface CouponFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentFilter: 'all' | 'active' | 'expired' | 'redeemed';
  onFilterChange: (filter: 'all' | 'active' | 'expired' | 'redeemed') => void;
  couponCount: number;
}

interface CouponListProps {
  coupons: Coupon[];
  onCouponRedeemed: (coupon: Coupon) => void;
}

const CouponsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('businessId');
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'redeemed'>('all');
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
      fetchCoupons();
    }
  }, [user]);

  // Apply filters whenever coupons, searchQuery, filter, or businessFilter changes
  useEffect(() => {
    applyFilters();
  }, [coupons, searchQuery, filter, businessFilter]);

  const fetchCoupons = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer's coupons
      const result = await fetchCustomerCoupons(user.uid);
      setCoupons(result.coupons);
      
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load your coupons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchCoupons();
  };

  // Apply search and status filters
  const applyFilters = () => {
    let filtered = [...coupons];
    
    // Apply business filter if set
    if (businessFilter) {
      filtered = filtered.filter(coupon => 
        coupon.businessId === businessFilter.id
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(coupon => 
        coupon.title.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        coupon.businessName?.toLowerCase().includes(query) ||
        coupon.code.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      const now = new Date();
      
      if (filter === 'active') {
        filtered = filtered.filter(coupon => 
          new Date(coupon.endDate) >= now && 
          coupon.status !== 'redeemed'
        );
      } else if (filter === 'expired') {
        filtered = filtered.filter(coupon => 
          new Date(coupon.endDate) < now && 
          coupon.status !== 'redeemed'
        );
      } else if (filter === 'redeemed') {
        filtered = filtered.filter(coupon => 
          coupon.status === 'redeemed'
        );
      }
    }
    
    setFilteredCoupons(filtered);
  };

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'active' | 'expired' | 'redeemed') => {
    setFilter(newFilter);
  };

  // Handle coupon redemption
  const handleCouponRedeemed = (redeemedCoupon: Coupon) => {
    // Update the local state to reflect the redemption
    setCoupons(prevCoupons => 
      prevCoupons.map(coupon => 
        coupon.id === redeemedCoupon.id 
          ? { ...coupon, status: 'redeemed' as const } 
          : coupon
      )
    );
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
  
  // Safely get business name
  const getBusinessName = () => {
    if (businessFilter) {
      return businessFilter.businessName || businessFilter.name || 'Business';
    }
    return 'Business';
  };

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

  const businessName = getBusinessName();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: businessFilter ? colors.primary : 'inherit' }}>
          {businessFilter ? `Coupons from ${businessName}` : 'My Coupons'}
        </h1>
        <div className="flex space-x-2">
          {businessFilter && (
            <button 
              onClick={clearBusinessFilter}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              View All Coupons
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
                alt={businessName} 
                className="w-10 h-10 rounded-full mr-3 border-2"
                style={{ borderColor: colors.primary }}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full text-white flex items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary }}
              >
                {businessName.charAt(0)}
              </div>
            )}
            <div>
              <h2 
                className="font-medium"
                style={{ color: colors.primary }}
              >
                {businessName}
              </h2>
              <p className="text-sm text-gray-500">{businessFilter.industry || 'General'}</p>
            </div>
          </div>
        </div>
      )}
      
      <CouponFilter 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
        couponCount={businessFilter ? filteredCoupons.length : coupons.length}
      />
      
      {filteredCoupons.length === 0 ? (
        <EmptyCouponState searchQuery={searchQuery} />
      ) : (
        <CouponList 
          coupons={filteredCoupons}
          onCouponRedeemed={handleCouponRedeemed}
        />
      )}
    </div>
  );
};

export default CouponsPage;