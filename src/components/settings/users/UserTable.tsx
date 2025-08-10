import React from 'react';
import { BusinessUser } from '../../../services/businessUsersService';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: BusinessUser[];
  onUpdatePermission: (userId: string, permission: keyof BusinessUser['permissions'], value: boolean) => void;
  onUpdateRole: (userId: string, role: 'owner' | 'admin' | 'staff') => void;
  onRemoveUser: (userId: string) => void;
  onInviteClick: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onUpdatePermission, 
  onUpdateRole, 
  onRemoveUser,
  onInviteClick
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No team members yet</p>
        <button
          onClick={onInviteClick}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Invite your first team member
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permissions
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(businessUser => (
            <UserTableRow 
              key={businessUser.id}
              user={businessUser}
              onUpdatePermission={onUpdatePermission}
              onUpdateRole={onUpdateRole}
              onRemove={onRemoveUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;