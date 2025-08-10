import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleLayout from '../../layouts/SimpleLayout';
import CelebrationEffects from './components/CelebrationEffects';
import TYCAFilterBar from './components/TYCAFilterBar';
import TYCASearchBar from './components/TYCASearchBar';
import TYCAMascotGuide from './components/TYCAMascotGuide';
import TYCAViewCouponsHeader from './components/TYCAViewCouponsHeader';
import TYCACouponList from './components/TYCACouponList';
import { CouponActionType, FilterOption, CouponStatistic, TimeOfDay, CouponData } from './types/TYCATypes';
import { 
  mapActionToCelebrationType, 
  getCelebrationMessage, 
  filterCoupons,
  getCurrentTimeOfDay
} from './utils/couponUtils';
import { BRAND_MESSAGES } from '../../constants/brandConstants';
import { getCoupons } from '../../services/couponService'; // Import the getCoupons function
import LoadingState from './components/LoadingState'; // Import LoadingState component

// Define a type for the coupons that matches the TYCACouponList expectations
type SimplifiedCoupon = {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  validUntil: string;
  usageCount: number;
  maxUses: number;
  active: boolean;
  type: 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem';
  [key: string]: any; // Allow for additional properties
};

const TYCAViewCoupons: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [coupons, setCoupons] = useState<SimplifiedCoupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<SimplifiedCoupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationAction, setCelebrationAction] = useState<CouponActionType>('copy');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Friend');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [businessId, setBusinessId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on mobile and set time of day
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // Get user name from localStorage or auth context
    const storedUserName = localStorage.getItem('userName') || 'Friend';
    setUserName(storedUserName);

    // Get business ID from localStorage or auth context
    const storedBusinessId = localStorage.getItem('businessId') || 'default-business-id';
    setBusinessId(storedBusinessId);

    // Set time of day for personalized greeting
    setTimeOfDay(getCurrentTimeOfDay());
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch coupons when businessId changes
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!businessId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching coupons for business:', businessId);
        const fetchedCoupons = await getCoupons(businessId);
        console.log('Fetched coupons:', fetchedCoupons);
        
        // Transform the fetched coupons to match the expected format
        const transformedCoupons = fetchedCoupons.map(coupon => ({
          id: coupon.id,
          title: coupon.title,
          description: coupon.description,
          code: coupon.code,
          discount: typeof coupon.value === 'number' 
            ? `${coupon.type === 'percentage' ? coupon.value + '%' : '$' + coupon.value}` 
            : 'Special offer',
          validUntil: coupon.endDate instanceof Date 
            ? coupon.endDate.toLocaleDateString() 
            : new Date(coupon.endDate?.seconds * 1000 || Date.now()).toLocaleDateString(),
          usageCount: coupon.usageCount || 0,
          maxUses: coupon.usageLimit || 100,
          active: coupon.active,
          type: coupon.type || 'percentage'
        })) as SimplifiedCoupon[];
        
        setCoupons(transformedCoupons);
        setFilteredCoupons(transformedCoupons);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Failed to load coupons. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [businessId]);

  // Filter coupons based on active filter and search query
  useEffect(() => {
    const result = filterCoupons(coupons, activeFilter, searchQuery);
    setFilteredCoupons(result);
    setIsSearching(searchQuery !== '');
  }, [coupons, activeFilter, searchQuery]);

  // Filter options with TYCA-themed icons
  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Coupons', icon: '🎟️' },
    { id: 'active', label: 'Active', icon: '✅' },
    { id: 'inactive', label: 'Inactive', icon: '⏸️' },
    { id: 'expiring', label: 'Expiring Soon', icon: '⏱️' }
  ];

  // Enhanced stats for the statistics component
  const stats: CouponStatistic[] = [
    {
      label: 'Active Coupons',
      value: coupons.filter(c => c.active).length,
      icon: '🎫',
      color: 'bg-purple-100',
      change: {
        value: 10,
        isPositive: true
      }
    },
    {
      label: 'Total Redemptions',
      value: coupons.reduce((acc, curr) => acc + (curr.usageCount || 0), 0),
      icon: '🔄',
      color: 'bg-blue-100',
      change: {
        value: 5,
        isPositive: true
      }
    }
  ];
  // Handle coupon selection
  const handleCouponSelect = (id: string) => {
    setSelectedCoupon(id === selectedCoupon ? null : id);
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Show a subtle celebration when viewing details
    if (id !== selectedCoupon) {
      setCelebrationAction('view');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    }
  };

  // Handle copy coupon code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);

    // Show celebration
    setCelebrationAction('copy');
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  };

  // Handle create new coupon
  const handleCreateCoupon = () => {
    navigate('/create-coupon');
  };

  // Map the action type to celebration type for the CelebrationEffects component
  const celebrationType = mapActionToCelebrationType(celebrationAction);

  const renderContent = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header Component */}
        <TYCAViewCouponsHeader 
          userName={userName}
          timeOfDay={timeOfDay}
          stats={stats}
          onCreateCoupon={handleCreateCoupon}
        />
        {/* Main content - shifted up to overlap with header */}
        <div className="flex-1 -mt-6">
          <div className="bg-white rounded-t-3xl shadow-lg h-full flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Search and filters */}
              <TYCASearchBar
                onSearch={setSearchQuery}
                placeholder="Search by name or code..."
              />

              <TYCAFilterBar
                filters={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                showExpandedByDefault={false}
              />

              {/* Show loading state or error if applicable */}
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                /* Coupon list component */
                <TYCACouponList 
                  coupons={filteredCoupons}
                  selectedCoupon={selectedCoupon}
                  onSelectCoupon={handleCouponSelect}
                  onCopyCode={handleCopyCode}
                  onCreateCoupon={handleCreateCoupon}
                  searchQuery={searchQuery}
                />
              )}
            </div>

            {/* Action Button with TYCA brand colors - using green to match the dashboard */}
            <div className="p-4 border-t border-gray-100">
              <motion.button
                onClick={handleCreateCoupon}
                className="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-xl shadow-md"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#16a34a" // green-600
                }}
                whileTap={{ scale: 0.98 }}
              >
                {BRAND_MESSAGES.cta.standard}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mascot guide */}
        <TYCAMascotGuide
          couponsCount={filteredCoupons.length}
          activeFilter={activeFilter}
          isSearching={isSearching}
        />

        {/* Celebration effects */}
        <CelebrationEffects
          show={showCelebration}
          type={celebrationType}
          message={getCelebrationMessage(celebrationAction)}
        />
      </div>
    );
  };

  // On mobile, render directly; on desktop, wrap with SimpleLayout
  return isMobile ? renderContent() : <SimpleLayout>{renderContent()}</SimpleLayout>;
};

export default TYCAViewCoupons;