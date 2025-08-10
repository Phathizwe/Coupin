import React, { useState } from 'react';
import { inviteBusinessUser } from '../../../services/businessUsersService';

interface InviteUserFormProps {
  businessId: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ 
  businessId, 
  userId, 
  onSuccess, 
  onCancel 
}) => {
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  
  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'staff' as const,
    permissions: {
      manageUsers: false,
      manageSettings: false,
      manageCoupons: true,
      manageCustomers: true,
      viewAnalytics: true
    }
  });

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessId) {
      setFormError('Business ID not found');
      return;
    }
    
    // Basic validation
    if (!newUser.email || !newUser.name) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      setProcessing(true);
      setFormError('');
      
      // Invite the new user
      await inviteBusinessUser(
        businessId, 
        userId, 
        newUser
      );
      
      onSuccess();
    } catch (error: any) {
      setFormError(error.message || 'Failed to invite user');
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email' || name === 'name' || name === 'role') {
      setNewUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
      <h4 className="font-medium mb-3">Invite New Team Member</h4>
      <form onSubmit={handleInviteUser}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
        </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
    </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <h5 className="font-medium mb-2 text-sm text-gray-700">Permissions</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manageUsers"
                name="manageUsers"
                checked={newUser.permissions.manageUsers}
                onChange={handlePermissionChange}
                className="h-4 w-4 text-blue-600 mr-2"
              />
              <label htmlFor="manageUsers" className="text-sm text-gray-700">
                Manage Users
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manageSettings"
                name="manageSettings"
                checked={newUser.permissions.manageSettings}
                onChange={handlePermissionChange}
                className="h-4 w-4 text-blue-600 mr-2"
              />
              <label htmlFor="manageSettings" className="text-sm text-gray-700">
                Manage Settings
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manageCoupons"
                name="manageCoupons"
                checked={newUser.permissions.manageCoupons}
                onChange={handlePermissionChange}
                className="h-4 w-4 text-blue-600 mr-2"
              />
              <label htmlFor="manageCoupons" className="text-sm text-gray-700">
                Manage Coupons
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manageCustomers"
                name="manageCustomers"
                checked={newUser.permissions.manageCustomers}
                onChange={handlePermissionChange}
                className="h-4 w-4 text-blue-600 mr-2"
              />
              <label htmlFor="manageCustomers" className="text-sm text-gray-700">
                Manage Customers
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="viewAnalytics"
                name="viewAnalytics"
                checked={newUser.permissions.viewAnalytics}
                onChange={handlePermissionChange}
                className="h-4 w-4 text-blue-600 mr-2"
              />
              <label htmlFor="viewAnalytics" className="text-sm text-gray-700">
                View Analytics
              </label>
            </div>
          </div>
        </div>
        
        {formError && (
          <div className="text-red-500 text-sm mb-4">{formError}</div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              processing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={processing}
          >
            {processing ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteUserForm;