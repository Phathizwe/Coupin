import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
    
    performLogout();
  }, [logout]);

  // Redirect to home page after logout
  return <Navigate to="/" replace />;
};

export default LogoutPage;