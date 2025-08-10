import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardStatsService';
import EmotionalActionButtons from '../simple/components/EmotionalActionButtons';
import EmotionalStatsSection from '../simple/components/EmotionalStatsSection';
import { motion } from 'framer-motion';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';

const EmotionalSimpleDashboard: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.businessId) return;

      try {
        setLoading(true);
        const dashboardStats = await fetchDashboardStats(user.businessId);
        setStats(dashboardStats);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Hide welcome animation after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.businessId]);

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
      path: "/business/results",
      icon: "chart-bar",
      bgColor: "from-rose-400 to-rose-500",
      hoverEffect: "hover:shadow-rose-300/50",
      textColor: "text-rose-900"
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
    return timestamp.toDate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full bg-gradient-to-b from-amber-50 to-white max-w-3xl mx-auto"
    >
      {/* Warm, welcoming header with personalized greeting */}
      <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-lg font-medium opacity-90">{getGreeting()}</h2>
          <motion.h1
            className="text-2xl font-bold mt-1 flex items-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" as any }}
          >
            Hi, {getUserName()}!
            <motion.span
              initial={{ rotate: -20 }}
              animate={{ rotate: [0, 15, 0] }}
              transition={{ delay: 0.6, duration: 0.5, repeat: 1 }}
              className="ml-2"
            >
              👋
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-2 text-amber-100 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {getEncouragingMessage()}
          </motion.p>
        </motion.div>

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
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-4">What would you like to do today?</h2>
          <EmotionalActionButtons buttons={actionButtons} />
        </motion.div>

        {/* Recent Activity Section transformed into "Customer Connections" */}
        <motion.div
          className="mt-6 bg-white rounded-2xl shadow-lg p-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-amber-900">Customer Connections</h2>
            <button className="text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors">
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
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 3).map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-start p-3 rounded-lg hover:bg-amber-50 transition-colors"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <motion.div
                className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
              >
                <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </motion.div>
              <p className="text-amber-800 font-medium mb-1">Start building relationships</p>
              <p className="text-sm text-amber-600">Create your first coupon to connect with customers</p>
            </div>
          )}
        </motion.div>

        {/* Success Tip Section */}
        <motion.div
          className="mt-6 mb-8 bg-gradient-to-r from-amber-100 to-rose-100 rounded-2xl p-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
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
        </motion.div>
      </div>

      {/* Welcome celebration animation */}
      {showWelcomeAnimation && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              🎉
            </motion.div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">Welcome back!</h3>
            <p className="text-amber-700">Ready to create amazing offers?</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmotionalSimpleDashboard;
