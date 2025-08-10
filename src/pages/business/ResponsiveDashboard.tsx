import React, { useState, useEffect } from 'react';
import BusinessDashboard from './Dashboard';
import MobileDashboard from './MobileDashboard';
import { useLocation } from 'react-router-dom';

// No props needed anymore since we're using context
const ResponsiveDashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detect if the device is mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Listen for window resize events
    window.addEventListener('resize', checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Render the appropriate dashboard based on device type
  // No need to pass viewMode prop anymore as BusinessDashboard uses context
  return isMobile ? 
    <MobileDashboard /> : 
    <BusinessDashboard />;
};

export default ResponsiveDashboard;