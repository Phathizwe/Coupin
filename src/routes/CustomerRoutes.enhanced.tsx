import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerDashboard from '../customer/DashboardPage';
import StoreDetailPage from '../customer/StoreDetailPage';
import ProfilePage from '../customer/ProfilePage';
import LoyaltyProgramsPage from '../customer/LoyaltyProgramsPage';
import CouponsPage from '../customer/CouponsPage';
import EnhancedStoreDiscoveryPage from '../customer/pages/EnhancedStoreDiscoveryPage';

/**
 * Enhanced Customer Routes
 * This component provides the routing for the customer experience
 * It integrates the enhanced store discovery page to fix the critical store discovery issue
 */
const CustomerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<CustomerDashboard />} />
      <Route path="coupons" element={<CouponsPage />} />
      <Route path="loyalty" element={<LoyaltyProgramsPage />} />
      <Route path="stores" element={<EnhancedStoreDiscoveryPage />} />
      <Route path="store/:id" element={<StoreDetailPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<CustomerDashboard />} />
    </Routes>
  );
};

export default CustomerRoutes;