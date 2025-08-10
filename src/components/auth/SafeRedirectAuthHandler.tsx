import { useEffect, useState, useRef } from 'react';
// import { checkRedirectResult } from '../../contexts/auth/authServices';
// import { checkGoogleRedirectResult } from '../../contexts/auth/googleAuthService';
import { useAuth } from '../../hooks/useAuth';
// import { toast } from 'react-toastify';
// import { UserCredential } from 'firebase/auth';

/**
 * Enhanced component that checks for authentication redirect results on page load
 * Includes safety timeouts to prevent blocking the app if redirect handling fails
 *
 * CURRENTLY DISABLED to prevent race conditions with popup-based authentication
 */
const SafeRedirectAuthHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessedRef.current) {
      return;
    }

    // Only process redirects if we're not already processing and there's a potential redirect
    const urlParams = new URLSearchParams(window.location.search);
    const hasRedirectParams = urlParams.has('code') || urlParams.has('state') || window.location.hash.includes('access_token');

    if (!hasRedirectParams) {
      console.log('[RedirectAuthHandler] DISABLED - No redirect parameters found, skipping redirect check');
      hasProcessedRef.current = true;
      return;
    }

    console.log('[RedirectAuthHandler] DISABLED - Skipping redirect result check to prevent race conditions');
    hasProcessedRef.current = true;

    return;

    // The following code is disabled to prevent race conditions with popup-based sign-in
    // Uncomment and modify if redirect-based authentication is needed
    /*
    console.log('[RedirectAuthHandler] Redirect parameters detected, checking for auth result');

    // Set a timeout to ensure redirect handling doesn't block the app
    timeoutRef.current = setTimeout(() => {
      if (isProcessing) {
        console.warn('[RedirectAuthHandler] Timeout reached, continuing app initialization');
        setIsProcessing(false);
      }
    }, 2000); // 2 seconds max for redirect handling (reduced from 3)

    const handleRedirectResult = async () => {
      if (hasProcessedRef.current) return;

      setIsProcessing(true);
      hasProcessedRef.current = true;

      try {
        // First check for Google-specific redirect result with timeout
        console.log('[RedirectAuthHandler] Checking for Google redirect result');
        const googleResult = await Promise.race([
          checkGoogleRedirectResult(),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Google redirect check timed out')), 1500)
          )
        ]) as UserCredential | null;

        if (googleResult && googleResult.user) {
          console.log('[RedirectAuthHandler] Processing Google redirect auth result for user:', googleResult.user.uid);

          try {
            await handleUserData(googleResult.user);
            toast.success('Successfully signed in with Google!');

            // Clear URL parameters after successful auth
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('[RedirectAuthHandler] Error processing Google redirect user data:', error);
            toast.error('Authentication successful, but there was an error loading your profile.');
          }
        } else {
          // Check for general redirect result with timeout
          console.log('[RedirectAuthHandler] Checking for general redirect result');
          const generalResult = await Promise.race([
            checkRedirectResult(),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('General redirect check timed out')), 1500)
            )
          ]) as UserCredential | null;

          if (generalResult && generalResult.user) {
            console.log('[RedirectAuthHandler] Processing general redirect auth result for user:', generalResult.user.uid);

            try {
              await handleUserData(generalResult.user);
              toast.success('Successfully signed in!');

              // Clear URL parameters after successful auth
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
              console.error('[RedirectAuthHandler] Error processing general redirect user data:', error);
              toast.error('Authentication successful, but there was an error loading your profile.');
            }
          } else {
            console.log('[RedirectAuthHandler] No redirect result found');
          }
        }
      } catch (error: any) {
        console.error('[RedirectAuthHandler] Error checking redirect result:', error);
        // Don't show error toast for timeouts or expected errors
        if (!error?.message?.includes('timed out')) {
          toast.error('There was an error processing your sign-in. Please try again.');
        }
      } finally {
        setIsProcessing(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    // Small delay to ensure DOM is ready and prevent race conditions
    const delayedCheck = setTimeout(() => {
      handleRedirectResult();
    }, 50); // Reduced delay from 100ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      clearTimeout(delayedCheck);
    };
    */
  }, []); // Empty dependency array - only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Don't render anything while processing
  if (isProcessing) {
    return null;
  }

  return null;
};

export default SafeRedirectAuthHandler;