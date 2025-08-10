import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ViewToggle from '../ui/ViewToggle';
import { useLocation } from 'react-router-dom';
import { CurrencyRegionSetter } from '../ui/currency-region/currency-region-setter';

interface HeaderProps {
  onViewChange?: (view: 'default' | 'simple') => void;
  currentView?: 'default' | 'simple';
}

const Header: React.FC<HeaderProps> = ({ onViewChange, currentView = 'default' }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Show toggle on dashboard, customers, coupons, results, communications, loyalty, settings, and billing pages
  const showToggle = location.pathname.includes('/business/dashboard') ||
    location.pathname.includes('/business/customers') ||
    location.pathname.includes('/business/coupons') ||
    location.pathname.includes('/business/results') ||
    location.pathname.includes('/business/communications') ||
    location.pathname.includes('/business/loyalty') ||
    location.pathname.includes('/business/settings') ||
    location.pathname.includes('/business/billing'); // Added billing page
    
  const handleViewChange = (view: 'default' | 'simple') => {
    if (onViewChange) {
      console.log('Header: changing view to', view); // For debugging
      onViewChange(view);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Regulist"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Region Selector for unsigned users */}
            {!user && (
              <div className="w-auto max-w-[200px]">
                <CurrencyRegionSetter />
              </div>
            )}

            {/* Show the toggle on dashboard, customers, coupons, results, communications, loyalty, settings, and billing pages */}
            {showToggle && onViewChange && (
              <ViewToggle
                onChange={handleViewChange}
                initialView={currentView}
              />
                )}

            {/* User menu or other header items */}
            {user ? (
              <>
                <div className="ml-3 relative">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {user?.displayName ? (
                      <span className="font-medium text-sm text-gray-900">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span className="font-medium text-sm text-gray-900">U</span>
                    )}
          </div>
        </div>

                {/* Logout link */}
                <a href="/logout" className="text-gray-900 hover:text-gray-700 text-sm font-medium">
                  Logout
                </a>
              </>
            ) : (
              <>
                {/* Login and Register links for unsigned users */}
                <a href="/login" className="text-gray-900 hover:text-gray-700 text-sm font-medium">
                  Login
                </a>
                <a href="/register" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Register
                </a>
              </>
            )}
      </div>
        </div>
      </div>
    </header>
  );
};

export default Header;