import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import EnhancedRegisterPageDirect from './pages/auth/EnhancedRegisterPage.direct';
import CustomerLayout from './layouts/CustomerLayout';
import BusinessLayout from './layouts/BusinessLayout';
import CustomerRoutes from './routes/CustomerRoutes.enhanced';
import BusinessRoutes from './routes/BusinessRoutes.enhanced';
import LoadingSpinner from './customer/components/LoadingSpinner';
import { RegionalSettingsProvider } from './contexts/RegionalSettingsContext';

/**
 * Enhanced App Component
 * This is the main application component that integrates all the enhanced routes
 * It connects the customer and business experiences to fix the critical architectural issues
 */
const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Simulate a brief loading screen for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while authentication is being checked
  if (isLoading || isInitializing) {
    return (
      <div className="loading-screen">
        <LoadingSpinner />
        <p>Preparing your experience...</p>
      </div>
    );
  }

  return (
    <RegionalSettingsProvider>
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getRedirectPath(user)} />} />
          <Route path="/register" element={!user ? <EnhancedRegisterPageDirect /> : <Navigate to={getRedirectPath(user)} />} />
          
          {/* Customer Routes */}
          <Route 
            path="/customer/*" 
            element={
              user && user.role === 'customer' ? (
                <CustomerLayout />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Business Routes */}
          <Route 
            path="/business/*" 
            element={
              user && user.role === 'business' ? (
                <BusinessLayout />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to={user ? getRedirectPath(user) : "/login"} />} />
        </Routes>
      </Router>
    </RegionalSettingsProvider>
  );
};

// Helper function to determine redirect path based on user role
const getRedirectPath = (user: any): string => {
  if (!user) return '/login';
  
  return user.role === 'business' 
    ? '/business/dashboard' 
    : '/customer/stores';  // Direct customers to store discovery
};

export default App;