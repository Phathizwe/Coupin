import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ViewToggle from '../../../components/ui/ViewToggle';

interface SimpleHeaderProps {
  viewMode: 'default' | 'simple';
  onViewModeChange: (mode: 'default' | 'simple') => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({ viewMode, onViewModeChange }) => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled by the auth state listener
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex justify-end items-center p-4">
      <div className="flex items-center space-x-4">
        <ViewToggle onChange={onViewModeChange} initialView={viewMode} />
        <button 
          onClick={handleLogout}
          className="text-gray-700 hover:text-gray-900 font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SimpleHeader;