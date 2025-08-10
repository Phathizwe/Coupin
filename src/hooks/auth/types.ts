// Define a type for the user data from Firestore
export interface UserData {
  uid: string;
  role?: 'business' | 'customer';
  email?: string;
  displayName?: string;
  [key: string]: any; // Allow for additional properties
}

// Interface for login form values
export interface LoginFormValues {
  email: string;
  password: string;
}

// Type for the auth success handler function
export type AuthSuccessHandler = (userId: string) => Promise<void>;