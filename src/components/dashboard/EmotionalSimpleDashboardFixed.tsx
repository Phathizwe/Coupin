import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardStatsService';
import EmotionalActionButtons from '../simple/components/EmotionalActionButtons';
import EmotionalStatsSection from '../simple/components/EmotionalStatsSection';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';

// Remove framer-motion imports and use simple CSS transitions instead

const EmotionalSimpleDashboardFixed: React.FC = () => {
  const { user, businessProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize welcome popup state based on session storage
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcomePopup');
    if (!hasShownWelcome) {
      console.log("Showing welcome popup");
      setShowWelcomeAnimation(true);
      // Mark that we've shown the welcome popup in this session
      sessionStorage.setItem('hasShownWelcomePopup', 'true');

      // Hide welcome animation after 3 seconds
      const timer = setTimeout(() => {
        console.log("Hiding welcome popup after timeout");
        setShowWelcomeAnimation(false);
      }, 3000);

      return () => {
        console.log("Clearing welcome popup timeout");
        clearTimeout(timer);
      };
    }
  }, []);

  // Add a manual close function for the popup
  const closeWelcomePopup = () => {
    console.log("Manually closing welcome popup");
    setShowWelcomeAnimation(false);
  };

  // Fetch dashboard stats
  useEffect(() => {
    // Don't fetch stats if auth is still loading
    if (authLoading) {
      return;
    }

    const loadStats = async () => {
      if (!user?.businessId) {
        console.log("No business ID available, setting default stats");
        setStats({
          activeCoupons: 0,
          totalRedemptions: 0,
          loyalCustomers: 0,
          revenueGenerated: 0
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching stats for business ID:", user.businessId);
        // Use a try-catch block to handle any errors from fetchDashboardStats
        const dashboardStats = await fetchDashboardStats(user.businessId);
        console.log("Dashboard stats fetched:", dashboardStats);
        setStats(dashboardStats);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError("Could not load dashboard data. Please try again later.");
        // Set default empty stats on error
        setStats({
          activeCoupons: 0,
          totalRedemptions: 0,
          loyalCustomers: 0,
          revenueGenerated: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.businessId, authLoading]);

  // Define the buttons data with emotionally engaging copy (memoized to prevent re-renders)
  const actionButtons = useMemo(() => [
    {
      label: "MAKE COUPON",
      description: "Create a special offer your customers will love",
      path: "/business/coupons/create",
      icon: "gift",
      bgColor: "from-amber-400 to-amber-500",
      hoverEffect: "hover:shadow-amber-300/50",
      textColor: "text-amber-900"
    },
    {
      label: "SCAN COUPON",
      description: "Welcome back your loyal customers",
      path: "/business/scan",
      icon: "qrcode",
      bgColor: "from-emerald-400 to-emerald-500",
      hoverEffect: "hover:shadow-emerald-300/50",
      textColor: "text-emerald-900"
    },
    {
      label: "SEE RESULTS",
      description: "Celebrate your business growth",
      path: "/business/results/simple",
      icon: "chart-bar",
      bgColor: "from-rose-400 to-rose-500",
      hoverEffect: "hover:shadow-rose-300/50",
      textColor: "text-rose-900"
    },
    {
      label: "LOYALTY PROGRAM",
      description: "Keep customers coming back with rewards",
      path: "/business/loyalty",
      icon: "star",
      bgColor: "from-purple-400 to-purple-500",
      hoverEffect: "hover:shadow-purple-300/50",
      textColor: "text-purple-900"
    },
    {
      label: "SETTINGS",
      description: "Manage your business profile and preferences",
      path: "/business/settings/simple",
      icon: "cog",
      bgColor: "from-slate-400 to-slate-500",
      hoverEffect: "hover:shadow-slate-300/50",
      textColor: "text-slate-900"
    }
  ], []);

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user's first name for greeting
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return businessProfile?.businessName || 'there';
  };

  // Get encouraging message based on stats
  const getEncouragingMessage = () => {
    if (!stats) return "Ready to build customer relationships today?";

    if (stats.totalRedemptions > 0) {
      return "Your customers are loving your offers!";
    } else if (stats.activeCoupons > 0) {
      return "Your offers are ready to delight customers!";
    } else {
      return "Create your first offer and watch your business grow!";
    }
  };

  // Helper function to convert Timestamp to Date
  const convertToDate = (timestamp: Date | Timestamp): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // If it's a Firestore Timestamp, convert to Date
    if (timestamp && typeof timestamp.toDate === 'function') {
      try {
        return timestamp.toDate();
      } catch (err) {
        console.error("Error converting timestamp:", err);
        return new Date();
      }
    }
    return new Date();
  };

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-amber-50 to-white max-w-3xl mx-auto animate-fadeIn">
      {/* Warm, welcoming header with personalized greeting */}
      <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg">
        <div className="animate-slideDown">
          <h2 className="text-lg font-medium opacity-90">{getGreeting()}</h2>
          <h1 className="text-2xl font-bold mt-1 flex items-center animate-scaleIn">
            Hi, {getUserName()}!
            <span className="ml-2 animate-wave">👋</span>
          </h1>

          <p className="mt-2 text-amber-100 font-medium animate-fadeIn">
            {getEncouragingMessage()}
          </p>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-sm animate-pulse">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white/30 rounded-full mb-1"></div>
                    <div className="h-2 bg-white/30 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-white/30 rounded w-6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmotionalStatsSection
              activeCoupons={stats?.activeCoupons || 0}
              totalRedemptions={stats?.totalRedemptions || 0}
              loyalCustomers={stats?.loyalCustomers || 0}
            />
          )}
        </div>
      </div>

      {/* Main content with emotionally engaging buttons */}
      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 transform translate-y-0 opacity-100 transition-all duration-500 ease-out animate-slideUp">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">What would you like to do today?</h2>
          <EmotionalActionButtons buttons={actionButtons} />
        </div>

        {/* Recent Activity Section transformed into "Customer Connections" */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-5 transform translate-y-0 opacity-100 transition-all duration-500 ease-out delay-100 animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-amber-900">Customer Connections</h2>
            <button
              onClick={() => navigate('/business/customers/simple')}
              className="text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-amber-100 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-amber-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 3).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 rounded-lg hover:bg-amber-50 transition-colors transform hover:scale-102 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${activity.type === 'coupon_created' ? 'bg-amber-100 text-amber-600' :
                    activity.type === 'coupon_redeemed' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                    {activity.type === 'coupon_created' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    ) : activity.type === 'coupon_redeemed' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.type === 'coupon_created' ? '🎉 ' :
                        activity.type === 'coupon_redeemed' ? '💫 ' :
                          '🤝 '}
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(convertToDate(activity.timestamp))} at {formatTime(convertToDate(activity.timestamp))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={() => navigate('/business/customers/simple')}
              className="w-full flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-amber-100 hover:bg-amber-200 transition-colors shadow-md animate-scaleIn focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="View customer connections and start building relationships"
            >
              <div className="w-20 h-20 bg-amber-200 rounded-full flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-amber-900 font-semibold mb-1">Start building relationships</p>
              <p className="text-sm text-amber-700">Create your first coupon to connect with customers</p>
            </button>
          )}
        </div>

        {/* Success Tip Section */}
        <div className="mt-6 mb-8 bg-gradient-to-r from-amber-100 to-rose-100 rounded-2xl p-5 hover:scale-102 transition-transform animate-slideUp">
          <div className="flex items-start">
            <div className="mr-4 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full p-2 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Success Tip</h3>
              <p className="text-sm text-amber-800 mt-1">
                Your personal touch matters! Customers who redeem coupons are <span className="font-bold">70% more likely</span> to return. Try creating a welcome offer to build lasting relationships.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome celebration animation - using CSS instead of framer-motion */}
      {showWelcomeAnimation && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
          onClick={closeWelcomePopup}
        >
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Ready to make today amazing?</p>
            <button
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              onClick={closeWelcomePopup}
            >
              Let's Go!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalSimpleDashboardFixed;