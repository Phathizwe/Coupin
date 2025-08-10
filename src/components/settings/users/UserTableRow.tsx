import React from 'react';
import { BusinessUser } from '../../../services/businessUsersService';

interface UserTableRowProps {
  user: BusinessUser;
  onUpdatePermission: (userId: string, permission: keyof BusinessUser['permissions'], value: boolean) => void;
  onUpdateRole: (userId: string, role: 'owner' | 'admin' | 'staff') => void;
  onRemove: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ 
  user, 
  onUpdatePermission, 
  onUpdateRole, 
  onRemove 
}) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value as any)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : user.status === 'invited' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="space-y-1">
          {Object.entries(user.permissions).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={`${user.id}-${key}`}
                checked={value}
                onChange={(e) => onUpdatePermission(
                  user.id, 
                  key as keyof BusinessUser['permissions'], 
                  e.target.checked
                )}
                className="h-3 w-3 text-blue-600 mr-2"
              />
              <label htmlFor={`${user.id}-${key}`} className="text-xs capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onRemove(user.id)}
          className="text-red-600 hover:text-red-900"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default UserTableRow;