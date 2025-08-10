import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  AuthContextType,
  defaultContextValue,
  ExtendedUser
} from './auth/types';
import {
  loginWithEmail,
  registerUser,
  logoutUser,
  resetUserPassword,
  socialSignIn,
  checkForInvitations as checkInvitations
} from './auth/authServices';
import { loadUserData } from './auth/userDataService';
import {
  fetchBusinessProfiles,
  switchBusiness as switchBusinessProfile
} from './auth/businessServices';
import { BusinessProfile } from '../types';

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export type { ExtendedUser };

// Add this custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      const { extendedUser, businessIds, currentBusinessId } = await loadUserData(firebaseUser);

      setUser(extendedUser);
      console.log('[DEBUG][AuthContext] User state set to:', extendedUser?.uid);

      if (businessIds && businessIds.length > 0) {
        const { businessProfiles, currentProfile } = await fetchBusinessProfiles(
          businessIds,
          currentBusinessId
        );

        setUserBusinesses(businessProfiles);
        if (currentProfile) {
          setBusinessProfile(currentProfile);
        }
      }

      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error handling user data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[DEBUG][AuthContext] Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('[DEBUG][AuthContext] Auth state changed:', currentUser?.uid);

      if (currentUser) {
        await handleUserData(currentUser);
      } else {
        console.log('[DEBUG][AuthContext] No user is signed in');
        setUser(null);
        setBusinessProfile(null);
        setUserBusinesses([]);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('[DEBUG][AuthContext] Cleaning up auth state listener');
      unsubscribe();
    };
  }, [handleUserData]);

  const login = async (email: string, password: string): Promise<ExtendedUser> => {
    try {
      console.log('[DEBUG][AuthContext] Starting login process for:', email);
      const userObject = await loginWithEmail(email, password);

      if (!userObject || !userObject.uid) {
        console.error('[DEBUG][AuthContext] Invalid user object returned from loginWithEmail');

        if (auth.currentUser) {
          console.log('[DEBUG][AuthContext] Using current Firebase user as fallback');
          const extendedUser = await handleUserData(auth.currentUser);
          if (extendedUser && extendedUser.uid) {
            return extendedUser;
          }
          return auth.currentUser as ExtendedUser;
        }

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
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'business' | 'customer'
  ): Promise<ExtendedUser> => {
    try {
      const userObject = await registerUser(email, password, name, role);

      if (!userObject || !userObject.uid) {
        console.error('[DEBUG][AuthContext] Invalid user object returned from registerUser');

        if (auth.currentUser) {
          console.log('[DEBUG][AuthContext] Using current Firebase user as fallback for registration');
          const extendedUser = await handleUserData(auth.currentUser);
          if (extendedUser && extendedUser.uid) {
            return extendedUser;
          }
          return auth.currentUser as ExtendedUser;
        }

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
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      setBusinessProfile(null);
      setUserBusinesses([]);
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in logout function:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await resetUserPassword(email);
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in resetPassword function:', error);
      throw error;
    }
  };

  const googleSignIn = async (): Promise<ExtendedUser> => {
    try {
      console.log('[DEBUG][AuthContext] Starting Google sign-in');
      const extendedUser = await socialSignIn('google');

      console.log('[DEBUG][AuthContext] Google sign-in returned:', extendedUser);

      if (!extendedUser || !extendedUser.uid) {
        console.error('[DEBUG][AuthContext] No valid user object in Google sign-in result');

        if (auth.currentUser) {
          console.log('[DEBUG][AuthContext] Using current Firebase user as fallback for Google sign-in');
          const fallbackUser = await handleUserData(auth.currentUser);
          if (fallbackUser && fallbackUser.uid) {
            return fallbackUser;
          }
          return auth.currentUser as ExtendedUser;
        }

        throw new Error('Failed to retrieve valid user data after Google sign-in');
      }

      console.log('[DEBUG][AuthContext] Google sign-in successful, user:', extendedUser.uid);
      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in googleSignIn function:', error);
      throw error;
    }
  };

  const facebookSignIn = async (): Promise<ExtendedUser> => {
    try {
      console.log('[DEBUG][AuthContext] Starting Facebook sign-in');
      const extendedUser = await socialSignIn('facebook');

      console.log('[DEBUG][AuthContext] Facebook sign-in returned:', extendedUser);

      if (!extendedUser || !extendedUser.uid) {
        console.error('[DEBUG][AuthContext] No valid user object in Facebook sign-in result');

        if (auth.currentUser) {
          console.log('[DEBUG][AuthContext] Using current Firebase user as fallback for Facebook sign-in');
          const fallbackUser = await handleUserData(auth.currentUser);
          if (fallbackUser && fallbackUser.uid) {
            return fallbackUser;
          }
          return auth.currentUser as ExtendedUser;
        }

        throw new Error('Failed to retrieve valid user data after Facebook sign-in');
      }

      console.log('[DEBUG][AuthContext] Facebook sign-in successful, user:', extendedUser.uid);
      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in facebookSignIn function:', error);
      throw error;
    }
  };

  const microsoftSignIn = async (): Promise<ExtendedUser> => {
    try {
      console.log('[DEBUG][AuthContext] Starting Microsoft sign-in');
      const extendedUser = await socialSignIn('microsoft');

      console.log('[DEBUG][AuthContext] Microsoft sign-in returned:', extendedUser);

      if (!extendedUser || !extendedUser.uid) {
        console.error('[DEBUG][AuthContext] No valid user object in Microsoft sign-in result');

        if (auth.currentUser) {
          console.log('[DEBUG][AuthContext] Using current Firebase user as fallback for Microsoft sign-in');
          const fallbackUser = await handleUserData(auth.currentUser);
          if (fallbackUser && fallbackUser.uid) {
            return fallbackUser;
          }
          return auth.currentUser as ExtendedUser;
        }

        throw new Error('Failed to retrieve valid user data after Microsoft sign-in');
      }

      console.log('[DEBUG][AuthContext] Microsoft sign-in successful, user:', extendedUser.uid);
      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in microsoftSignIn function:', error);
      throw error;
    }
  };

  const linkedInSignIn = async (): Promise<ExtendedUser> => {
    try {
      console.log('[DEBUG][AuthContext] Starting LinkedIn sign-in');
      const extendedUser = await socialSignIn('linkedin');

      console.log('[DEBUG][AuthContext] LinkedIn sign-in returned:', extendedUser);

      if (!extendedUser || !extendedUser.uid) {
        console.error('[DEBUG][AuthContext] No valid user object in LinkedIn sign-in result');

        if (auth.currentUser) {
          console.log('[DEBUG][AuthContext] Using current Firebase user as fallback for LinkedIn sign-in');
          const fallbackUser = await handleUserData(auth.currentUser);
          if (fallbackUser && fallbackUser.uid) {
            return fallbackUser;
          }
          return auth.currentUser as ExtendedUser;
        }

        throw new Error('Failed to retrieve valid user data after LinkedIn sign-in');
      }

      console.log('[DEBUG][AuthContext] LinkedIn sign-in successful, user:', extendedUser.uid);
      return extendedUser;
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in linkedInSignIn function:', error);
      throw error;
    }
  };

  const switchBusiness = async (businessId: string) => {
    if (!user) return;

    try {
      const newBusinessProfile = await switchBusinessProfile(user.uid, businessId);

      if (newBusinessProfile) {
        setBusinessProfile(newBusinessProfile);

        setUser((prev: ExtendedUser | null) => {
          if (!prev) return null;
          return {
            ...prev,
            businessId: businessId,
            currentBusinessId: businessId
          };
        });
      }
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in switchBusiness function:', error);
      throw error;
    }
  };

  const fetchUserBusinesses = async () => {
    if (!user) return;

    try {
      const { businessProfiles, currentProfile } = await fetchBusinessProfiles(
        user.businesses || [],
        user.businessId
      );

      setUserBusinesses(businessProfiles);
      if (currentProfile) {
        setBusinessProfile(currentProfile);
      }
    } catch (error) {
      console.error('[DEBUG][AuthContext] Error in fetchUserBusinesses function:', error);
    }
  };

  const checkForInvitations = async (): Promise<boolean> => {
    if (!user?.email) return false;
    return checkInvitations(user.email);
  };

  const value = {
    user,
    isLoading,
    businessProfile,
    userBusinesses,
    login,
    register,
    logout,
    resetPassword,
    googleSignIn,
    facebookSignIn,
    microsoftSignIn,
    linkedInSignIn,
    switchBusiness,
    fetchUserBusinesses,
    checkForInvitations,
    handleUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;