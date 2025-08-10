import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage authentication loading state with safety timeout
 * This ensures the loading state will always resolve, even if there's an error
 */
export const useLoadingState = (initialState = true) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasBeenSet = useRef(false);

  // Set up a safety timeout to ensure loading state resolves
  useEffect(() => {
    // If loading is already false, no need for timeout
    if (!isLoading) {
      hasBeenSet.current = true;
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a 7-second safety timeout to ensure loading state resolves
    timeoutRef.current = setTimeout(() => {
      console.warn('[SafetyTimeout] Loading state forced to resolve after timeout');
      setIsLoading(false);
      hasBeenSet.current = true;
    }, 7000); // 7 seconds max loading time (reduced from 10)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);

  // Enhanced setter that logs state changes
  const setLoadingState = (state: boolean) => {
    console.log(`[LoadingState] Setting loading state to: ${state}`);

    // Clear timeout when manually setting state
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    hasBeenSet.current = true;
    setIsLoading(state);
  };

  // Force resolve function for emergency cases
  const forceResolve = () => {
    console.warn('[LoadingState] Force resolving loading state');
    setLoadingState(false);
  };

  return [isLoading, setLoadingState, forceResolve] as const;
};