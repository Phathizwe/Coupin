import React, { useState, useEffect } from 'react';
import MobileStatsSection from '../simple/components/MobileStatsSection';
import MobileActionButtons from '../simple/components/MobileActionButtons';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardStatsService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';

interface SimpleDashboardMobileProps {
  userName?: string;
  businessId: string;
}

const SimpleDashboardMobile: React.FC<SimpleDashboardMobileProps> = ({ 
  userName = 'there',
  businessId
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      if (!businessId) return;
      
      try {
        setLoading(true);
        const dashboardStats = await fetchDashboardStats(businessId);
        setStats(dashboardStats);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [businessId]);

  // Define the buttons data that MobileActionButtons component needs
  const actionButtons = [
    {
      label: "Create Coupon",
      path: "/create-coupon",
      icon: "plus-circle",
      bgColor: "from-blue-500 to-blue-600",
      textColor: "text-white"
    },
    {
      label: "View Coupons",
      path: "/business/coupons",
      icon: "ticket",
      bgColor: "from-green-500 to-green-600",
      textColor: "text-white"
    },
    {
      label: "See Results",
      path: "/results",
      icon: "chart-bar",
      bgColor: "from-purple-500 to-purple-600",
      textColor: "text-white"
    }
  ];

  // Get current time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to convert Timestamp to Date
  const convertToDate = (timestamp: Date | Timestamp): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // If it's a Firestore Timestamp, convert to Date
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // Fallback
    return new Date();
};

  return (
    <div className="h-full bg-gray-50">
      {/* Header with greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg">
        <h2 className="text-lg font-medium opacity-90">{getGreeting()}</h2>
        <h1 className="text-2xl font-bold mt-1">Hi, {userName}! 👋</h1>
        
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
            <MobileStatsSection 
              activeCoupons={stats?.activeCoupons || 0}
              totalRedemptions={stats?.totalRedemptions || 0}
              loyalCustomers={stats?.loyalCustomers || 0}
            />
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <MobileActionButtons buttons={actionButtons} />
        </div>
        
        {/* Recent Activity Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-sm text-indigo-600 font-medium">View All</button>
          </div>
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    activity.type === 'coupon_created' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'coupon_redeemed' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'coupon_created' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    ) : activity.type === 'coupon_redeemed' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(convertToDate(activity.timestamp))} at {formatTime(convertToDate(activity.timestamp))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-600 mb-1">No recent activity</p>
              <p className="text-sm text-gray-500">Create your first coupon to get started</p>
            </div>
          )}
        </div>
        
        {/* Tips Section */}
        <div className="mt-6 mb-8 bg-gradient-to-r from-amber-100 to-amber-200 rounded-2xl p-5">
          <div className="flex items-start">
            <div className="mr-4 bg-amber-500 rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Pro Tip</h3>
              <p className="text-sm text-amber-800 mt-1">
                Customers who redeem coupons are 70% more likely to return. Try creating a welcome discount for new customers!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboardMobile;