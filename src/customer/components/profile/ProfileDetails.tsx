import React from 'react';
import { ExtendedUser } from '../../../contexts/AuthContext';
import { Customer } from '../../../types';

interface ProfileDetailsProps {
  user: ExtendedUser | null;
  customerProfile: Customer | null;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, customerProfile }) => {
  return (
    <>
      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Full name</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {user?.displayName || 'Not provided'}
        </dd>
      </div>
      
      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Email address</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {user?.email}
        </dd>
      </div>
      
      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Account type</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          Customer
        </dd>
      </div>
      
      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Account created</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
        </dd>
      </div>
      
      {customerProfile && (
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Customer status</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Linked to customer profile
            </span>
          </dd>
        </div>
      )}
    </>
  );
};

export default ProfileDetails;