import { useState, useCallback } from 'react';
import {
  loginWithEmail,
  registerUser,
  handleUserData as fetchUserDataFromFirestore
} from '../authServices';
import { ExtendedUser } from '../types';
import { BusinessProfile } from '../../../types';

/**
 * Original version of useAuthMethods for backward compatibility
 * This version maintains the original API that returns state variables
 */
export const useAuthMethods = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<BusinessProfile[]>([]);

  const handleUserData = useCallback(async (firebaseUser: any) => {
    try {
      if (!firebaseUser || !firebaseUser.uid) {
        console.error('[DEBUG][AuthContext] Invalid firebase user in handleUserData:', firebaseUser);
        setIsLoading(false);
        return null;
      }

      console.log('[DEBUG][AuthContext] handleUserData called with user:', firebaseUser.uid);

      // Use the authServices function to get the full user data from Firestore
      const extendedUser = await fetchUserDataFromFirestore(firebaseUser);
      
      if (!extendedUser) {
        console.error('[DEBUG][AuthContext] Failed to fetch extended user data from Firestore');
        setIsLoading(false);
        return null;
      }

      // Set the business profile in the context if it exists
      if (extendedUser.businessProfile) {
        console.log('[DEBUG][AuthContext] Setting business profile from user data:', extendedUser.businessProfile);
        setBusinessProfile(extendedUser.businessProfile);
      }

      setUser(extendedUser);
      setIsLoading(false);

      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error handling user data:', error);
      setIsLoading(false);
      return null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<ExtendedUser> => {
    try {
      console.log('[DEBUG][AuthContext] Starting login process for:', email);
      const userObject = await loginWithEmail(email, password);

      if (!userObject || !userObject.uid) {
        console.error('[DEBUG][AuthContext] Invalid user object returned from loginWithEmail');
        throw new Error('Failed to retrieve valid user data after login');
      }

      console.log('[DEBUG][AuthContext] Login successful, loading user data for:', userObject.uid);

      const extendedUser = await handleUserData(userObject);

      if (!extendedUser || !extendedUser.uid) {
        console.warn('[DEBUG][AuthContext] handleUserData failed to return valid user, using original user object');
        return userObject;
      }

      console.log('[DEBUG][AuthContext] Login and data loading complete for user:', extendedUser.uid);
      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in login function:', error);
      throw error;
    }
  }, [handleUserData]);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: 'business' | 'customer'
  ): Promise<ExtendedUser> => {
    try {
      const userObject = await registerUser(email, password, name, role);

      if (!userObject || !userObject.uid) {
        console.error('[DEBUG][AuthContext] Invalid user object returned from registerUser');
        throw new Error('Failed to retrieve valid user data after registration');
      }

      const extendedUser = await handleUserData(userObject);

      if (!extendedUser || !extendedUser.uid) {
        console.warn('[DEBUG][AuthContext] handleUserData failed to return valid user after registration, using original user object');
        return userObject;
      }

      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in register function:', error);
      throw error;
    }
  }, [handleUserData]);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    businessProfile,
    setBusinessProfile,
    userBusinesses,
    setUserBusinesses,
    handleUserData,
    login,
    register
  };
};