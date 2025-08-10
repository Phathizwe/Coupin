import { User as FirebaseUser } from 'firebase/auth';

// Extend the Firebase User type with your custom properties
export interface ExtendedUser extends FirebaseUser {
  businessId?: string;
  role?: string;
  currentBusinessId?: string;
  businesses?: string[];
  // Add any other custom properties your app uses
}

// Update the AuthContextType to use the extended user type
export interface AuthContextType {
  user: ExtendedUser | null;
  businessProfile?: any; // Replace 'any' with a proper type if available
  loading?: boolean;
  isLoading?: boolean;
}