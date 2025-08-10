import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import CouponsDebug from '../pages/business/CouponsDebug';

/**
 * This component adds a debug route to your application
 * Import and use this in your main App.tsx or router configuration
 */
const DebugRoutes: React.FC = () => {
  const { user } = useAuth();
  
  // Only allow authenticated users to access debug routes
  if (!user) {
    return null;
  }
  
  return (
    <Routes>
      <Route path="/debug" element={<DashboardLayout />}>
        <Route path="coupons" element={<CouponsDebug />} />
      </Route>
    </Routes>
  );
};

export default DebugRoutes;