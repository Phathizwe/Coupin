import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth(); // Changed from 'loading' to 'isLoading' to match AuthContext

  if (isLoading) { // Changed from 'loading' to 'isLoading'
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is logged in and has admin role
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;