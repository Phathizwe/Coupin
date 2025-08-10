import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatToRandNoDecimals } from '../../utils/currencyUtils';
import { BRAND_MESSAGES } from '../../constants/brandConstants';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface DashboardStatsComponentProps {
  businessId?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, isLoading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
          )}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardStatsComponent: React.FC<DashboardStatsComponentProps> = ({ businessId }) => {
  const { businessProfile } = useAuth();
  const [stats, setStats] = useState({
    activeCoupons: 0,
    totalRedemptions: 0,
    loyalCustomers: 0,
    revenueGenerated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!businessId) {
        console.log('No business ID available, skipping stats fetch');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching stats for business:', businessId);
        
        // Get active coupons count
        const couponsRef = collection(db, 'coupons');
        const activeCouponsQuery = query(
          couponsRef, 
          where('businessId', '==', businessId),
          where('active', '==', true)
        );
        const activeCouponsSnapshot = await getCountFromServer(activeCouponsQuery);
        const activeCoupons = activeCouponsSnapshot.data().count;
        
        // Get total redemptions count
        const customerCouponsRef = collection(db, 'customerCoupons');
        const redeemedCouponsQuery = query(
          customerCouponsRef, 
          where('businessId', '==', businessId),
          where('used', '==', true)
        );
        const redeemedCouponsSnapshot = await getCountFromServer(redeemedCouponsQuery);
        const totalRedemptions = redeemedCouponsSnapshot.data().count;
        
        // Get loyal customers count (customers with more than 1 visit)
        const customersRef = collection(db, 'customers');
        const loyalCustomersQuery = query(
          customersRef,
          where('businessId', '==', businessId),
          where('totalVisits', '>', 1)
        );
        const loyalCustomersSnapshot = await getCountFromServer(loyalCustomersQuery);
        const loyalCustomers = loyalCustomersSnapshot.data().count;
        
        // Get total revenue (sum of totalSpent from all customers)
        const customersDataQuery = query(customersRef, where('businessId', '==', businessId));
        const customersDataSnapshot = await getDocs(customersDataQuery);
        let revenueGenerated = 0;
        
        customersDataSnapshot.forEach(doc => {
          const customerData = doc.data();
          revenueGenerated += customerData.totalSpent || 0;
        });
        
        setStats({
          activeCoupons,
          totalRedemptions,
          loyalCustomers,
          revenueGenerated,
        });
        
        console.log('Stats loaded successfully:', {
          activeCoupons,
          totalRedemptions,
          loyalCustomers,
          revenueGenerated,
        });
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [businessId, businessProfile]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Coupons"
        value={stats.activeCoupons}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        }
        isLoading={isLoading}
      />
      <StatCard
        title="Total Redemptions"
        value={stats.totalRedemptions}
        description={BRAND_MESSAGES.value.standard}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        }
        isLoading={isLoading}
      />
      <StatCard
        title="Loyal Customers"
        value={stats.loyalCustomers}
        description={BRAND_MESSAGES.customer.loyalty}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        isLoading={isLoading}
      />
      <StatCard
        title="Revenue Generated"
        value={formatToRandNoDecimals(stats.revenueGenerated)}
        description={BRAND_MESSAGES.value.growth}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardStatsComponent;