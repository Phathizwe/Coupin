import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  
  // Determine where to redirect the user based on their role
  const getRedirectPath = () => {
    if (!user) return '/login';
    if (user.role === 'business') return '/business/dashboard';
    if (user.role === 'customer') return '/customer/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <ShieldExclamationIcon className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-3 text-gray-600">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="mt-6">
          <Link
            to={getRedirectPath()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;