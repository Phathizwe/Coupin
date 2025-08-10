// Updated import and interface to use useMemo and expanded roles
import React, { useMemo, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { determineUserRole } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'business' | 'customer' | 'staff' | 'admin';
  allowedRoles?: ('business' | 'customer' | 'staff' | 'admin')[];
}

// Define the user role type
type UserRole = 'business' | 'customer' | 'staff' | 'admin' | '';

// Define the default routes for each role to match the actual routes in App.tsx
const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'business':
      return '/business/dashboard';
    case 'customer':
      return '/customer/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/customer/dashboard'; // Default to customer dashboard for unknown roles
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles = []
}) => {
  const { user, isLoading, businessProfile } = useAuth();
  const location = useLocation();

  // Add debugging
  useEffect(() => {
    console.log('[ProtectedRoute] Path:', location.pathname);
    console.log('[ProtectedRoute] User:', user ? {
      uid: user.uid,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      businesses: user.businesses
    } : null);
    console.log('[ProtectedRoute] Business Profile:', businessProfile);
    console.log('[ProtectedRoute] Required Role:', requiredRole);
    console.log('[ProtectedRoute] Allowed Roles:', allowedRoles);
    console.log('[ProtectedRoute] Is Loading:', isLoading);
  }, [user, businessProfile, requiredRole, allowedRoles, location, isLoading]);

  // Memoize the user object for role determination to prevent unnecessary recreations
  const userForRoleDetermination = useMemo(() => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      businesses: user.businesses,
      currentBusinessId: user.currentBusinessId,
      // Use the businessProfile from context instead of from user
      businessProfile: businessProfile
    };
  }, [user, businessProfile]);

  // Memoize the role determination to prevent unnecessary recalculations
  const userRole = useMemo((): UserRole => {
    if (!userForRoleDetermination) return '';
    const role = determineUserRole(userForRoleDetermination, businessProfile) as UserRole;
    console.log('[ProtectedRoute] Determined user role:', role);
    return role;
  }, [userForRoleDetermination, businessProfile]);

  // Show loading state while authentication is being determined
  if (isLoading) {
    console.log('[ProtectedRoute] Still loading auth state');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If no user is authenticated, redirect to homepage
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to homepage');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If we have a user but no role determined yet, show loading
  if (!userRole) {
    console.log('[ProtectedRoute] User exists but role not determined yet');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if a specific role is required
  if (requiredRole && requiredRole !== userRole) {
    console.log(`[ProtectedRoute] Required role ${requiredRole} doesn't match user role ${userRole}`);
    const defaultRoute = getDefaultRouteForRole(userRole);
    console.log(`[ProtectedRoute] Redirecting to default route: ${defaultRoute}`);
    return <Navigate to={defaultRoute} replace />;
  }

  // Check if user has one of the allowed roles (if specified)
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole as any)) {
    console.log(`[ProtectedRoute] User role ${userRole} not in allowed roles:`, allowedRoles);
    const defaultRoute = getDefaultRouteForRole(userRole);
    console.log(`[ProtectedRoute] Redirecting to default route: ${defaultRoute}`);
    return <Navigate to={defaultRoute} replace />;
  }

  // User is authenticated and has required role, render the protected content
  console.log('[ProtectedRoute] Access granted for role:', userRole);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;