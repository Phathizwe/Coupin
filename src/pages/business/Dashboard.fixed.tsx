import React, { useState, useEffect, Suspense, lazy, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coupon } from '../../types';
import InvitationsChecker from '../../components/dashboard/InvitationsChecker';
import { SimpleDashboard } from '../../components/dashboard'; // Correct named import
import { useAuth } from '../../hooks/useAuth';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { CacheManager } from '../../services/firestore/cache/cacheManager';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatsGridComponent from '../../components/dashboard/StatsGridComponent';
import QuickActionsComponent from '../../components/dashboard/QuickActionsComponent';
import { fetchDashboardStats, fetchDashboardStatsOptimized, DashboardStats } from '../../services/dashboardStatsService';
import { checkOnboardingStatus } from '../../services/businessOnboardingService';
import { couponTemplates, CouponTemplateKey } from '../../components/coupons/templates/CouponTemplates';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { BRAND_COLORS } from '../../constants/theme'; // Import BRAND_COLORS
// Import animation components directly with named imports
import { 
  CelebrationOverlay, 
  AchievementNotification, 
  Mascot, 
  MascotStates 
} from '../../components/dashboard/animations/DashboardAnimations';

// Import modular components
const ValuePropositionCards = lazy(() => import('../../components/dashboard/ValuePropositionCards'));
const ValueReminderComponent = lazy(() => import('../../components/dashboard/ValueReminderComponent'));
const CreateCouponModal = lazy(() => import('../../components/coupons/CreateCouponModal'));

// Empty interface since we're not using props anymore
interface DashboardProps { }

const BusinessDashboard: React.FC<DashboardProps> = () => {
  console.log('Dashboard component rendering');

  // Get viewMode from context with a fallback to prevent errors
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';
  console.log('Dashboard view mode:', viewMode);

  // State for modal and template
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    type: string;
    data: Partial<Coupon>;
  } | null>(null);

  const navigate = useNavigate();
  const { user, businessProfile, isLoading: authLoading } = useAuth();

  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState({
    hasCreatedCoupons: false,
    hasCompletedProfile: false,
    hasSharedCoupons: false
  });
  const [hasCustomers, setHasCustomers] = useState(false);

  // Emotional design states
  const [showCelebration, setShowCelebration] = useState(false);
  const [mascotState, setMascotState] = useState<keyof typeof MascotStates>('welcoming');
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.businessId) {
        console.log('No business ID available, skipping data load');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading dashboard data for business:', user.businessId);
        setLoading(true);

        // Fetch dashboard stats optimized
        const dashboardStats = await fetchDashboardStatsOptimized(user.businessId);
        console.log('Dashboard stats loaded:', dashboardStats);
        setStats(dashboardStats);

        // Check onboarding status
        const status = await checkOnboardingStatus(user.businessId);
        console.log('Onboarding status:', status);
        setOnboardingStatus(status);

        // Check if business has customers - using a safer approach
        let hasCustomersValue = false;
        try {
          // Check if the method exists on the CacheManager prototype
          const cacheManagerAny = CacheManager as any;
          if (cacheManagerAny && typeof cacheManagerAny.hasCustomers === 'function') {
            hasCustomersValue = await cacheManagerAny.hasCustomers(user.businessId);
          } else {
            // Fallback if method doesn't exist
            console.warn('CacheManager.hasCustomers method not available');
          }
        } catch (err) {
          console.error('Error checking customers:', err);
        }
        
        console.log('Has customers:', hasCustomersValue);
        setHasCustomers(hasCustomersValue);

        setError(null);

        // Emotional design: Celebrate if there are stats to show
        if (dashboardStats && (dashboardStats.totalRedemptions > 0 || dashboardStats.loyalCustomers > 0)) {
          setTimeout(() => {
            setMascotState('celebrating');
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }, 1000);
        } else {
          setMascotState('encouraging');
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
        setMascotState('encouraging'); // Show encouraging mascot on error
      } finally {
        setLoading(false);
      }
    };

    // Call loadDashboardData directly without using trackPromise
    loadDashboardData();
    
  }, [user?.businessId]);

  const handleOpenCreateModal = (templateKey?: CouponTemplateKey) => {
    if (templateKey) {
      setSelectedTemplate(couponTemplates[templateKey]);
    } else {
      setSelectedTemplate(null);
    }
    setIsCreateModalOpen(true);

    // Emotional design: Track interaction and show mascot encouragement
    setInteractionCount(prev => prev + 1);
    setMascotState('encouraging');
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleCouponCreated = (coupon: Coupon) => {
    // Emotional design: Show celebration and update mascot
    setMascotState('celebrating');
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      // After celebration, show gratitude
      setMascotState('grateful');
    }, 3000);

    // Check if this is the first coupon created (achievement)
    if (!onboardingStatus.hasCreatedCoupons) {
      setAchievementUnlocked(true);
      setTimeout(() => setAchievementUnlocked(false), 5000);

      // Update local state to reflect the achievement
      setOnboardingStatus(prev => ({ ...prev, hasCreatedCoupons: true }));
    }

    // Navigate to the coupons page to see the newly created coupon
    navigate('/business/coupons');
  };

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-600 animate-pulse">Loading your dashboard experience...</p>
      </div>
    );
  }

  // Render the simple dashboard if viewMode is 'simple'
  if (viewMode === 'simple') {
    console.log('Rendering simple dashboard');
    return <SimpleDashboard />;
  }

  // Otherwise render the default dashboard with our new components
  console.log('Rendering default dashboard');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Add the InvitationsChecker component to show pending invitations */}
      {user?.businessId && <InvitationsChecker />}

      <Suspense fallback={<div>Loading...</div>}>
        {/* Main content with animations */}
        <div>
          {/* Celebration overlay for achievements */}
          <CelebrationOverlay
            show={showCelebration}
            colors={[
              BRAND_COLORS.primary[500],
              BRAND_COLORS.secondary[500],
              BRAND_COLORS.accent.DEFAULT,
              '#ffffff'
            ]}
          />

          {/* Achievement notification */}
          <AchievementNotification
            show={achievementUnlocked}
            title="Achievement Unlocked!"
            message="You created your first coupon"
          />

          {/* TYCA Mascot */}
          <Mascot
            state={mascotState}
            interactionCount={interactionCount}
          />

          {/* Enhanced Welcome Banner */}
          <div className="mb-8">
            <ErrorBoundary>
              <WelcomeBanner
                businessName={businessProfile?.businessName || 'Your Business'}
                hasCoupons={onboardingStatus.hasCreatedCoupons}
                hasCustomers={hasCustomers}
                onCreateCoupon={() => handleOpenCreateModal()}
                className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
              />
            </ErrorBoundary>
          </div>

          {/* Stats Grid Component */}
          {user?.businessId && (
            <StatsGridComponent
              businessId={user.businessId}
              stats={stats}
              loading={loading}
              error={error}
              onboardingStatus={onboardingStatus}
            />
          )}

          {/* Value Proposition Cards */}
          <ValuePropositionCards />

          {/* Quick Actions Component */}
          <QuickActionsComponent onCreateCoupon={handleOpenCreateModal} />

          {/* Value Reminder Component */}
          <ValueReminderComponent />

          {/* Create Coupon Modal */}
          <CreateCouponModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onCouponCreated={handleCouponCreated}
            templateData={selectedTemplate?.data}
            templateType={selectedTemplate?.type}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default BusinessDashboard;