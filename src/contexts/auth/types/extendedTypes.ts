import { User as FirebaseUser } from 'firebase/auth';
import { BusinessProfile } from '../../../types';

// Extended User type that includes our custom properties
export interface ExtendedUser extends FirebaseUser {
  businessId?: string;
  businesses?: string[];  // Array of business IDs the user belongs to
  role?: 'business' | 'customer' | 'staff' | 'admin';
  currentBusinessId?: string; // Currently selected business
  businessProfile?: BusinessProfile; // Include business profile data
}

// Auth Context Type
export interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  businessProfile: BusinessProfile | null;
  userBusinesses: BusinessProfile[];
  login: (email: string, password: string) => Promise<ExtendedUser>;
  register: (email: string, password: string, name: string, role: 'business' | 'customer') => Promise<ExtendedUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<ExtendedUser>;
  facebookSignIn: () => Promise<ExtendedUser>;
  microsoftSignIn: () => Promise<ExtendedUser>;
  linkedInSignIn: () => Promise<ExtendedUser>;
  switchBusiness: (businessId: string) => Promise<void>;
  fetchUserBusinesses: () => Promise<void>;
  checkForInvitations: () => Promise<boolean>;
  handleUserData: (firebaseUser: any) => Promise<ExtendedUser | null>;
}

// Default context value with empty implementations
export const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  businessProfile: null,
  userBusinesses: [],
  login: async (email, password) => { return {} as ExtendedUser; },
  register: async (email, password, name, role) => { return {} as ExtendedUser; },
  logout: async () => { },
  resetPassword: async () => { },
  googleSignIn: async () => { return {} as ExtendedUser; },
  facebookSignIn: async () => { return {} as ExtendedUser; },
  microsoftSignIn: async () => { return {} as ExtendedUser; },
  linkedInSignIn: async () => { return {} as ExtendedUser; },
  switchBusiness: async () => { },
  fetchUserBusinesses: async () => { },
  checkForInvitations: async () => { return false; },
  handleUserData: async () => { return null; },
};