import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../ui/Logo';
import ViewToggle from '../ui/ViewToggle';

interface CustomerNavigationProps {
  onViewChange?: (view: 'default' | 'simple') => void;
  currentView?: 'default' | 'simple';
}

const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ 
  onViewChange, 
  currentView = 'default' 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Show toggle on dashboard and coupons pages
  const showToggle = location.pathname.includes('/customer/dashboard') ||
    location.pathname.includes('/customer/coupons');

  const handleViewChange = (view: 'default' | 'simple') => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled by auth state listener
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  // Navigation items for customer
  const navItems = [
    { 
      name: 'My Coupons', 
      path: '/customer/coupons', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ) 
    },
    { 
      name: 'My Loyalty', 
      path: '/customer/loyalty', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) 
    },
    { 
      name: 'Saved Stores', 
      path: '/customer/saved-stores', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ) 
    },
    { 
      name: 'Profile', 
      path: '/customer/profile', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    }
  ];

  return (
    <>
      {/* Top navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Logo variant="small" />
              </div>
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

              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">Open menu</span>
                {sidebarOpen ? (
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
      </nav>

      {/* Sidebar and content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            {/* User profile section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="font-medium text-lg text-primary-700">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.displayName || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation links */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-2 space-y-1">
                {/* Dashboard link (always first) */}
                <NavLink
                  to="/customer/dashboard"
                  className={({ isActive }) => 
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                    }`
                  }
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-3 h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                    />
                  </svg>
                  Dashboard
                </NavLink>

                {/* Other navigation links */}
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => 
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}

                {/* Sign out button */}
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary-600 w-full text-left"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-3 h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 flex z-40">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              aria-hidden="true"
              onClick={() => setSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* User profile section */}
              <div className="px-4 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-medium text-lg text-primary-700">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.displayName || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile navigation */}
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {/* Dashboard link */}
                  <NavLink
                    to="/customer/dashboard"
                    className={({ isActive }) => 
                      `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-4 h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                      />
                    </svg>
                    Dashboard
                  </NavLink>

                  {/* Other navigation links */}
                  {navItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => 
                        `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-4 h-6 w-6">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}

                  {/* View toggle for mobile */}
                  {showToggle && onViewChange && (
                    <div className="px-2 py-2">
                      <ViewToggle
                        onChange={handleViewChange}
                        initialView={currentView}
                      />
                    </div>
                  )}

                  {/* Sign out button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary-600 w-full text-left"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-4 h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    Sign out
                  </button>
                </nav>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Content goes here */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CustomerNavigation;