import React from 'react';
import LinkCustomerAccount from '../utils/LinkCustomerAccount';
import { useAuth } from '../hooks/useAuth';

const LinkAccountPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Link Your Customer Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">
          This page will help you link your user account to your customer profile created by businesses.
          This ensures you can see all coupons assigned to your phone number.
        </p>
        
        {user ? (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-medium mb-2">Your Account Information</h2>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phoneNumber || 'No phone number found'}</p>
            </div>
            
            <LinkCustomerAccount />
          </>
        ) : (
          <p className="text-red-600">Please log in to link your account.</p>
        )}
      </div>
    </div>
  );
};

export default LinkAccountPage;