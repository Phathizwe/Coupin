import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboardLayout from '../../../layouts/AdminDashboardLayout';
import HomepageManagement from './HomepageManagement';
import TimelineManagement from './TimelineManagement';
import PricingManagement from './PricingManagement';
import CurrencyManagement from './currency';

const HomepageRoutes: React.FC = () => {
  return (
    <AdminDashboardLayout>
      <Routes>
        <Route index element={<HomepageManagement />} />
        <Route path="timeline" element={<TimelineManagement />} />
        <Route path="pricing" element={<PricingManagement />} />
        <Route path="currency/*" element={<CurrencyManagement />} />
      </Routes>
    </AdminDashboardLayout>
  );
};

export default HomepageRoutes;