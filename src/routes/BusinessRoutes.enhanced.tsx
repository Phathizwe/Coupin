import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BusinessDashboard from '../pages/business/Dashboard';
import CouponsPage from '../pages/business/Coupons';
import LoyaltyProgramsPage from '../pages/business/LoyaltyPrograms';
import QRCodePage from '../pages/business/QRCodePage';
import AnalyticsPage from '../pages/business/Analytics';
import SettingsPage from '../pages/business/Settings';
import EnhancedCustomerManagementPage from '../business/pages/EnhancedCustomerManagementPage';

/**
 * Enhanced Business Routes
 * This component provides the routing for the business experience
 * It integrates the enhanced customer management page to fix the critical customer visibility issue
 */
const BusinessRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<BusinessDashboard />} />
      <Route path="customers" element={<EnhancedCustomerManagementPage />} />
      <Route path="coupons" element={<CouponsPage />} />
      <Route path="loyalty" element={<LoyaltyProgramsPage />} />
      <Route path="qr-code" element={<QRCodePage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<BusinessDashboard />} />
    </Routes>
  );
};

export default BusinessRoutes;