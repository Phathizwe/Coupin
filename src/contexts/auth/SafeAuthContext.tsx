import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, defaultContextValue, ExtendedUser } from './types';
import { BusinessProfile } from '../../types';

// Create the context with default values
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<BusinessProfile[]>([]);

  // Implement all the required methods
  const login = async (email: string, password: string): Promise<ExtendedUser> => {
    // Implementation would go here
    console.log('Login called with', email);
    return {} as ExtendedUser;
  };

  const register = async (email: string, password: string, name: string, role: 'business' | 'customer'): Promise<ExtendedUser> => {
    // Implementation would go here
    console.log('Register called with', email, name, role);
    return {} as ExtendedUser;
  };

  const logout = async (): Promise<void> => {
    // Implementation would go here
    console.log('Logout called');
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Implementation would go here
    console.log('Reset password called for', email);
  };

  const googleSignIn = async (): Promise<ExtendedUser> => {
    // Implementation would go here
    console.log('Google sign in called');
    return {} as ExtendedUser;
  };

  const facebookSignIn = async (): Promise<ExtendedUser> => {
    // Implementation would go here
    console.log('Facebook sign in called');
    return {} as ExtendedUser;
  };

  const microsoftSignIn = async (): Promise<ExtendedUser> => {
    // Implementation would go here
    console.log('Microsoft sign in called');
    return {} as ExtendedUser;
  };

  const linkedInSignIn = async (): Promise<ExtendedUser> => {
    // Implementation would go here
    console.log('LinkedIn sign in called');
    return {} as ExtendedUser;
  };

  const switchBusiness = async (businessId: string): Promise<void> => {
    // Implementation would go here
    console.log('Switch business called with', businessId);
  };

  const fetchUserBusinesses = async (): Promise<void> => {
    // Implementation would go here
    console.log('Fetch user businesses called');
  };

  const checkForInvitations = async (): Promise<boolean> => {
    // Implementation would go here
    console.log('Check for invitations called');
    return false;
  };

  const handleUserData = async (firebaseUser: any): Promise<ExtendedUser | null> => {
    // Implementation would go here
    console.log('Handle user data called with', firebaseUser);
    return null;
  };

  // Provide the context value
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
    switchBusiness,
    fetchUserBusinesses,
    checkForInvitations,
    handleUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};