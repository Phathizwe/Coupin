import { useState, useCallback } from 'react';
import { 
  BusinessUser, 
  getBusinessUsers, 
  updateBusinessUser, 
  removeBusinessUser 
} from '../services/businessUsersService';

export const useBusinessUsers = (businessId?: string) => {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const businessUsers = await getBusinessUsers(businessId);
      setUsers(businessUsers);
    } catch (error) {
      console.error('Error fetching business users:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const updateUserPermission = useCallback(async (
    userId: string, 
    permission: keyof BusinessUser['permissions'], 
    value: boolean
  ) => {
    if (!businessId) return;
    
    try {
      // Find the user to update
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      
      // Create updated permissions
      const updatedPermissions = {
        ...userToUpdate.permissions,
        [permission]: value
      };
      
      // Update in Firestore
      await updateBusinessUser(businessId, userId, {
        permissions: updatedPermissions
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, permissions: updatedPermissions } 
            : u
        )
      );
    } catch (error) {
      console.error('Error updating user permission:', error);
    }
  }, [businessId, users]);

  const updateUserRole = useCallback(async (
    userId: string, 
    role: 'owner' | 'admin' | 'staff'
  ) => {
    if (!businessId) return;
    
    try {
      // Update in Firestore
      await updateBusinessUser(businessId, userId, { role });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, role } 
            : u
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  }, [businessId]);

  const removeUser = useCallback(async (userId: string) => {
    if (!businessId) return;
    
    if (!window.confirm('Are you sure you want to remove this user?')) {
      return;
    }
    
    try {
      await removeBusinessUser(businessId, userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }, [businessId]);

  return {
    users,
    loading,
    fetchUsers,
    updateUserPermission,
    updateUserRole,
    removeUser
  };
};