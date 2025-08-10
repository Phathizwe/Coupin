import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { determineUserRole } from '../utils/roleUtils';
import { BusinessProfile } from '../types';

export const useRoleRedirect = (
  requiredRole?: 'business' | 'customer' | 'staff' | 'admin',
  redirectPath?: string
) => {
  const { user, isLoading, businessProfile } = useAuth();
  const navigate = useNavigate();
  const [hasCheckedRole, setHasCheckedRole] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Create a minimal user object for role determination
    const userForRoleDetermination = user ? {
      uid: user.uid,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    } : null;

    // Use the centralized role determination utility
    const userRole = determineUserRole(userForRoleDetermination, businessProfile) as 'business' | 'customer' | 'staff' | 'admin';

    console.log('[useRoleRedirect] User role determined:', userRole);

    // If we have a required role and the user doesn't have it, redirect
    if (requiredRole && userRole !== requiredRole) {
      console.log(`[useRoleRedirect] User role ${userRole} doesn't match required role ${requiredRole}`);

      if (redirectPath) {
        console.log(`[useRoleRedirect] Redirecting to ${redirectPath}`);
        navigate(redirectPath);
      } else {
        // Determine default route based on user's actual role
        let defaultRoute = '/';

        if (userRole === 'business') {
          defaultRoute = '/business/dashboard';
        } else if (userRole === 'customer') {
          defaultRoute = '/customer/dashboard';
        } else if (userRole === 'admin') {
          defaultRoute = '/admin/dashboard';
        } else if (userRole === 'staff') {
          defaultRoute = '/staff/dashboard';
        }

        console.log(`[useRoleRedirect] Redirecting to default route: ${defaultRoute}`);
        navigate(defaultRoute);
      }
    }

    setHasCheckedRole(true);
  }, [user, isLoading, businessProfile, requiredRole, redirectPath, navigate]);

  return { hasCheckedRole };
};