import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessUsers } from '../../hooks/useBusinessUsers';
import InviteUserForm from './users/InviteUserForm';
import UserTable from './users/UserTable';
import { BusinessUser } from '../../services/businessUsersService';

const BusinessUsers: React.FC = () => {
  const { user } = useAuth();
  const { 
    users, 
    loading, 
    fetchUsers,
    updateUserPermission,
    updateUserRole,
    removeUser
  } = useBusinessUsers(user?.businessId);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [allUsers, setAllUsers] = useState<BusinessUser[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    // If the current user is not in the users list, create a virtual entry for them
    if (user && users) {
      const currentUserInList = users.some(u => u.email === user.email);
      
      if (!currentUserInList) {
        // Create a virtual entry for the current user
        const currentUserEntry: BusinessUser = {
          id: user.uid || 'current-user',
          email: user.email || '',
          name: user.displayName || 'Business Owner',
          role: 'owner',
          status: 'active',
          permissions: {
            manageUsers: true,
            manageSettings: true,
            manageCoupons: true,
            manageCustomers: true,
            viewAnalytics: true
          },
          joinedAt: new Date()
        };
        
        // Put the current user at the beginning of the list
        setAllUsers([currentUserEntry, ...users]);
      } else {
        // If the current user is already in the list, just use the fetched users
        setAllUsers(users);
      }
    } else {
      setAllUsers(users);
    }
  }, [users, user]);

  if (loading) {
    return <div className="p-4 text-center">Loading business users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Team Members</h3>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showInviteForm ? 'Cancel' : 'Invite User'}
        </button>
      </div>
      
      {showInviteForm && (
        <InviteUserForm 
          businessId={user?.businessId || ''}
          userId={user?.uid || ''}
          onSuccess={() => {
            fetchUsers();
            setShowInviteForm(false);
          }}
          onCancel={() => setShowInviteForm(false)}
        />
      )}
            
      <UserTable 
        users={allUsers}
        onUpdatePermission={updateUserPermission}
        onUpdateRole={updateUserRole}
        onRemoveUser={removeUser}
        onInviteClick={() => setShowInviteForm(true)}
      />
    </div>
  );
};

export default BusinessUsers;