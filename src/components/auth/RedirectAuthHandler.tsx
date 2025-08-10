import { useEffect } from 'react';
import { checkRedirectResult, handleUserData } from '../../contexts/auth/authServices';
import { checkGoogleRedirectResult } from '../../contexts/auth/googleAuthService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

/**
 * Component that checks for authentication redirect results on page load
 * This is necessary to handle social sign-in redirects
 */
const RedirectAuthHandler = () => {

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // First check for Google-specific redirect result
        console.log('[RedirectAuthHandler] Checking for Google redirect result');
        const googleResult = await checkGoogleRedirectResult();

        if (googleResult) {
          console.log('[RedirectAuthHandler] Processing Google redirect auth result for user:', googleResult.user.uid);

          try {
            // Process the user data with error handling
            const extendedUser = await handleUserData(googleResult.user);
            if (extendedUser) {
              toast.success('Successfully signed in with Google!');
            } else {
              console.error('[RedirectAuthHandler] Failed to process user data');
              toast.error('Error processing your account. Please try again.');
            }
          } catch (userDataError) {
            console.error('[RedirectAuthHandler] Error handling user data:', userDataError);
            toast.error('Error processing your account. Please try again.');
          }

          return; // Exit early if Google redirect was handled
        }

        // Then check for other providers' redirect results
        console.log('[RedirectAuthHandler] Checking for general redirect result');
        const result = await checkRedirectResult();

        if (result) {
          console.log('[RedirectAuthHandler] Processing redirect auth result for user:', result.uid);

          try {
            // Process the user data with error handling
            const extendedUser = await handleUserData(result);
            if (extendedUser) {
              toast.success('Successfully signed in!');
            } else {
              console.error('[RedirectAuthHandler] Failed to process user data');
              toast.error('Error processing your account. Please try again.');
            }
          } catch (userDataError) {
            console.error('[RedirectAuthHandler] Error handling user data:', userDataError);
            toast.error('Error processing your account. Please try again.');
          }
        }
      } catch (error) {
        console.error('[RedirectAuthHandler] Error handling redirect auth result:', error);
        toast.error('Failed to complete sign-in process');
      }
    };

    // Check for redirect result when component mounts
    handleRedirectResult();
  }, []);

  // This component doesn't render anything
  return null;
};

export default RedirectAuthHandler;