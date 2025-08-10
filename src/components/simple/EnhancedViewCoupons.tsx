import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import EnhancedCouponCard, { CouponData } from './components/EnhancedCouponCard';
import EnhancedEmptyState from './components/EnhancedEmptyState';
import EnhancedFilterBar, { FilterOption } from './components/EnhancedFilterBar';
import EnhancedSearchBar from './components/EnhancedSearchBar';
import EnhancedCouponStatistics from './components/EnhancedCouponStatistics';
import EnhancedMascotGuide from './components/EnhancedMascotGuide';
import CelebrationEffects from './components/CelebrationEffects';
import SimpleLayout from '../../layouts/SimpleLayout';

// Sample data - in a real app, this would come from an API
const sampleCoupons: CouponData[] = [
  {
    id: '1',
    title: '10% OFF Any Purchase',
    description: 'Valid for all menu items',
    code: 'SAVE10',
    discount: '10%',
    validUntil: 'Dec 31, 2023',
    usageCount: 45,
    maxUses: 100,
    active: true,
    type: 'percentage'
  },
  {
    id: '2',
    title: 'Buy 1 Get 1 Free',
    description: 'On all beverages',
    code: 'BOGO2023',
    discount: 'Buy 1 Get 1',
    validUntil: 'Nov 15, 2023',
    usageCount: 78,
    maxUses: 150,
    active: true,
    type: 'buyXgetY'
  },
  {
    id: '3',
    title: 'Free Appetizer',
    description: 'With purchase of any main course',
    code: 'APPETIZER',
    discount: 'Free Item',
    validUntil: 'Oct 30, 2023',
    usageCount: 23,
    maxUses: 50,
    active: false,
    type: 'freeItem'
  },
  {
    id: '4',
    title: '$5 OFF Your Order',
    description: 'Minimum purchase of $25',
    code: 'FIVE4U',
    discount: '$5',
    validUntil: 'Dec 15, 2023',
    usageCount: 12,
    maxUses: 200,
    active: true,
    type: 'fixed'
  }
];

const EnhancedViewCoupons: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [coupons, setCoupons] = useState<CouponData[]>(sampleCoupons);
  const [filteredCoupons, setFilteredCoupons] = useState<CouponData[]>(sampleCoupons);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationType, setCelebrationType] = useState<'confetti' | 'sparkle' | 'bounce' | 'pulse' | 'none'>('confetti');
  const [celebrationMessage, setCelebrationMessage] = useState<string>('Success!');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Friend');

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // Simulate getting user name from auth context
    setTimeout(() => {
      setUserName('Alex');
    }, 1000);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Filter coupons based on active filter and search query
  useEffect(() => {
    let result = [...coupons];

    // Apply filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        result = result.filter(coupon => coupon.active);
      } else if (activeFilter === 'inactive') {
        result = result.filter(coupon => !coupon.active);
      } else if (activeFilter === 'expiring') {
        // This would normally check dates, but for demo we'll just show a subset
        result = result.filter(coupon =>
          coupon.active && coupon.validUntil.includes('Nov')
        );
      }
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(coupon =>
        coupon.title.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        coupon.code.toLowerCase().includes(query)
      );
    }

    setFilteredCoupons(result);
    setIsSearching(searchQuery !== '');
  }, [coupons, activeFilter, searchQuery]);

  // Filter options with enhanced icons
  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Coupons', icon: '🎟️' },
    { id: 'active', label: 'Active', icon: '✅' },
    { id: 'inactive', label: 'Inactive', icon: '⏸️' },
    { id: 'expiring', label: 'Expiring Soon', icon: '⏱️' }
  ];

  // Enhanced stats for the statistics component
  const stats = [
    {
      label: 'Active Coupons',
      value: coupons.filter(c => c.active).length,
      icon: '🎫',
      color: 'bg-green-100',
      change: {
        value: 10,
        isPositive: true
      }
    },
    {
      label: 'Total Redemptions',
      value: coupons.reduce((acc, curr) => acc + curr.usageCount, 0),
      icon: '🔄',
      color: 'bg-blue-100',
      change: {
        value: 5,
        isPositive: true
      }
    }
  ];

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Handle coupon selection
  const handleCouponSelect = (id: string) => {
    setSelectedCoupon(id === selectedCoupon ? null : id);

    // Show view celebration
    if (id !== selectedCoupon) {
      setCelebrationType('sparkle');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // Handle copy coupon code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);

    // Show copy celebration
    setCelebrationType('confetti');
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  };

  // Handle create new coupon
  const handleCreateCoupon = () => {
    navigate('/create-coupon');
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header with gradient background */}
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg relative overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 40 - 20],
                  y: [0, Math.random() * 40 - 20],
                }}
                transition={{
                  duration: 8 + Math.random() * 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="text-white mr-4 bg-white/20 rounded-full p-2"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            </div>

            <motion.h1 
              className="text-2xl font-bold flex-1 ml-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Manage Coupons
            </motion.h1>

            <motion.button
              onClick={handleCreateCoupon}
              className="bg-white/20 p-2 rounded-full"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.button>
          </div>

          {/* Personalized greeting */}
          <motion.div 
            className="mt-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <p className="text-white/80">{getGreeting()},</p>
            <h2 className="text-xl font-semibold">{userName}!</h2>
          </motion.div>

          {/* Summary stats in header */}
          <EnhancedCouponStatistics stats={stats} />
        </header>

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

              {/* Coupon list */}
              <LayoutGroup>
                {filteredCoupons.length > 0 ? (
                  <motion.div 
                    className="space-y-4 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence>
                      {filteredCoupons.map((coupon, index) => (
                        <motion.div
                          key={coupon.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <EnhancedCouponCard 
                            coupon={coupon}
                            onSelect={handleCouponSelect}
                            onCopy={handleCopyCode}
                            selected={selectedCoupon === coupon.id}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <EnhancedEmptyState 
                    title="No coupons found"
                    message={
                      searchQuery 
                        ? "We couldn't find any coupons matching your search. Try different keywords or clear filters." 
                        : "You don't have any coupons yet. Create your first coupon to start attracting customers!"
                    }
                    actionLabel="Create Coupon"
                    onAction={handleCreateCoupon}
                  />
                )}
              </LayoutGroup>
            </div>

            {/* Action Button */}
            <div className="p-4 border-t border-gray-100">
              <motion.button
                onClick={handleCreateCoupon}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-xl shadow-md"
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
          message={celebrationMessage}
        />
      </div>
    );
  };

  // On mobile, render directly; on desktop, wrap with SimpleLayout
  return isMobile ? renderContent() : <SimpleLayout>{renderContent()}</SimpleLayout>;
};

export default EnhancedViewCoupons;