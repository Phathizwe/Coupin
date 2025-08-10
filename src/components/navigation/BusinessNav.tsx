import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BusinessSwitcher from '../business/BusinessSwitcher';

interface BusinessNavProps {
  className?: string;
}

const BusinessNav: React.FC<BusinessNavProps> = ({ className = '' }) => {
  const { user, businessProfile } = useAuth();

  // Don't render if no user or no business
  if (!user || !user.businesses || user.businesses.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Business name and switcher */}
      <div className="mr-4">
        <BusinessSwitcher />
      </div>

      {/* Business navigation links - only show if a business is selected */}
      {businessProfile && (
        <nav className="flex space-x-4">
          <Link
            to="/business/dashboard"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            to="/business/coupons"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Coupons
          </Link>
          <Link
            to="/business/customers"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Customers
          </Link>
          <Link
            to="/business/analytics"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Analytics
          </Link>
          <Link
            to="/business/settings"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Settings
          </Link>
        </nav>
      )}
    </div>
  );
};

export default BusinessNav;