import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

const CurrencyManagement: React.FC = () => {
  return (
    <Link to="/admin/homepage/currency" className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium">Currency Management</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Manage system currencies, add new currencies, or update existing ones
          </p>
        </div>
    </Link>
  );
};

export default CurrencyManagement;