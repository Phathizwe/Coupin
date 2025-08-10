import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

/**
 * A simple, reliable dashboard component that will render even if other components fail
 */
const SimpleDashboard: React.FC = () => {
  const { user, businessProfile } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Simple Welcome Banner */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {businessProfile?.businessName || user?.displayName || 'Business Owner'}!
        </h1>
        <p className="mt-2 text-gray-600">
          This is your business dashboard where you can manage your coupons, customers, and more.
        </p>
      </div>

      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/business/coupons" 
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
            <span className="font-medium">Manage Coupons</span>
            <span className="text-sm text-gray-500">Create and manage your coupons</span>
          </Link>
          
          <Link 
            to="/business/customers" 
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex flex-col items-center text-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
            <span className="font-medium">Customers</span>
            <span className="text-sm text-gray-500">View and manage your customers</span>
          </Link>
          
          <Link 
            to="/business/qr-code" 
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex flex-col items-center text-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="font-medium">QR Codes</span>
            <span className="text-sm text-gray-500">Generate QR codes for your business</span>
          </Link>
                </div>
                </div>
      
      {/* Business Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Business Name:</span> {businessProfile?.businessName || 'Not set'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Owner:</span> {user?.displayName || 'Not set'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {user?.email || 'Not set'}
          </p>
          <div className="mt-4">
            <Link 
              to="/business/settings" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <span>Edit Business Profile</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
    </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;