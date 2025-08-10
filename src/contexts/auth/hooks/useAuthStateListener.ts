import { useEffect } from 'react';

/**
 * COMPLETELY DISABLED AUTH STATE LISTENER TO FIX INFINITE LOOP
 * This hook is now a no-op to prevent the infinite loop issue
 * Version 2.0 - Cache Buster
 */
export const useAuthStateListener = (
  setIsLoading: any
) => {
  // COMPLETELY DISABLED - DO NOTHING
  useEffect(() => {
    console.log('[AuthStateListener] COMPLETELY DISABLED v2.0 - Cache Buster');
    // Set loading to false immediately
    if (setIsLoading) {
      setIsLoading(false);
    }
    
    // Return empty cleanup function
    return () => {
      console.log('[AuthStateListener] DISABLED cleanup v2.0');
    };
  }, [setIsLoading]);
  
  // Return nothing - completely disabled
  return;
};