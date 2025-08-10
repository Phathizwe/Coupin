
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useOutletContext, useLocation } from 'react-router-dom';
import Header from '../components/navigation/Header';
import Sidebar from '../components/navigation/Sidebar';
import { useAuth } from '../hooks/useAuth';

// Define the context type
interface DashboardContextType {
  viewMode: 'default' | 'simple';
  onViewChange: (mode: 'default' | 'simple') => void;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Create a hook to use the context
export const useDashboardContext = () => useContext(DashboardContext);
const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Get the initial view mode from localStorage or default to 'default'
  const [viewMode, setViewMode] = useState<'default' | 'simple'>(() => {
    const savedMode = localStorage.getItem('viewMode');
    return (savedMode === 'simple' || savedMode === 'default') ? savedMode : 'default';
  });

  // Update view mode based on URL
  useEffect(() => {
    if (location.pathname.includes('/simple')) {
      setViewMode('simple');
    } else {
      // Check localStorage for saved preference when not on a simple route
      const savedMode = localStorage.getItem('viewMode');
      if (savedMode === 'simple' || savedMode === 'default') {
        setViewMode(savedMode);
      }
    }
  }, [location.pathname]);

  // Update localStorage when viewMode changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Handler for changing view mode
  const handleViewChange = (mode: 'default' | 'simple') => {
    setViewMode(mode);
  };

  if (!user) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <DashboardContext.Provider value={{ viewMode, onViewChange: handleViewChange }}>
      <div className="h-screen flex flex-col">
        <Header onViewChange={handleViewChange} currentView={viewMode} />

        <div className="flex-1 flex overflow-hidden">
          {/* Only render the sidebar if we're in default mode */}
          {viewMode === 'default' && <Sidebar />}

          <main className={`flex-1 overflow-auto bg-gray-50 ${viewMode === 'simple' ? 'w-full' : ''}`}>
            {/* Pass the current view mode to all child routes */}
            <div className="dashboard-outlet-container" data-view-mode={viewMode}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;