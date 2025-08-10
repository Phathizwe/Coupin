import { useState, useEffect } from 'react';

/**
 * Custom hook to detect viewport size without external dependencies
 */
export const useViewport = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);
    
    // Set initial width
    setWidth(window.innerWidth);
    
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // Derived values for common breakpoints
  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024
  };
};

export default useViewport;