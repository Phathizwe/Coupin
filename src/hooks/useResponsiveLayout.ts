import { useState, useEffect } from 'react';

/**
 * useResponsiveLayout - Manages responsive layout states for billing page
 * 
 * Handles:
 * - Detailed view (desktop with left menu)
 * - Simple view (mobile without left menu)
 * - Breakpoint detection
 * - Layout preferences
 */
const useResponsiveLayout = () => {
  const [isDetailedView, setIsDetailedView] = useState(window.innerWidth >= 768);
  const [isCompactView, setIsCompactView] = useState(window.innerWidth < 768);
  const [layoutPreference, setLayoutPreference] = useState<'detailed' | 'compact'>('detailed');
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDetailedView(width >= 768);
      setIsCompactView(width < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleLayoutPreference = () => {
    setLayoutPreference(prev => prev === 'detailed' ? 'compact' : 'detailed');
  };

  return {
    isDetailedView,
    isCompactView,
    layoutPreference,
    toggleLayoutPreference,
    setLayoutPreference
  };
};

export default useResponsiveLayout;