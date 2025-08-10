import { useState } from 'react';
import { auth } from '../../config/firebase';
import { toast } from 'react-toastify';
import { logUserSignIn } from '../../utils/analytics';
import { LoginFormValues, AuthSuccessHandler } from './types';

export const useEmailLogin = (
  login: (email: string, password: string) => Promise<any>,
  handleAuthSuccess: AuthSuccessHandler
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      console.log('[LoginPage] Attempting login with email:', values.email);
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userCredential = await login(values.email, values.password);
      
      // Check if userCredential is valid
      if (!userCredential) {
        console.error('[LoginPage] No user credential returned after login');
        throw new Error('Failed to authenticate user');
      }
        
      // Get the user ID from the credential or current auth state
      let userId = null;
      
      // First try to get the uid directly from the credential
      if (userCredential.uid) {
        userId = userCredential.uid;
        console.log('[LoginPage] Using uid from userCredential:', userId);
      } 
      // Then try to get the user object from credential
      else if (userCredential.user && userCredential.user.uid) {
        userId = userCredential.user.uid;
        console.log('[LoginPage] Using uid from userCredential.user:', userId);
      }
      // Finally, check if we have a current Firebase user as fallback
      else if (auth.currentUser) {
        userId = auth.currentUser.uid;
        console.log('[LoginPage] Using current Firebase user as fallback:', userId);
      }
      
      // If we still don't have a valid user ID, throw an error
      if (!userId) {
        console.error('[LoginPage] Failed to get valid user ID after login');
        throw new Error('Invalid user data received after login');
      }
      
      console.log('[LoginPage] Login successful, user:', userId);
      
      // Log the user sign-in event
      logUserSignIn('email');

      // Use the common auth success handler with the valid user ID
      await handleAuthSuccess(userId);
    } catch (error: any) {
      console.error('[LoginPage] Login error:', error);
      const errorMessage = error.message || 'Failed to log in';
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    loginError,
    setLoginError
  };
};