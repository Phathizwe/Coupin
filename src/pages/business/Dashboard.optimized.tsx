import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coupon } from '../../types';
import InvitationsChecker from '../../components/dashboard/InvitationsChecker';
import { SimpleDashboard } from '../../components/dashboard';
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

// Lazy load non-critical components
const ValuePropositionCards = lazy(() => import('../../components/dashboard/ValuePropositionCards'));
const ValueReminderComponent = lazy(() => import('../../components/dashboard/ValueReminderComponent'));
const CreateCouponModal = lazy(() => import('../../components/coupons').then(module => ({ default: module.CreateCouponModal })));

// Create cache instance
const cache = new CacheManager();

// Define MascotState type here to avoid import issues
type MascotStateType = 'welcoming' | 'celebrating' | 'encouraging' | 'grateful';

// Empty interface since we're not using props anymore
interface DashboardProps { }

// Define the interface for emotional elements props
interface EmotionalElementsProps {
  showCelebration: boolean;
  mascotState: MascotStateType;
  achievementUnlocked: boolean;
  interactionCount: number;
}

const BusinessDashboard: React.FC<DashboardProps> = () => {
  // Performance tracking
  const startTime = performance.now();

  // Get viewMode from context with a fallback to prevent errors
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';

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

  // Emotional design states - initialized but loaded on demand
  const [showCelebration, setShowCelebration] = useState(false);
  const [mascotState, setMascotState] = useState<MascotStateType>('welcoming');
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showEmotionalElements, setShowEmotionalElements] = useState(false);

  // Load dashboard data with optimizations
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const businessId = user.businessId;

        // Try to get stats from cache first
        const cacheKey = `dashboard_stats_${businessId}`;
        const cachedStats = await cache.get<DashboardStats>(cacheKey);

        let dashboardStats: DashboardStats;

        if (cachedStats) {
          performanceMonitor.trackCacheHit(cacheKey);
          dashboardStats = cachedStats;
          setStats(cachedStats);

          // Load fresh data in the background
          fetchDashboardStatsOptimized(businessId).then(freshStats => {
            setStats(freshStats);
            cache.set(cacheKey, freshStats, 5 * 60 * 1000); // 5 minute cache
          });
        } else {
          // No cache, fetch with optimized query
          const queryStartTime = performance.now();
          dashboardStats = await fetchDashboardStatsOptimized(businessId);
          performanceMonitor.trackQueryPerformance('dashboard_stats', queryStartTime, performance.now());

          setStats(dashboardStats);
          cache.set(cacheKey, dashboardStats, 5 * 60 * 1000); // 5 minute cache
        }

        // Fetch onboarding status (lightweight query)
        const onboardingCacheKey = `onboarding_${businessId}`;
        const cachedOnboarding = await cache.get<{
          hasCreatedCoupons: boolean;
          hasCompletedProfile: boolean;
          hasSharedCoupons: boolean;
        }>(onboardingCacheKey);

        if (cachedOnboarding) {
          setOnboardingStatus(cachedOnboarding);
        } else {
          const status = await checkOnboardingStatus(businessId);
          setOnboardingStatus(status);
          cache.set(onboardingCacheKey, status, 30 * 60 * 1000); // 30 minute cache
        }

        // Set hasCustomers based on stats instead of separate query
        setHasCustomers(dashboardStats?.totalCustomers ? dashboardStats.totalCustomers > 0 : false);

        setError(null);

        // Load emotional elements only after critical data is displayed
        setTimeout(() => {
          setShowEmotionalElements(true);
        }, 500);

      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
        const endTime = performance.now();
        performanceMonitor.trackQueryPerformance('dashboard_total_load', startTime, endTime);
      }
    };

    loadDashboardData();
  }, [user?.businessId]);

  // Lazy load emotional components only when needed
  useEffect(() => {
    if (showEmotionalElements && stats) {
      // Only load emotional elements if we have stats and after initial render
      const hasAchievements = stats.totalRedemptions > 0 || stats.loyalCustomers > 0;

      if (hasAchievements) {
        // Simply set the state directly without trying to access MascotStates
        setMascotState('celebrating');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [showEmotionalElements, stats]);

  const handleOpenCreateModal = (templateKey?: CouponTemplateKey) => {
    if (templateKey) {
      setSelectedTemplate(couponTemplates[templateKey]);
    } else {
      setSelectedTemplate(null);
    }
    setIsCreateModalOpen(true);
    setInteractionCount(prev => prev + 1);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleCouponCreated = (coupon: Coupon) => {
    // Update local state to reflect the achievement
    setOnboardingStatus(prev => ({ ...prev, hasCreatedCoupons: true }));

    // Invalidate cache to ensure fresh data on next load
    cache.invalidate(`dashboard_stats_${user?.businessId}`);

    // Navigate to the coupons page to see the newly created coupon
    navigate('/business/coupons');

    // Load emotional feedback only when needed
    if (!showEmotionalElements) {
      setShowEmotionalElements(true);

      // Lazy load emotional feedback
      import('../../components/dashboard/feedback/EmotionalFeedback').then(module => {
        const { EmotionalFeedback } = module;
        EmotionalFeedback.success('Thank you! Your coupon will bring value back to your business');
      });
    }
  };

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render the simple dashboard if viewMode is 'simple'
  if (viewMode === 'simple') {
    return <SimpleDashboard />;
  }

  // Otherwise render the default dashboard with our new components
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Add the InvitationsChecker component to show pending invitations */}
      {user?.businessId && <InvitationsChecker />}

      {/* Enhanced Welcome Banner */}
      <div className="mb-8">
        <ErrorBoundary>
          <WelcomeBanner
            businessName={businessProfile?.businessName || 'Your Business'}
            hasCoupons={onboardingStatus.hasCreatedCoupons}
            hasCustomers={hasCustomers}
            onCreateCoupon={() => handleOpenCreateModal()}
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

      {/* Quick Actions Component */}
      <QuickActionsComponent onCreateCoupon={handleOpenCreateModal} />

      {/* Lazy loaded non-critical components */}
      <Suspense fallback={<div className="h-10"></div>}>
        <ValuePropositionCards />
      </Suspense>

      <Suspense fallback={<div className="h-10"></div>}>
        <ValueReminderComponent />
      </Suspense>

      {/* Create Coupon Modal - lazy loaded */}
      {isCreateModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">Loading...</div>}>
          <CreateCouponModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onCouponCreated={handleCouponCreated}
            templateData={selectedTemplate?.data}
            templateType={selectedTemplate?.type}
          />
        </Suspense>
      )}

      {/* Emotional elements loaded conditionally */}
      {showEmotionalElements && (
        <Suspense fallback={null}>
          <EmotionalElements
            showCelebration={showCelebration}
            mascotState={mascotState}
            achievementUnlocked={achievementUnlocked}
            interactionCount={interactionCount}
          />
        </Suspense>
      )}
    </div>
  );
};

// Separate component for emotional elements to allow lazy loading
const EmotionalElements = lazy(() =>
  import('../../components/dashboard/animations/DashboardAnimations').then(module => {
    return {
      default: (props: EmotionalElementsProps) => {
        const { CelebrationOverlay, AchievementNotification, Mascot } = module;
        // Use a default color if BRAND_COLORS is not available
        const colors = [
          '#4F46E5', // primary
          '#10B981', // secondary
          '#F59E0B', // accent
          '#ffffff'  // white
        ];

        return (
          <>
            <CelebrationOverlay
              show={props.showCelebration}
              colors={colors}
            />
            <AchievementNotification
              show={props.achievementUnlocked}
              title="Achievement Unlocked!"
              message="You created your first coupon"
            />
            <Mascot
              state={props.mascotState as any} // Use type assertion to bypass the type check
              interactionCount={props.interactionCount}
            />
          </>
        );
      }
    };
  })
);

export default BusinessDashboard;