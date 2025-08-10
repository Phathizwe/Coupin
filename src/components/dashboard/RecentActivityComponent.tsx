import React, { useState, useEffect } from 'react';
import { BRAND_MESSAGES } from '../../constants/brandConstants';
import { DashboardStats, ActivityItem, toJsDate } from '../../services/dashboardStatsService';
import { formatTimeAgo, formatDate as formatDateUtil, formatTime as formatTimeUtil } from '../../utils/dateUtils';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

interface RecentActivityComponentProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const RecentActivityComponent: React.FC<RecentActivityComponentProps> = ({
  stats,
  loading,
  error
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If stats has recentActivity, use that instead of fetching
    if (stats?.recentActivity) {
      setActivities(stats.recentActivity);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch activity data from Firestore
    const fetchActivities = async () => {
      if (!user?.businessId) {
        console.log('No business ID available, skipping activity fetch');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching recent activity for business:', user.businessId);

        const businessId = user.businessId;
        const recentActivity: ActivityItem[] = [];

        // Get date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

        // Get recent coupon creations
        const couponsRef = collection(db, 'coupons');
        const recentCouponsQuery = query(
          couponsRef,
          where('businessId', '==', businessId),
          where('createdAt', '>=', thirtyDaysAgoTimestamp),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const recentCouponsSnapshot = await getDocs(recentCouponsQuery);

        recentCouponsSnapshot.forEach(doc => {
          const couponData = doc.data();
          recentActivity.push({
            id: `coupon-created-${doc.id}`,
            type: 'coupon_created',
            title: `New coupon created: ${couponData.title || 'Untitled'}`,
            timestamp: couponData.createdAt,
            entityId: doc.id
          });
        });

        // Get recent coupon redemptions
        const customerCouponsRef = collection(db, 'customerCoupons');
        const recentRedemptionsQuery = query(
          customerCouponsRef,
          where('businessId', '==', businessId),
          where('used', '==', true),
          orderBy('usedAt', 'desc'),
          limit(5)
        );

        const recentRedemptionsSnapshot = await getDocs(recentRedemptionsQuery);

        recentRedemptionsSnapshot.forEach(doc => {
          const redemptionData = doc.data();
          recentActivity.push({
            id: `coupon-redeemed-${doc.id}`,
            type: 'coupon_redeemed',
            title: `Coupon redeemed: ${redemptionData.title || redemptionData.couponId || 'Unknown'}`,
            timestamp: redemptionData.usedAt,
            entityId: doc.id
          });
        });

        // Get recent customer additions
        const customersRef = collection(db, 'customers');
        const recentCustomersQuery = query(
          customersRef,
          where('businessId', '==', businessId),
          orderBy('joinDate', 'desc'),
          limit(5)
        );

        const recentCustomersSnapshot = await getDocs(recentCustomersQuery);

        recentCustomersSnapshot.forEach(doc => {
          const customerData = doc.data();
          recentActivity.push({
            id: `customer-added-${doc.id}`,
            type: 'customer_added',
            title: `New customer added: ${customerData.firstName || ''} ${customerData.lastName || ''}`,
            timestamp: customerData.joinDate,
            entityId: doc.id
          });
        });

        // Sort activity by timestamp (newest first)
        recentActivity.sort((a, b) => {
          const dateA = toJsDate(a.timestamp);
          const dateB = toJsDate(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });

        // Limit to most recent 10 activities
        const limitedActivity = recentActivity.slice(0, 10);

        setActivities(limitedActivity);
        console.log('Recent activity loaded successfully:', limitedActivity);

      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [stats, user?.businessId]);

  // Convert any timestamp to a Date object
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
      case 'customer_visit':
        return (
          <div className="p-2 bg-blue-100 rounded-full text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

  // Use the loading prop passed from parent
  if (loading || isLoading) {
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

  // Show error if there is one
  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Error loading recent activity: {error}</p>
      </div>
    );
  }

  // Use stats.recentActivity if available, otherwise use the activities state
  const displayActivities = stats?.recentActivity || activities;

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No recent activity found.</p>
        <p className="text-sm text-primary-600 mt-2">
          {BRAND_MESSAGES.value.standard}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Activity Summary</h3>
      </div>

      {/* Activity Items */}
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            {getActivityIcon(activity.type)}
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.title}</p>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(convertToDate(activity.timestamp))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateUtil(convertToDate(activity.timestamp))} at {formatTimeUtil(convertToDate(activity.timestamp))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View All Activity Button */}
      <div className="pt-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all activity
        </button>
      </div>

      {/* Stats Summary - Moved to bottom */}
      {stats && (
        <div className="bg-primary-50 p-4 rounded-md mt-6">
          <p className="text-sm text-primary-800 font-medium mb-2">Summary Statistics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm text-primary-700">
              <span className="font-medium">{stats.totalRedemptions}</span> redemptions
            </div>
            <div className="text-sm text-primary-700">
              <span className="font-medium">{stats.loyalCustomers}</span> loyal customers
            </div>
            {stats.totalCustomers !== undefined && (
              <div className="text-sm text-primary-700">
                <span className="font-medium">{stats.totalCustomers}</span> total customers
              </div>
            )}
            {stats.conversionRate !== undefined && (
              <div className="text-sm text-primary-700">
                <span className="font-medium">{stats.conversionRate}%</span> conversion rate
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivityComponent;