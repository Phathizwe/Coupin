import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/business/Dashboard';
import EmotionalCouponsView, { Coupons } from './pages/EmotionalCouponsView';
import BusinessCustomersEmotional from './pages/business/BusinessCustomersEmotional';
import LoyaltyPrograms from './pages/business/LoyaltyPrograms';
import Communications from './pages/business/Communications';
import Analytics from './pages/business/Analytics';
import Settings from './pages/business/Settings';
import Billing from './pages/business/Billing';
import QRCode from './pages/business/QRCode';
import Results from './pages/business/Results';
import { Coupons2Page } from './pages/business';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EnhancedRegisterPage from './pages/auth/EnhancedRegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LogoutPage from './pages/auth/LogoutPage';
import NotFoundPage from './errors/NotFoundPage';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import HomePage from './public/HomePage';
import AboutPage from './public/AboutPage';
import PricingPage from './public/PricingPage';
import ContactPage from './public/ContactPage';
import SafeRedirectAuthHandler from './components/auth/SafeRedirectAuthHandler';
import ThemeProvider from './contexts/ThemeProvider';
import HeroExample from './pages/HeroExample';
import CreateCoupon from './components/CreateCoupon';
import ScanCoupon from './components/ScanCoupon';
import { CustomerProvider } from './contexts/CustomerContext';
import BusinessRegistrationFixer from './utils/BusinessRegistrationFixer';
import CustomerDashboard from './customer/DashboardPage';
import CustomerLayout from './layouts/CustomerLayout';
import StoresPage from './customer/StoresPage';
import StoreDetailPage from './customer/StoreDetailPage';
import ProfilePage from './customer/ProfilePage';
import CouponsDebug from './pages/business/CouponsDebug';

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simple error boundary implementation
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
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <SafeRedirectAuthHandler />
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/hero-example" element={<HeroExample />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<EnhancedRegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/logout" element={<LogoutPage />} />
            </Route>

            {/* Registration Fixer Route */}
            <Route path="/fix-registration" element={<BusinessRegistrationFixer />} />

            {/* Business dashboard routes */}
            <Route path="/business" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="coupons/create" element={<CreateCouponWithProvider />} />
              <Route path="scan" element={<ScanCouponWithProvider />} />
              <Route path="coupons2" element={<Coupons2Page />} />
              <Route path="view-coupons" element={<EmotionalCouponsView />} />
              <Route path="customers" element={<BusinessCustomersEmotional />} />
              <Route path="customers-emotional" element={<BusinessCustomersEmotional />} />
              <Route path="customers/add" element={<Navigate to="/business/customers" replace />} />
              <Route path="loyalty" element={<LoyaltyPrograms />} />
              <Route path="communications" element={<Communications />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="qr-code" element={<QRCode />} />
              <Route path="results" element={<Results />} />
            </Route>

            {/* Debug routes */}
            <Route path="/debug" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="coupons" element={<CouponsDebug />} />
            </Route>

            {/* Customer dashboard routes */}
            <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="stores" element={<StoresPage />} />
              <Route path="store/:id" element={<StoreDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;