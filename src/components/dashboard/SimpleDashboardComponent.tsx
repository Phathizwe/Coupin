import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardStatsService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';

const SimpleDashboard: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [user?.businessId]);

  // Define the buttons data
  const actionButtons = [
    {
      label: "Create Coupon",
      description: "Create a new coupon offer",
      path: "/business/coupons/create",
      icon: "plus",
      bgColor: "from-blue-500 to-blue-600",
      textColor: "text-white"
    },
    {
      label: "Scan Coupon",
      description: "Scan customer coupons",
      path: "/business/scan",
      icon: "qrcode",
      bgColor: "from-green-500 to-green-600",
      textColor: "text-white"
    },
    {
      label: "View Results",
      description: "See your business analytics",
      path: "/business/results",
      icon: "chart",
      bgColor: "from-purple-500 to-purple-600",
      textColor: "text-white"
    }
  ];

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

  // Helper function to convert Timestamp to Date
  const convertToDate = (timestamp: Date | Timestamp): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // If it's a Firestore Timestamp, convert to Date
    return timestamp.toDate();
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-600">{getGreeting()}</h2>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Welcome back, {getUserName()}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeCoupons || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRedemptions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loyal Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.loyalCustomers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionButtons.map((button, index) => (
            <a
              key={index}
              href={button.path}
              className={`block p-4 rounded-lg bg-gradient-to-r ${button.bgColor} ${button.textColor} hover:shadow-lg transition-shadow`}
            >
              <div className="text-center">
                <h3 className="font-semibold">{button.label}</h3>
                <p className="text-sm opacity-90 mt-1">{button.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View All
          </button>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${activity.type === 'coupon_created' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'coupon_redeemed' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                  }`}>
                  {activity.type === 'coupon_created' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  ) : activity.type === 'coupon_redeemed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(convertToDate(activity.timestamp))} at {formatTime(convertToDate(activity.timestamp))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No recent activity</p>
            <p className="text-sm text-gray-400">Create your first coupon to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;