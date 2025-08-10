import React, { ReactNode } from 'react';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';

interface BusinessLayoutProps {
  children: ReactNode;
}

const BusinessLayout: React.FC<BusinessLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;