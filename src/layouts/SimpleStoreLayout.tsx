import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * A minimal layout for the simplified store experience
 * No sidebar, minimal header, focused on the task at hand
 */
const SimpleStoreLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="TYCA Logo" className="h-8 w-auto" />
            <span className="ml-2 font-semibold text-gray-800">TYCA</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => logout()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default SimpleStoreLayout;