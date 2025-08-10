import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleLayout from '../../layouts/SimpleLayout';
import CelebrationEffects from './components/CelebrationEffects';
import EnhancedFilterBar from './components/EnhancedFilterBar';
import EnhancedSearchBar from './components/EnhancedSearchBar';
import EnhancedMascotGuide from './components/EnhancedMascotGuide';
import EmotionalViewCouponsHeader from './components/EmotionalViewCouponsHeader';
import EmotionalCouponList from './components/EmotionalCouponList';
import EnhancedCouponCard from './components/EnhancedCouponCard';
import { CouponData, CouponActionType, FilterOption, CouponStatistic, TimeOfDay } from './types/EmotionalViewCouponsTypes';
import { 
  mapActionToCelebrationType, 
  getCelebrationMessage, 
  filterCoupons,
  getCurrentTimeOfDay
} from './utils/emotionalCouponUtils';
import { fetchCouponsForBusiness } from './services/couponFetchService';

const EmotionalViewCoupons: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<CouponData[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationAction, setCelebrationAction] = useState<CouponActionType>('copy');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Friend');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [businessId, setBusinessId] = useState<string>('');
  
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
  
  // Fetch coupons from Firestore
  useEffect(() => {
    const loadCoupons = async () => {
      const couponsList = await fetchCouponsForBusiness(businessId);
      // Ensure the type is correct before setting state
      setCoupons(couponsList as CouponData[]);
      setFilteredCoupons(couponsList as CouponData[]);
    };
    
    loadCoupons();
  }, [businessId]);
  
  // Filter coupons based on active filter and search query
  useEffect(() => {
    const result = filterCoupons(coupons, activeFilter, searchQuery);
    setFilteredCoupons(result);
    setIsSearching(searchQuery !== '');
  }, [coupons, activeFilter, searchQuery]);
  
  // Filter options
  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Coupons', icon: '🎟️' },
    { id: 'active', label: 'Active', icon: '✅' },
    { id: 'inactive', label: 'Inactive', icon: '⏸️' },
    { id: 'expiring', label: 'Expiring Soon', icon: '⏱️' }
  ];
  
  // Calculate stats for the statistics component
  const stats: CouponStatistic[] = [
    {
      label: 'Active Coupons',
      value: coupons.filter(c => c.active).length,
      icon: '🎫',
      color: 'bg-teal-100',
      change: {
        value: 0,
        isPositive: true
      }
    },
    {
      label: 'Total Redemptions',
      value: coupons.reduce((acc, curr) => acc + curr.usageCount, 0),
      icon: '🔄',
      color: 'bg-indigo-100',
      change: {
        value: 0,
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
        <EmotionalViewCouponsHeader 
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
              <EnhancedSearchBar 
                onSearch={setSearchQuery}
                placeholder="Search by name or code..."
              />

              <EnhancedFilterBar 
                filters={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                showExpandedByDefault={false}
              />

              {/* Coupon list component */}
              <EmotionalCouponList 
                coupons={filteredCoupons}
                selectedCoupon={selectedCoupon}
                onSelectCoupon={handleCouponSelect}
                onCopyCode={handleCopyCode}
                onCreateCoupon={handleCreateCoupon}
                searchQuery={searchQuery}
              />
            </div>

            {/* Action Button */}
            <div className="p-4 border-t border-gray-100">
              <motion.button
                onClick={handleCreateCoupon}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-lg font-bold rounded-xl shadow-md"
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  backgroundPosition: ["0%", "100%"]
                }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  backgroundPosition: { duration: 0.8, ease: "easeInOut" }
                }}
              >
                CREATE NEW COUPON
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mascot guide */}
        <EnhancedMascotGuide 
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

export default EmotionalViewCoupons;