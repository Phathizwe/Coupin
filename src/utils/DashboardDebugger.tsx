import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardDebugger: React.FC = () => {
  const { user, businessProfile, isLoading } = useAuth();
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Dashboard Debugger</h2>
      <div className="text-sm">
        <p><strong>Auth Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? `ID: ${user.uid}, Email: ${user.email}` : 'Not logged in'}</p>
        <p><strong>Business ID:</strong> {user?.businessId || 'Not available'}</p>
        <p><strong>Business Profile:</strong> {businessProfile ? 'Loaded' : 'Not loaded'}</p>
        {businessProfile && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p><strong>Business Name:</strong> {businessProfile.businessName}</p>
            <p><strong>Subscription:</strong> {businessProfile.subscriptionTier}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDebugger;