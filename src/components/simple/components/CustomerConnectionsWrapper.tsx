import React from 'react';
import { DashboardStats } from '../../../services/dashboardStatsService';
import CustomerConnectionsSection from './CustomerConnectionsSection';
import { toJsDate } from '../../../utils/dateUtils';

interface CustomerConnectionsWrapperProps {
  loading: boolean;
  stats: DashboardStats | null;
}

const CustomerConnectionsWrapper: React.FC<CustomerConnectionsWrapperProps> = ({ loading, stats }) => {
  // Transform the stats data to match what CustomerConnectionsSection expects
  const transformedStats = stats ? {
    recentCustomers: stats.recentActivity
      ?.filter(activity => activity.type === 'customer_added')
      .map(activity => ({
        id: activity.entityId,
        name: activity.title.replace('New customer: ', ''),
        date: toJsDate(activity.timestamp)
      })) || []
  } : null;

  return (
    <CustomerConnectionsSection loading={loading} stats={transformedStats} />
  );
};

export default CustomerConnectionsWrapper;