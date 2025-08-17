import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchCustomerCoupons } from './services/couponService';
import { Coupon } from './types/coupon';
import CouponCard from './components/CouponCard';
import EmotionalCouponCard from './components/emotional/EmotionalCouponCard';
import EmptyCouponState from './components/EmptyCouponState';
import EmotionalEmptyState from './components/emotional/EmotionalEmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import EmotionalLoadingState from './components/emotional/EmotionalLoadingState';
import LoadMoreButton from './components/LoadMoreButton';
import EmotionalLoadMoreButton from './components/emotional/EmotionalLoadMoreButton';
import CouponFilter from './components/CouponFilter';
import EmotionalCouponFilter from './components/emotional/EmotionalCouponFilter';
import { BRAND_COLORS } from '../constants/brandConstants';

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  hover: {
    scale: 'hover:scale-105',
    glow: 'hover:shadow-lg',
    pulse: 'hover:animate-pulse',
  },
  celebrate: {
    confetti: 'animate-confetti',
    bounce: 'animate-bounce',
    tada: 'animate-tada',
  }
};

interface CustomerCouponsProps {
  viewMode?: 'default' | 'simple';
  onCouponAction?: (message: string) => void;
}

const CustomerCoupons: React.FC<CustomerCouponsProps> = ({
  viewMode = 'default',
  onCouponAction
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'redeemed'>('all');
  const [sortBy, setSortBy] = useState<'endDate' | 'startDate' | 'businessName' | 'value'>('endDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [animateIn, setAnimateIn] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Add staggered animation effect
  useEffect(() => {
    if (coupons.length > 0 && !loading) {
      setAnimateIn(true);
    }
  }, [coupons, loading]);

  // Only fetch coupons when auth is ready and user is logged in
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      return;
    }
    
    // Check if user is logged in
    if (user?.uid) {
      fetchCoupons();
    } else if (!authLoading) {
      // Auth is ready but no user is logged in
      setLoading(false);
      setError('Please log in to view your coupons');
      setFetchAttempted(true);
    }
  }, [user, authLoading, filterStatus, sortBy, sortDirection]);

  const fetchCoupons = async (isLoadMore = false) => {
    // Double-check that we have a valid user ID
    if (!user?.uid) {
      setLoading(false);
      setFetchAttempted(true);
      return;
    }

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      setFetchAttempted(true);

      // Call fetchCustomerCoupons with just the required parameters
      const result = await fetchCustomerCoupons(
        user.uid,
        isLoadMore ? lastDoc : null
      );

      // Apply filtering and sorting client-side if needed
      let filteredCoupons = result.coupons;

      // Filter by status if not 'all'
      if (filterStatus !== 'all') {
        filteredCoupons = filteredCoupons.filter(coupon => coupon.status === filterStatus);
      }

      // Sort coupons
      filteredCoupons.sort((a, b) => {
        let valueA, valueB;

        switch (sortBy) {
          case 'endDate':
            valueA = new Date(a.endDate).getTime();
            valueB = new Date(b.endDate).getTime();
            break;
          case 'startDate':
            valueA = new Date(a.startDate).getTime();
            valueB = new Date(b.startDate).getTime();
            break;
          case 'businessName':
            valueA = a.businessName || '';
            valueB = b.businessName || '';
            break;
          case 'value':
            // Assuming there's a numeric value we can extract from discount
            valueA = parseFloat(a.discount.replace(/[^0-9.-]+/g, '') || '0');
            valueB = parseFloat(b.discount.replace(/[^0-9.-]+/g, '') || '0');
            break;
          default:
            valueA = new Date(a.endDate).getTime();
            valueB = new Date(b.endDate).getTime();
        }

        return sortDirection === 'asc'
          ? (valueA > valueB ? 1 : -1)
          : (valueA < valueB ? 1 : -1);
      });

      if (isLoadMore) {
        setCoupons(prev => [...prev, ...filteredCoupons]);
      } else {
        setCoupons(filteredCoupons);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.coupons.length > 0); // If we got results, there might be more
      setError(null);

    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load your coupons. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Make handleLoadMore return a Promise to match expected type
  const handleLoadMore = async () => {
    if (hasMore && !loadingMore) {
      await fetchCoupons(true);

      // Trigger a subtle celebration if more than 5 coupons are loaded
      if (coupons.length > 5 && onCouponAction) {
        onCouponAction("You've got quite a collection of savings!");
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality here
  };

  const handleFilterChange = (status: 'all' | 'active' | 'expired' | 'redeemed') => {
    setFilterStatus(status);
  };

  const handleSortChange = (sort: 'endDate' | 'startDate' | 'businessName' | 'value', direction: 'asc' | 'desc') => {
    setSortBy(sort);
    setSortDirection(direction);
  };

  const handleCouponRedeemed = (coupon: Coupon) => {
    // Update local state
    setCoupons(prevCoupons =>
      prevCoupons.map(c =>
        c.id === coupon.id
          ? { ...c, status: 'redeemed', redeemedAt: new Date() }
          : c
      )
    );

    // Trigger celebration
    if (onCouponAction) {
      onCouponAction(`You saved ${coupon.discount} at ${coupon.businessName}!`);
    }
  };

  const handleCouponCopied = (coupon: Coupon) => {
    // Trigger smaller celebration
    if (onCouponAction) {
      onCouponAction(`Code copied! Ready to save at ${coupon.businessName}!`);
    }
  };

  // Render loading state
  if (authLoading || (loading && !fetchAttempted)) {
    return viewMode === 'simple'
      ? <EmotionalLoadingState />
      : <LoadingSpinner />;
  }

  // Render not logged in state
  if (!user && !authLoading) {
    return (
      <div className={`p-4 ${viewMode === 'simple' ? 'bg-amber-50/80 backdrop-blur-sm' : 'bg-amber-50'} text-amber-700 rounded-xl shadow-sm border border-amber-100`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">👋</div>
          <div>
            <p className="font-medium">Please log in to view your coupons</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`p-4 ${viewMode === 'simple' ? 'bg-red-50/80 backdrop-blur-sm' : 'bg-red-50'} text-red-700 rounded-xl shadow-sm border border-red-100`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">😕</div>
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={() => fetchCoupons()}
              className={`mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium ${ANIMATIONS.transition.fast}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter coupons based on search query
  const filteredCoupons = searchQuery
    ? coupons.filter(coupon =>
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : coupons;

  // Render empty state
  if (filteredCoupons.length === 0) {
    return viewMode === 'simple'
      ? <EmotionalEmptyState searchQuery={searchQuery} />
      : <EmptyCouponState searchQuery={searchQuery} />;
  }

  // Render simple view (mobile optimized)
  if (viewMode === 'simple') {
    return (
      <div className="space-y-4">
        {/* Enhanced filter and search */}
        <EmotionalCouponFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          currentFilter={filterStatus}
          currentSort={sortBy}
          currentDirection={sortDirection}
        />

        {/* Coupon cards with staggered animation */}
        <div className="space-y-4">
          {filteredCoupons.map((coupon, index) => (
            <div
              key={`${coupon.id}-${index}`}
              className={`${ANIMATIONS.transition.medium} ${animateIn
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <EmotionalCouponCard
                coupon={coupon}
                onRedeem={handleCouponRedeemed}
                onCopy={handleCouponCopied}
              />
            </div>
          ))}
        </div>

        {/* Enhanced load more button */}
        {hasMore && (
          <EmotionalLoadMoreButton
            onClick={handleLoadMore}
            isLoading={loadingMore}
          />
        )}
      </div>
    );
  }

  // Render default (detailed) view
  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search your coupons..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Standard filter */}
      <CouponFilter
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        currentFilter={filterStatus}
        currentSort={sortBy}
        currentDirection={sortDirection}
      />

      {/* Coupon cards in grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon, index) => (
          <div
            key={`${coupon.id}-${index}`}
            className={`${ANIMATIONS.transition.medium} ${animateIn
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
              }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <CouponCard
              coupon={coupon}
              onRedeem={handleCouponRedeemed}
              onCopy={handleCouponCopied}
            />
          </div>
        ))}
      </div>

      {/* Standard load more button */}
      {hasMore && (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={loadingMore}
        />
      )}
    </div>
  );
};

export default CustomerCoupons;