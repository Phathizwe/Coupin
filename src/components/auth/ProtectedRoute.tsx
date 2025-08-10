import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  customerOnly?: boolean;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  customerOnly = false,
  requiredRole
}) => {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={customerOnly ? '/login' : '/auth/login'} replace />;
  }
  
  // If customerOnly and user is a business, redirect to business login
  if (customerOnly && user.role !== 'customer') {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If requiredRole is specified and user doesn't have that role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated and passes role check, render children
  return <>{children}</>;
};

export default ProtectedRoute;