import React from 'react';
import { ExtendedUser } from '../../../contexts/AuthContext';

interface ProfileHeaderProps {
  user: ExtendedUser | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="px-4 py-5 sm:px-6 flex items-center">
      {user?.photoURL ? (
        <img
          className="h-16 w-16 rounded-full mr-4"
          src={user.photoURL}
          alt={user.displayName || "User"}
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl mr-4">
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
        </div>
      )}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {user?.displayName || 'Customer'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Personal details and account information
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;