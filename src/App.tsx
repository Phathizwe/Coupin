import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/business/Dashboard';
import EmotionalCouponsView from './pages/EmotionalCouponsView';
import BusinessCoupons from './pages/business/Coupons';
import BusinessCustomersEmotional from './pages/business/BusinessCustomersEmotional';
import SimpleCustomers from './pages/business/SimpleCustomers';
import EmotionalLoyaltyPrograms from './pages/business/EmotionalLoyaltyPrograms';
import Communications from './pages/business/Communications';
import Analytics from './pages/business/Analytics';
import Settings from './pages/business/Settings';
import SimpleSettings from './pages/business/SimpleSettings';
import Billing from './pages/business/Billing';
import BillingPage from './pages/BillingPage/BillingPage';
import QRCode from './pages/business/QRCode';
import Results from './pages/business/Results';
import { Coupons2Page } from './pages/business';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import EnhancedRegisterPageDirect from './pages/auth/EnhancedRegisterPage.direct';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LogoutPage from './pages/auth/LogoutPage';
import NotFoundPage from './errors/NotFoundPage';
import UnauthorizedPage from './errors/UnauthorizedPage';
import AuthLayout from './layouts/AuthLayout';
import BusinessLayout from './layouts/BusinessLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import AdminDashboard from './pages/admin/Dashboard';
import HomepageManagement from './pages/admin/homepage/HomepageManagement';
import TimelineManagement from './pages/admin/homepage/TimelineManagement';
import PricingManagement from './pages/admin/homepage/PricingManagement';
import HomePage from './public/HomePage';
import FeaturesPage from './public/FeaturesPage';
import PricingPage from './public/PricingPage';
import ContactPage from './public/ContactPage';
import TestimonialsPage from './public/TestimonialsPage';
import AboutPage from './public/AboutPage';
import { useAuth } from './hooks/useAuth';
import SafeRedirectAuthHandler from './components/auth/SafeRedirectAuthHandler';
import AdminRoleHandler from './components/auth/AdminRoleHandler';
import ThemeProvider from './contexts/ThemeProvider';
import HeroExample from './pages/HeroExample';
import CreateCoupon from './components/CreateCoupon';
import ScanCoupon from './components/ScanCoupon';
import { CustomerProvider } from './contexts/CustomerContext';
import BusinessRegistrationFixer from './utils/BusinessRegistrationFixer';
import EnhancedSettings from './pages/business/EnhancedSettings';
import CustomerDashboard from './customer/DashboardPage';
import CustomerLayout from './layouts/CustomerLayout';
import SimpleStoreLayout from './layouts/SimpleStoreLayout';
import SimplifiedStoreDashboard from './customer/SimplifiedStoreDashboard';
import StoresPage from './customer/StoresPage';
import StoreDetailPage from './customer/StoreDetailPage';
import ProfilePage from './customer/ProfilePage';
import LoyaltyProgramsPage from './customer/LoyaltyProgramsPage';
import CouponsDebug from './pages/business/CouponsDebug';
import { RegionalSettingsProvider } from './contexts/RegionalSettingsContext';
import CurrencyManagement from './components/admin/CurrencyManagement';
import CouponsPage from './customer/CouponsPage';

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Error boundary implementation
  return <>{children}</>;
};

const HomeRoute: React.FC = () => {
  return <HomePage />;
};

const CreateCouponWithProvider: React.FC = () => {
  return (
    <CustomerProvider>
      <CreateCoupon />
    </CustomerProvider>
  );
};

const ScanCouponWithProvider: React.FC = () => {
  return (
    <CustomerProvider>
      <ScanCoupon />
    </CustomerProvider>
  );
};

const App: React.FC = () => {
  return (
    <RegionalSettingsProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <Router>
            <SafeRedirectAuthHandler />
            <AdminRoleHandler />
            <Routes>
              <Route element={<BusinessLayout />}>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/hero-example" element={<HeroExample />} />
              </Route>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<EnhancedRegisterPageDirect />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
              </Route>
              <Route path="/fix-registration" element={<BusinessRegistrationFixer />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminDashboardLayout /></AdminProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="homepage" element={<HomepageManagement />} />
                <Route path="homepage/timeline" element={<TimelineManagement />} />
                <Route path="homepage/pricing" element={<PricingManagement />} />
                <Route path="currencies" element={<CurrencyManagement />} />
              </Route>
              <Route path="/business" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dashboard/simple" element={<Dashboard />} />
                <Route path="coupons" element={<EmotionalCouponsView />} />
                <Route path="coupons/create" element={<CreateCouponWithProvider />} />
                <Route path="scan" element={<ScanCouponWithProvider />} />
                <Route path="coupons2" element={<Coupons2Page />} />
                <Route path="customers" element={<BusinessCustomersEmotional />} />
                <Route path="customers/simple" element={<SimpleCustomers />} />
                <Route path="customers-emotional" element={<BusinessCustomersEmotional />} />
                <Route path="customers/add" element={<Navigate to="/business/customers" replace />} />
                <Route path="loyalty" element={<EmotionalLoyaltyPrograms />} />
                <Route path="communications" element={<Communications />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/simple" element={<SimpleSettings />} />
                <Route path="enhanced-settings" element={<EnhancedSettings />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="billing/legacy" element={<Billing />} />
                <Route path="qr-code" element={<QRCode />} />
                <Route path="results" element={<Results />} />
                <Route path="results/simple" element={<Results />} />
              </Route>
              <Route path="/debug" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="coupons" element={<CouponsDebug />} />
              </Route>
              <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="coupons" element={<CouponsPage />} />
                <Route path="loyalty" element={<LoyaltyProgramsPage />} />
                <Route path="stores" element={<StoresPage />} />
                <Route path="store/:id" element={<StoreDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* New simplified store experience */}
              <Route path="/store" element={<ProtectedRoute requiredRole="customer"><SimpleStoreLayout /></ProtectedRoute>}>
                <Route path="" element={<SimplifiedStoreDashboard />} />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </RegionalSettingsProvider>
  );
};

export default App;