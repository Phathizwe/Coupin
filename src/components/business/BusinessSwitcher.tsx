import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BusinessProfile } from '../../types';

const BusinessSwitcher: React.FC = () => {
  const { user, businessProfile, userBusinesses, switchBusiness, fetchUserBusinesses } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUserBusinesses();
  }, [fetchUserBusinesses]);

  const handleSwitchBusiness = async (businessId: string) => {
    try {
      await switchBusiness(businessId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching business:', error);
    }
  };

  if (!user || !user.businesses || user.businesses.length <= 1) {
    return null; // Don't show the switcher if user has only one business
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>{businessProfile?.businessName || 'Select Business'}</span>
        <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {userBusinesses.map((business: BusinessProfile) => (
              <button
                key={business.businessId}
                onClick={() => handleSwitchBusiness(business.businessId)}
                className={`block w-full text-left px-4 py-2 text-sm ${business.businessId === user.businessId
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                role="menuitem"
              >
                {business.businessName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSwitcher;