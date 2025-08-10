import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../ui/Logo';
import BusinessSwitcher from '../business/BusinessSwitcher';
import ViewToggle from '../ui/ViewToggle';
import { BRAND_COLORS } from '../../constants/brandConstants';

interface MainNavigationProps {
  onViewChange?: (view: 'default' | 'simple') => void;
  currentView?: 'default' | 'simple';
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  onViewChange, 
  currentView = 'default' 
}) => {
  const { user, businessProfile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show toggle on dashboard, coupons, results, and communications pages
  const showToggle = location.pathname.includes('/business/dashboard') ||
    location.pathname.includes('/business/coupons') ||
    location.pathname.includes('/business/results') ||
    location.pathname.includes('/business/communications');

  const handleViewChange = (view: 'default' | 'simple') => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Don't render if no user or no business
  if (!user || !user.businesses || user.businesses.length === 0) {
    return null;
  }

  // Navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/business/dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      name: 'Customers', 
      path: '/business/customers', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) 
    },
    { 
      name: 'Coupons', 
      path: '/business/coupons', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ) 
    },
    { 
      name: 'Loyalty', 
      path: '/business/loyalty', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) 
    },
    { 
      name: 'Communications', 
      path: '/business/communications', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      name: 'Analytics', 
      path: '/business/analytics', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      name: 'Settings', 
      path: '/business/settings', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Business Switcher */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Logo variant="small" />
            </div>
            <div className="hidden md:ml-6 md:flex">
              <BusinessSwitcher />
            </div>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {businessProfile && navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ${
                    isActive 
                      ? `bg-primary-50 text-primary-700` 
                      : `text-gray-600 hover:bg-gray-50 hover:text-primary-600`
                  }`
                }
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right side - User menu, view toggle, etc. */}
          <div className="flex items-center space-x-4">
            {/* Show the toggle on specific pages */}
            {showToggle && onViewChange && (
              <div className="hidden md:block">
                <ViewToggle
                  onChange={handleViewChange}
                  initialView={currentView}
                />
              </div>
            )}

            {/* User menu */}
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                {user?.displayName ? (
                  <span className="font-medium text-sm text-primary-700">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="font-medium text-sm text-primary-700">U</span>
                )}
              </div>
            </div>

            {/* Logout link */}
            <a href="/logout" className="hidden md:block text-gray-700 hover:text-gray-900 text-sm font-medium">
              Logout
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Business Switcher for mobile */}
            <div className="px-3 py-2">
              <BusinessSwitcher />
            </div>
            
            {/* Navigation links for mobile */}
            {businessProfile && navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    isActive 
                      ? `bg-primary-50 text-primary-700` 
                      : `text-gray-600 hover:bg-gray-50 hover:text-primary-600`
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
            
            {/* View toggle for mobile */}
            {showToggle && onViewChange && (
              <div className="px-3 py-2">
                <ViewToggle
                  onChange={handleViewChange}
                  initialView={currentView}
                />
              </div>
            )}
            
            {/* Logout link for mobile */}
            <a 
              href="/logout" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Logout
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavigation;