import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/ui/Logo';
import { BRAND, BRAND_MESSAGES } from '../constants/brandConstants';
import { HeroHeader } from '../components/ui/hero/HeroHeader';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // No need to navigate, the auth listener will handle it
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Include the Hero Header as the main navigation */}
      <HeroHeader />
      
      {/* Add spacing to account for fixed header */}
      <div className="pt-20"></div>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <Logo withTagline={true} />
          </div>
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900">
                Pricing
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Privacy Policy
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Terms of Service
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p className="mt-2 text-center text-sm text-gray-400">
            {BRAND.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;