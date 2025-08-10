// src/pages/business/Results.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import ViewToggle from '../../components/ui/ViewToggle';

// Define a type for the coupon distribution/redemption
interface CouponRedemption {
  id: string;
  businessId: string;
  couponId: string;
  customerId: string;
  sentAt: Timestamp;
  redeemedAt: Timestamp;
  status: 'sent' | 'redeemed';
  [key: string]: any;
}

// Define a type for the redemption with customer and coupon details
interface RedemptionWithDetails extends CouponRedemption {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    [key: string]: any;
  };
  coupon: {
    id: string;
    title: string;
    description?: string;
    [key: string]: any;
  };
}

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { user, businessProfile } = useAuth();
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';

  const [stats, setStats] = useState({
    todayCoupons: 0,
    weekCoupons: 0,
    monthCoupons: 0,
    totalCoupons: 0,
    returningCustomers: 0
  });
  const [recentRedemptions, setRecentRedemptions] = useState<RedemptionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State to track screen width for responsive design
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Set up event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.businessId) return;

      try {
        setIsLoading(true);

        // Get date ranges
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);

        // Get coupon distributions with 'redeemed' status
        const distRef = collection(db, 'couponDistributions');
        const distQuery = query(
          distRef,
          where('businessId', '==', user.businessId),
          where('status', '==', 'redeemed')
        );

        const distSnapshot = await getDocs(distQuery);
        const redemptions = distSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CouponRedemption[];

        // Calculate stats
        const todayCoupons = redemptions.filter(r => {
          // Safely handle Firestore Timestamp
          const date = r.redeemedAt instanceof Timestamp
            ? r.redeemedAt.toDate()
            : new Date();
          return date >= todayStart;
        }).length;

        const weekCoupons = redemptions.filter(r => {
          // Safely handle Firestore Timestamp
          const date = r.redeemedAt instanceof Timestamp
            ? r.redeemedAt.toDate()
            : new Date();
          return date >= weekStart;
        }).length;

        const monthCoupons = redemptions.filter(r => {
          // Safely handle Firestore Timestamp
          const date = r.redeemedAt instanceof Timestamp
            ? r.redeemedAt.toDate()
            : new Date();
          return date >= monthStart;
        }).length;

        // Get returning customers (customers with more than 1 visit)
        const customersRef = collection(db, 'customers');
        const customersQuery = query(
          customersRef,
          where('businessId', '==', user.businessId),
          where('totalVisits', '>', 1)
        );

        const customersSnapshot = await getDocs(customersQuery);
        const returningCustomers = customersSnapshot.docs.length;

        // Get recent redemptions with customer data
        const recentQuery = query(
          distRef,
          where('businessId', '==', user.businessId),
          where('status', '==', 'redeemed'),
          orderBy('redeemedAt', 'desc'),
          limit(5)
        );

        const recentSnapshot = await getDocs(recentQuery);
        const recentData = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CouponRedemption[];

        // Get customer and coupon details for each redemption
        const recentWithDetails: RedemptionWithDetails[] = await Promise.all(
          recentData.map(async (redemption) => {
            // Get customer
            const customerDoc = await getDocs(query(
              collection(db, 'customers'),
              where('businessId', '==', user.businessId),
              where('__name__', '==', redemption.customerId)
            ));

            // Get coupon
            const couponDoc = await getDocs(query(
              collection(db, 'coupons'),
              where('businessId', '==', user.businessId),
              where('__name__', '==', redemption.couponId)
            ));

            const customerData = customerDoc.docs[0]?.data() || {};
            const couponData = couponDoc.docs[0]?.data() || {};

            // Create a properly typed object with default values for required fields
            return {
              ...redemption,
              customer: {
                id: redemption.customerId,
                firstName: customerData.firstName || 'Unknown',
                lastName: customerData.lastName || 'Customer',
                phone: customerData.phone,
                ...customerData
              },
              coupon: {
                id: redemption.couponId,
                title: couponData.title || 'Unknown Coupon',
                description: couponData.description,
                ...couponData
              }
            };
          })
        );

        setStats({
          todayCoupons,
          weekCoupons,
          monthCoupons,
          totalCoupons: redemptions.length,
          returningCustomers
        });

        setRecentRedemptions(recentWithDetails);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [user?.businessId]);

  // Helper function to safely format dates from Firestore Timestamps
  const formatTimestamp = (timestamp: Timestamp | any): string => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleString();
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    } else if (timestamp && timestamp.seconds) {
      // Handle plain Firestore timestamp object
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return 'Unknown date';
  };

  // Handle view toggle change
  const handleViewChange = (view: 'default' | 'simple') => {
    if (context?.onViewChange) {
      context.onViewChange(view);
    }
  };

  // Determine if we should use mobile view based on screen size or viewMode
  const useMobileView = isMobileView || viewMode === 'simple';

  return (
    <div className={`flex flex-col ${useMobileView ? 'h-full' : 'h-screen'} bg-white`}>
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => {
              if (viewMode === 'simple') {
                navigate('/business/dashboard/simple');
              } else {
                navigate('/business/dashboard');
              }
            }}
            className="mr-4 text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Results</h1>
        </div>

        {/* Add the ViewToggle component for mobile screens */}
        {isMobileView && (
          <div>
            <ViewToggle
              onChange={handleViewChange}
              initialView={viewMode}
            />
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className={`${useMobileView ? 'p-4' : 'p-6'} grid ${useMobileView ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-blue-600 font-medium">TODAY</p>
              <p className="text-2xl font-bold">{stats.todayCoupons}</p>
              <p className="text-sm text-gray-600">Coupons Used</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-green-600 font-medium">THIS WEEK</p>
              <p className="text-2xl font-bold">{stats.weekCoupons}</p>
              <p className="text-sm text-gray-600">Coupons Used</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-purple-600 font-medium">THIS MONTH</p>
              <p className="text-2xl font-bold">{stats.monthCoupons}</p>
              <p className="text-sm text-gray-600">Coupons Used</p>
            </div>

            <div className={`bg-orange-50 p-4 rounded-lg shadow-sm ${useMobileView ? 'col-span-2' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-orange-600 font-medium">ALL TIME</p>
                  <p className="text-2xl font-bold">{stats.totalCoupons}</p>
                  <p className="text-sm text-gray-600">Total Redemptions</p>
                </div>
                {useMobileView && (
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">RETURNING</p>
                    <p className="text-2xl font-bold text-right">{stats.returningCustomers}</p>
                    <p className="text-sm text-gray-600 text-right">Customers</p>
                  </div>
                )}
              </div>
            </div>

            {!useMobileView && (
              <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-indigo-600 font-medium">RETURNING</p>
                <p className="text-2xl font-bold">{stats.returningCustomers}</p>
                <p className="text-sm text-gray-600">Customers</p>
              </div>
            )}
          </div>

          {/* Recent Redemptions */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-gray-50 border-t border-b">
              <h2 className="font-medium">Recent Redemptions</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {recentRedemptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No recent redemptions
                </div>
              ) : (
                <ul className="divide-y">
                  {recentRedemptions.map(redemption => (
                    <li key={redemption.id} className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium">
                            {redemption.customer?.firstName?.charAt(0) || '?'}
                            {redemption.customer?.lastName?.charAt(0) || '?'}
                          </span>
                        </div>

                        <div>
                          <p className="font-medium">
                            {redemption.customer?.firstName} {redemption.customer?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimestamp(redemption.redeemedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="ml-13 pl-10">
                        <p className="text-blue-600 font-medium">
                          {redemption.coupon?.title || 'Unknown Coupon'}
                        </p>
                        {!useMobileView && redemption.coupon?.description && (
                          <p className="text-sm text-gray-500">
                            {redemption.coupon.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
