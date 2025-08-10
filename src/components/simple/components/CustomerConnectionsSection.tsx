import React from 'react';
import { motion } from 'framer-motion';
import { DashboardStats } from '../../../services/dashboardStatsService';
import { toJsDate } from '../../../utils/dateUtils';

// This interface defines what the component currently expects
interface LegacyStatsType {
  recentCustomers?: {
    id: string;
    name: string;
    date: Date;
  }[];
}

// Union type that accepts both the legacy type and the new DashboardStats type
type StatsType = LegacyStatsType | DashboardStats | null;

interface CustomerConnectionsSectionProps {
  loading: boolean;
  stats: StatsType;
}

const CustomerConnectionsSection: React.FC<CustomerConnectionsSectionProps> = ({ loading, stats }) => {
  // Function to determine if stats is DashboardStats type
  const isDashboardStats = (stats: StatsType): stats is DashboardStats => {
    return stats !== null && 'recentActivity' in stats;
  };

  // Get recent customers data based on the stats type
  const getRecentCustomers = () => {
    if (!stats) return [];
    
    if (isDashboardStats(stats)) {
      // Handle DashboardStats type
      return stats.recentActivity
        ?.filter(activity => activity.type === 'customer_added')
        .map(activity => ({
          id: activity.entityId,
          name: activity.title.replace('New customer: ', ''),
          date: toJsDate(activity.timestamp)
        })) || [];
    } else {
      // Handle legacy type
      return stats.recentCustomers || [];
    }
  };
  
  const recentCustomers = getRecentCustomers();

  return (
    <motion.div 
      className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-xl"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-4">Recent Connections</h3>
      
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-white/20 rounded-lg"></div>
          <div className="h-12 bg-white/20 rounded-lg"></div>
          <div className="h-12 bg-white/20 rounded-lg"></div>
        </div>
      ) : recentCustomers.length > 0 ? (
        <div className="space-y-3">
          {recentCustomers.map((customer, index) => (
            <motion.div 
              key={customer.id}
              className="flex items-center p-3 bg-white/20 rounded-xl"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-white/70">
                  {customer.date.toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto">
                <button className="text-white/80 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="text-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-white/70">No recent customer connections</p>
          <button className="mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
            Add Your First Customer
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomerConnectionsSection;