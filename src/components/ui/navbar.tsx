// src/components/ui/navbar.tsx
import React from 'react';
// Remove the useCurrency import
const Navbar: React.FC = () => {
  // Remove all currency-related state and effects
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo */}
              <img
                className="block h-8 w-auto"
                src="/logo.png"
                alt="Coupin"
              />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Navigation Links */}
              <a
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </a>
              <a
                href="/features"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Features
              </a>
              <a
                href="/pricing"
                className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </a>
              <a
                href="/about"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                About
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Right side actions */}
            <a
              href="/login"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Log in
            </a>
            <a
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
