import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { AuthContextType, ExtendedUser, defaultContextValue } from './types';
import { BusinessProfile } from '../../types';
import {
  loginWithEmail,
  registerUser,
  logoutUser,
  resetUserPassword,
  socialSignIn,
    switchBusiness,
    fetchUserBusinesses,
  checkForInvitations,
    handleUserData
} from './authServices';

// Create the context with default values
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<BusinessProfile[]>([]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Auth state changed: User is signed in');
          const extendedUser = await handleUserData(firebaseUser);
          
          if (extendedUser) {
            setUser(extendedUser);
            
            // Set business profile if available
            if (extendedUser.businessProfile) {
              setBusinessProfile(extendedUser.businessProfile);
            } else {
              setBusinessProfile(null);
            }
            
            // Fetch user businesses
            const businesses = await fetchUserBusinesses(extendedUser.uid);
            setUserBusinesses(businesses);
          } else {
            console.error('Failed to get extended user data');
            setUser(null);
            setBusinessProfile(null);
            setUserBusinesses([]);
          }
        } else {
          console.log('Auth state changed: User is signed out');
          setUser(null);
          setBusinessProfile(null);
          setUserBusinesses([]);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setUser(null);
        setBusinessProfile(null);
        setUserBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const user = await loginWithEmail(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Register with email and password
  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'business' | 'customer',
    phone?: string // Add optional phone parameter
  ) => {
    try {
      const user = await registerUser(email, password, name, role, phone);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      throw error;
    }
};

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await resetUserPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Social sign-in methods
  const googleSignIn = async () => {
    try {
      const user = await socialSignIn('google');
      return user;
    } catch (error) {
      throw error;
    }
  };

  const facebookSignIn = async () => {
    try {
      const user = await socialSignIn('facebook');
      return user;
    } catch (error) {
      throw error;
    }
  };

  const microsoftSignIn = async () => {
    try {
      const user = await socialSignIn('microsoft');
      return user;
    } catch (error) {
      throw error;
    }
  };

  const linkedInSignIn = async () => {
    try {
      const user = await socialSignIn('linkedin');
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Switch business
  const switchBusinessContext = async (businessId: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await switchBusiness(user.uid, businessId);

      // Refresh user data
      if (auth.currentUser) {
        const updatedUser = await handleUserData(auth.currentUser);
        if (updatedUser) {
          setUser(updatedUser);

          // Update business profile
          if (updatedUser.businessProfile) {
            setBusinessProfile(updatedUser.businessProfile);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Fetch user businesses
  const fetchUserBusinessesContext = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const businesses = await fetchUserBusinesses(user.uid);
      setUserBusinesses(businesses);
    } catch (error) {
      throw error;
    }
  };

  // Check for invitations
  const checkForInvitationsContext = async () => {
    try {
      if (!user || !user.email) {
        return false;
      }

      return await checkForInvitations(user.email);
    } catch (error) {
      console.error('Error checking for invitations:', error);
      return false;
    }
  };

  // Context value
  const contextValue: AuthContextType = {
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
    switchBusiness: switchBusinessContext,
    fetchUserBusinesses: fetchUserBusinessesContext,
    checkForInvitations: checkForInvitationsContext,
    handleUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
