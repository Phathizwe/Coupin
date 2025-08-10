import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { loginWithEmail } from '../contexts/auth/authServices';
import { getDeviceAppropriateBusinessDashboard } from '../utils/deviceDetection';

export const useLoginLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { googleSignIn } = useAuth();

  const handleAuthSuccess = (user: any) => {
    console.log('[DEBUG][useLoginLogic] Auth success, user:', user);
    if (user?.role === 'business') {
      // Use device detection to determine appropriate dashboard
      const dashboardRoute = getDeviceAppropriateBusinessDashboard();
      navigate(dashboardRoute);
    } else if (user?.role === 'customer') {
      navigate('/customer/dashboard');
    } else {
      // Default to appropriate business dashboard if role is unclear
      console.warn('[DEBUG][useLoginLogic] User role unclear, defaulting to business dashboard. User:', user);
      const dashboardRoute = getDeviceAppropriateBusinessDashboard();
      navigate(dashboardRoute);
    }
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('[DEBUG][useLoginLogic] Starting email/password login');
      const user = await loginWithEmail(values.email, values.password);
      console.log('[DEBUG][useLoginLogic] Email/password login successful:', user);
      handleAuthSuccess(user);
    } catch (error: any) {
      console.error('[DEBUG][useLoginLogic] Email/password login error:', error);
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('[DEBUG][useLoginLogic] Starting direct Google sign-in');
      const user = await googleSignIn();

      console.log('[DEBUG][useLoginLogic] Direct Google sign-in returned:', user);

      if (!user || !user.uid) {
        console.error('[DEBUG][useLoginLogic] No valid user object returned from Google sign-in');
        throw new Error('Failed to retrieve valid user data after Google sign-in');
      }

      // Add this check to ensure role is set
      if (!user.role) {
        console.warn('[DEBUG][useLoginLogic] User role is missing, defaulting to customer');
        user.role = 'customer';
      }
      console.log('[DEBUG][useLoginLogic] Direct Google sign-in successful, user ID:', user.uid, 'role:', user.role);
      handleAuthSuccess(user);
    } catch (error: any) {
      console.error('[DEBUG][useLoginLogic] Direct Google sign-in error:', error);
      setLoginError(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('[DEBUG][useLoginLogic] Facebook sign-in not implemented yet');
      setLoginError('Facebook sign-in is not available yet.');
    } catch (error: any) {
      console.error('[DEBUG][useLoginLogic] Facebook sign-in error:', error);
      setLoginError(error.message || 'Facebook sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('[DEBUG][useLoginLogic] Microsoft sign-in not implemented yet');
      setLoginError('Microsoft sign-in is not available yet.');
    } catch (error: any) {
      console.error('[DEBUG][useLoginLogic] Microsoft sign-in error:', error);
      setLoginError(error.message || 'Microsoft sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    setLoginError(null);
    try {
      console.log('[DEBUG][useLoginLogic] LinkedIn sign-in not implemented yet');
      setLoginError('LinkedIn sign-in is not available yet.');
    } catch (error: any) {
      console.error('[DEBUG][useLoginLogic] LinkedIn sign-in error:', error);
      setLoginError(error.message || 'LinkedIn sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loginError,
    handleLogin,
    handleGoogleSignIn,
    handleFacebookSignIn,
    handleMicrosoftSignIn,
    handleLinkedInSignIn
  };
};
