/**
 * Utility functions for device detection
 */

/**
 * Detects if the current device is a mobile device
 * @returns boolean indicating if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  // Check if window is available (for SSR compatibility)
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Use user agent to detect mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Regular expression for mobile device detection
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check screen width as an additional indicator (devices smaller than 768px are considered mobile)
  const isMobileWidth = window.innerWidth < 768;
  
  return mobileRegex.test(userAgent) || isMobileWidth;
};

/**
 * Gets the appropriate dashboard route based on device type
 * @returns The dashboard route path appropriate for the current device
 */
export const getDeviceAppropriateBusinessDashboard = (): string => {
  return isMobileDevice() 
    ? '/business/dashboard/simple'
    : '/business/dashboard/';
};