import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  viewMode?: 'detailed' | 'simple';
  onViewModeChange?: (mode: 'detailed' | 'simple') => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  viewMode = 'detailed',
  onViewModeChange
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between p-4">
          <div className="flex-1"></div>
          {/* View toggle */}
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-full p-1 flex items-center">
              <button
                onClick={() => onViewModeChange && onViewModeChange('detailed')}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'detailed' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Detailed
                </div>
              </button>
              <button
                onClick={() => onViewModeChange && onViewModeChange('simple')}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'simple' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                  Simple
                </div>
              </button>
            </div>
            {/* Divider */}
            <div className="mx-4 h-6 w-px bg-gray-200"></div>
            {/* Logout button */}
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
              Logout
            </button>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;