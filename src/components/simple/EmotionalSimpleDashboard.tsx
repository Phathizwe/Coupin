import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardStatsService';
import EmotionalStatsSection from './components/EmotionalStatsSection';
import EmotionalActionButtons from './components/EmotionalActionButtons';
import CustomerConnectionsSection from './components/CustomerConnectionsSection';

const EmotionalSimpleDashboard: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  
  useEffect(() => {
    // Hide welcome animation after 2 seconds
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        const dashboardStats = await fetchDashboardStats(user.businessId);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [user?.businessId]);
  
  // Action buttons configuration
  const actionButtons = [
    {
      label: 'Create Offer',
      description: 'Send special offers to customers',
      path: '/business/create-coupon',
      icon: 'gift',
      bgColor: 'from-amber-500 to-amber-600',
      hoverEffect: 'hover:from-amber-600 hover:to-amber-700',
      textColor: 'text-white'
    },
    {
      label: 'Scan Code',
      description: 'Redeem customer offers',
      path: '/business/scan',
      icon: 'qrcode',
      bgColor: 'from-rose-500 to-rose-600',
      hoverEffect: 'hover:from-rose-600 hover:to-rose-700',
      textColor: 'text-white'
    },
    {
      label: 'View Insights',
      description: 'Track your business growth',
      path: '/business/insights',
      icon: 'chart-bar',
      bgColor: 'from-purple-500 to-purple-600',
      hoverEffect: 'hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white'
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-400 to-rose-500 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          className="mt-4 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">
            Welcome back, {businessProfile?.businessName ? businessProfile.businessName.split(' ')[0] : 'Friend'}!
          </h1>
          <p className="text-white/80 mt-1">Let's grow your customer relationships today</p>
        </motion.div>
        
        {/* Stats Section */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-white/20 rounded-xl"></div>
            <div className="h-20 bg-white/20 rounded-xl"></div>
          </div>
        ) : stats && (
          <EmotionalStatsSection
            activeCoupons={stats.activeCoupons}
            totalRedemptions={stats.totalRedemptions}
            loyalCustomers={stats.loyalCustomers}
          />
        )}
        
        {/* Action Buttons */}
        <motion.div 
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <EmotionalActionButtons buttons={actionButtons} />
        </motion.div>
        
        {/* Customer Connections Section */}
        <CustomerConnectionsSection loading={loading} stats={stats} />
        
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
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-4xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 2.5,
              times: [0, 0.3, 0.5, 1]
            }}
          >
            ✨ Welcome back! ✨
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmotionalSimpleDashboard;