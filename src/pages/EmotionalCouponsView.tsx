import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '../layouts/DashboardLayout';
import CouponMascot from '../components/emotional/CouponMascot';
import CouponsList from '../components/emotional/CouponsList';
import CouponStats from '../components/emotional/CouponStats';
import CouponFilters from '../components/emotional/CouponFilters';
import CelebrationEffect from '../components/emotional/CelebrationEffect';
import PersonalizedTips from '../components/emotional/PersonalizedTips';
import { useCoupons } from '../hooks/useCoupons';
import { useUser } from '../hooks/useUser';

const EmotionalCouponsView: React.FC = () => {
  // Get view mode from dashboard context
  const dashboardContext = useDashboardContext();
  const viewMode = dashboardContext?.viewMode || 'default';
  const navigate = useNavigate();
  
  const { coupons, loading, error } = useCoupons();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'confetti' | 'sparkle' | 'achievement'>('confetti');
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'helping'>('happy');
  const [mascotMessage, setMascotMessage] = useState('');
  const [showMascot, setShowMascot] = useState(true); // New state to control mascot visibility

  // Calculate stats for progress indicators
  const activeCouponsCount = coupons?.filter(coupon => coupon.status === 'active').length || 0;
  const sentCouponsCount = coupons?.reduce((total, coupon) => total + (coupon.sent || 0), 0) || 0;
  const usedCouponsCount = coupons?.reduce((total, coupon) => total + (coupon.usage?.used || 0), 0) || 0;
  
  // Filter coupons based on search and filter type
  const filteredCoupons = coupons?.filter(coupon => {
    const matchesSearch = coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && coupon.status === filterType;
  }) || [];

  // Update mascot mood and message based on user actions and data
  useEffect(() => {
    if (loading) {
      setMascotMood('helping');
      setMascotMessage('Loading your coupons...');
    } else if (error) {
      setMascotMood('helping');
      setMascotMessage('Oops! Something went wrong. Let me help you fix that!');
    } else if (coupons?.length === 0) {
      setMascotMood('excited');
      setMascotMessage('Ready to create your first coupon? Click the button above to get started!');
    } else if (activeCouponsCount > 5) {
      setMascotMood('excited');
      setMascotMessage('Wow! You have so many active coupons. Your customers must love you!');
    } else {
      setMascotMood('happy');
      setMascotMessage(`Welcome back! You have ${activeCouponsCount} active coupons ready to delight customers.`);
    }
    
    // Auto-hide the welcome message and mascot after 5 seconds
    if (!loading && !error) {
      const timer = setTimeout(() => {
        setShowMascot(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [coupons, loading, error, activeCouponsCount]);

  // Trigger celebration when certain milestones are reached
  useEffect(() => {
    const checkMilestones = () => {
      // First-time user with coupons
      if (coupons?.length === 1 && !localStorage.getItem('firstCouponCelebration')) {
        setCelebrationType('confetti');
        setShowCelebration(true);
        localStorage.setItem('firstCouponCelebration', 'true');
        return;
      }
      
      // Milestone: 10 sent coupons
      if (sentCouponsCount === 10 && !localStorage.getItem('tenSentCouponsCelebration')) {
        setCelebrationType('achievement');
        setShowCelebration(true);
        localStorage.setItem('tenSentCouponsCelebration', 'true');
        return;
      }
      
      // Milestone: 5 used coupons
      if (usedCouponsCount === 5 && !localStorage.getItem('fiveUsedCouponsCelebration')) {
        setCelebrationType('sparkle');
        setShowCelebration(true);
        localStorage.setItem('fiveUsedCouponsCelebration', 'true');
      }
    };
    
    checkMilestones();
  }, [coupons, sentCouponsCount, usedCouponsCount]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setFilterType(filter);
  };

  const handleCouponAction = (action: string) => {
    // Show different mascot reactions based on user actions
    switch (action) {
      case 'create':
        setMascotMood('excited');
        setMascotMessage('Great job creating a new coupon! Your customers will love it!');
        setCelebrationType('confetti');
        setShowCelebration(true);
        setShowMascot(true); // Show mascot when there's an action
        break;
      case 'edit':
        setMascotMood('happy');
        setMascotMessage('Nice update! Your coupon looks even better now.');
        setShowMascot(true); // Show mascot when there's an action
        break;
      case 'share':
        setMascotMood('excited');
        setMascotMessage('Sharing is caring! Your customers will appreciate this special offer.');
        setCelebrationType('sparkle');
        setShowCelebration(true);
        setShowMascot(true); // Show mascot when there's an action
        break;
      case 'delete':
        setMascotMood('helping');
        setMascotMessage('Coupon removed! Need help creating a new one?');
        setShowMascot(true); // Show mascot when there's an action
        break;
      default:
        break;
    }
    
    // Auto-hide celebration after 3 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
    
    // Auto-hide mascot after 5 seconds
    setTimeout(() => {
      setShowMascot(false);
    }, 5000);
  };

  // Handle back button click in simple mode
  const handleBackClick = () => {
    navigate('/business/dashboard');
  };

  return (
    <motion.div 
      className="p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        {/* Add back button when in simple mode */}
        {viewMode === 'simple' && (
          <button
            onClick={handleBackClick}
            className="text-gray-600 hover:text-gray-800 mr-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">Manage Coupons</h1>
        <button 
          onClick={() => handleCouponAction('create')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Create New Coupon
        </button>
      </div>
      
      {/* Mascot that reacts to user actions - only show if showMascot is true */}
      {showMascot && (
        <div className="fixed top-20 right-6 z-50">
          <CouponMascot 
            mood={mascotMood} 
            message={mascotMessage} 
          />
        </div>
      )}
      
      {/* Stats cards showing progress - only show in detailed view */}
      {viewMode === 'default' && (
        <CouponStats 
          activeCoupons={activeCouponsCount}
          sentCoupons={sentCouponsCount}
          usedCoupons={usedCouponsCount}
          totalCoupons={coupons?.length || 0}
        />
      )}
      
      {/* Personalized tips - only show in detailed view */}
      {viewMode === 'default' && (
        <PersonalizedTips 
          couponsCount={coupons?.length || 0}
          activeCouponsCount={activeCouponsCount}
        />
      )}
      
      {/* Search and filters */}
      <CouponFilters 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        currentFilter={filterType}
        totalCount={coupons?.length || 0}
        filteredCount={filteredCoupons.length}
      />
      
      {/* Coupons list with animations */}
      <CouponsList 
        coupons={filteredCoupons}
        loading={loading}
        onCouponAction={handleCouponAction}
        viewMode={viewMode === 'simple' ? 'simple' : 'detailed'}
      />
      
      {/* Celebration effects */}
      <CelebrationEffect 
        type={celebrationType}
        isVisible={showCelebration}
      />
    </motion.div>
  );
};

export default EmotionalCouponsView;
export { EmotionalCouponsView as Coupons };