import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { setupAdminUser } from '@/utils/adminRoleSetup';

/**
 * Component that handles setting up the admin role for specific users
 * This component doesn't render anything visible - it just runs the admin setup logic
 */
const AdminRoleHandler: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setupAdminUser(user);
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default AdminRoleHandler;