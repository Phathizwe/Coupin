import { useCallback } from 'react';
import { 
  loginWithEmail, 
  registerUser, 
  logoutUser, 
  resetUserPassword
} from '../authServices';
import { ExtendedUser } from '../types';
import { BusinessProfile } from '../../../types';

/**
 * Custom hook for core authentication methods
 * Extracts auth logic from the main context
 */
export const useAuthMethods = (
  handleUserData: (user: any) => Promise<ExtendedUser | null>,
  setUser: (user: ExtendedUser | null) => void,
  setBusinessProfile: (profile: BusinessProfile | null) => void,
  setUserBusinesses: (businesses: BusinessProfile[]) => void
) => {
  const login = useCallback(async (email: string, password: string): Promise<ExtendedUser> => {
    try {
      console.log('[AuthMethods] Starting login process for:', email);
      const userObject = await loginWithEmail(email, password);
      
      if (!userObject || !userObject.uid) {
        throw new Error('Failed to retrieve valid user data after login');
      }
      
      const extendedUser = await handleUserData(userObject);
      return extendedUser || userObject;
    } catch (error) {
      console.error('[AuthMethods] Login error:', error);
      throw error;
    }
  }, []); // Remove handleUserData dependency as it causes infinite loops

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: 'business' | 'customer'
  ): Promise<ExtendedUser> => {
    try {
      console.log('[AuthMethods] Starting registration with role:', role);
      const userObject = await registerUser(email, password, name, role);

      if (!userObject || !userObject.uid) {
        throw new Error('Failed to retrieve valid user data after registration');
      }

      const extendedUser = await handleUserData(userObject);
      return extendedUser || userObject;
    } catch (error) {
      console.error('[AuthMethods] Registration error:', error);
      throw error;
    }
  }, []); // Remove handleUserData dependency as it causes infinite loops

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('[AuthMethods] Logging out user');
      await logoutUser();
      setUser(null);
      setBusinessProfile(null);
      setUserBusinesses([]);
    } catch (error) {
      console.error('[AuthMethods] Logout error:', error);
      throw error;
    }
  }, []); // Remove setter dependencies as React state setters are stable

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      console.log('[AuthMethods] Resetting password for:', email);
      await resetUserPassword(email);
    } catch (error) {
      console.error('[AuthMethods] Reset password error:', error);
      throw error;
    }
  }, []);

  return {
    login,
    register,
    logout,
    resetPassword
  };
};