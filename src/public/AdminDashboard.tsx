import React from 'react';
import { Link } from 'react-router-dom'; // Make sure to import Link

// Rest of your imports...

const AdminDashboard: React.FC = () => {
  // Your existing component code...

  return (
    <div>
      {/* Your existing dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Your existing cards */}

        {/* Add this new card for Currency Management */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Currency Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage currency metadata and symbols for the pricing page
            </p>
          </div>
          <div className="p-6">
            <Link
              to="/admin/currencies"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Manage Currencies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;