import React from 'react';
import { motion } from 'framer-motion';
import { DashboardStats } from '../../services/dashboardStatsService';
import { toJsDate } from '../../utils/dateUtils';

interface DashboardActivityFeedProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const DashboardActivityFeed: React.FC<DashboardActivityFeedProps> = ({ 
  stats, 
  loading, 
  error 
}) => {
  // Format date for display
  const formatDate = (timestamp: any) => {
    const date = toJsDate(timestamp);
    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
  };

  // Format time for display
  const formatTime = (timestamp: any) => {
    const date = toJsDate(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'coupon_created':
        return (
          <div className="p-2 bg-green-100 rounded-full text-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'coupon_redeemed':
        return (
          <div className="p-2 bg-primary-100 rounded-full text-primary-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'customer_added':
        return (
          <div className="p-2 bg-secondary-100 rounded-full text-secondary-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mt-2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Error loading activity: {error}</p>
      </div>
    );
  }

  if (!stats || !stats.recentActivity || stats.recentActivity.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats.recentActivity.slice(0, 5).map((activity, index) => (
        <motion.div 
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-start space-x-4"
        >
          {getActivityIcon(activity.type)}
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardActivityFeed;