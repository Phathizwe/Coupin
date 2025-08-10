import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/business/Dashboard';
import EmotionalCouponsView, { Coupons } from './pages/EmotionalCouponsView';
import Customers from './pages/business/Customers';
import LoyaltyPrograms from './pages/business/LoyaltyPrograms';
import Communications from './pages/business/Communications';
import Analytics from './pages/business/Analytics';
import Settings from './pages/business/Settings';
import Billing from './pages/business/Billing';
import QRCode from './pages/business/QRCode';
import Results from './pages/business/Results';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
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
import { useAuth } from './hooks/useAuth';
import RedirectAuthHandler from './components/auth/RedirectAuthHandler';

// Import customer components
import CustomerDashboard from './customer/DashboardPage';
import CustomerLayout from './layouts/CustomerLayout';
import StoresPage from './customer/StoresPage';
import StoreDetailPage from './customer/StoreDetailPage';
import ProfilePage from './customer/ProfilePage';

// Create a wrapper component to catch any errors in the app
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Add global error handler
    const errorHandler = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
      // Prevent the default browser error overlay
      event.preventDefault();
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-4">
            We're sorry, but something went wrong. Please try refreshing the page.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-sm text-red-800 font-mono">{error.message}</p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Enhanced HomeRoute with safety timeout for loading state
const HomeRoute = () => {
  const { user, isLoading } = useAuth();
  const [safeLoading, setSafeLoading] = useState(true);

  // Safety timeout for loading state
  useEffect(() => {
    // Update safe loading state when auth loading changes
    setSafeLoading(isLoading || false);

    // Add a safety timeout to ensure we don't get stuck loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout reached, forcing render of public homepage');
        setSafeLoading(false);
      }
    }, 5000); // 5 seconds max loading time

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Show loading spinner while checking auth, but with a safety timeout
  if (safeLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading your experience...</p>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard based on role
  if (user) {
    const role = user.role || 'business';
    if (role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else {
      return <Navigate to="/business/dashboard" replace />;
    }
  }

  // Otherwise show public homepage
  return <HomePage />;
};

// Add a SafeRedirectAuthHandler component with error handling and timeout
const SafeRedirectAuthHandler = () => {
  useEffect(() => {
    // Set a timeout to ensure redirect handling doesn't block the app
    const timeoutId = setTimeout(() => {
      console.warn('RedirectAuthHandler timeout reached, continuing app initialization');
    }, 3000); // 3 seconds max for redirect handling

    return () => clearTimeout(timeoutId);
  }, []);

  return <RedirectAuthHandler />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        {/* Use our safer redirect handler */}
        <SafeRedirectAuthHandler />

        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Route>

          {/* Business dashboard routes */}
          <Route path="/business" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="view-coupons" element={<EmotionalCouponsView />} />
            <Route path="customers" element={<Customers />} />
            <Route path="loyalty" element={<LoyaltyPrograms />} />
            <Route path="communications" element={<Communications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<Billing />} />
            <Route path="qr-code" element={<QRCode />} />
            <Route path="results" element={<Results />} />
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
  );
};

export default App;