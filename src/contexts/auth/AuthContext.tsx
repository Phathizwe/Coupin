import React, { createContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { 
  AuthContextType, 
  defaultContextValue,
  ExtendedUser
} from './types/extendedTypes';
import { useAuthMethods } from './hooks/useAuthMethodsOriginal'; // Use the compatibility version
import { useSocialAuth } from './hooks/useSocialAuth';
import { useBusinessAndUtilityMethods } from './hooks/useBusinessAndUtilityMethods';

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Export ExtendedUser directly
export type { ExtendedUser };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get core authentication methods
  const {
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
  } = useAuthMethods();

  // Get social authentication methods
  const {
    googleSignIn,
    facebookSignIn,
    microsoftSignIn,
    linkedInSignIn
  } = useSocialAuth(handleUserData);

  // Get business and utility methods
  const {
    logout,
    resetPassword,
    switchBusiness,
    fetchUserBusinesses,
    checkForInvitations
  } = useBusinessAndUtilityMethods(user, setUser, setBusinessProfile, setUserBusinesses);

  // Initialize auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.uid);
      
      try {
        if (currentUser) {
          await handleUserData(currentUser);
        } else {
          console.log('No user is signed in');
          setUser(null);
          setBusinessProfile(null);
          setUserBusinesses([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // Ensure loading state is turned off even if there's an error
        setIsLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [handleUserData, setUser, setBusinessProfile, setUserBusinesses, setIsLoading]);

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