import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BusinessDashboard } from '../pages/BusinessDashboard';
import { CustomersPage } from '../pages/CustomersPage';
import { ScanPage } from '../pages/ScanPage';
import { LoyaltyProgramsPage } from '../pages/LoyaltyProgramsPage';
import CustomerManagementPage from '../pages/CustomerManagementPage';

export const BusinessRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<BusinessDashboard />} />
      <Route path="/customers" element={<CustomerManagementPage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/loyalty" element={<LoyaltyProgramsPage />} />
      <Route path="/" element={<BusinessDashboard />} />
    </Routes>
  );
};