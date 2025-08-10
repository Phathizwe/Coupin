import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MainNavigation from '../components/navigation/MainNavigation';
import { HeroHeader } from '../components/ui/hero/HeroHeader';
import { useAuth } from '../hooks/useAuth';

const BusinessLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'default' | 'simple'>('default');
  const { user } = useAuth();

  const handleViewChange = (view: 'default' | 'simple') => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Use HeroHeader for unauthenticated users, MainNavigation for authenticated users */}
      {user ? (
        <MainNavigation 
          onViewChange={handleViewChange}
          currentView={currentView}
        />
      ) : (
        <HeroHeader />
      )}
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet context={{ view: currentView }} />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TYCA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusinessLayout;