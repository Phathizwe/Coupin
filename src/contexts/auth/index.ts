import { AuthContext, AuthProvider } from './SafeAuthContext';

// Export enhanced auth services
export {
  registerUser,
  loginWithEmail,
  logoutUser,
  resetUserPassword,
  socialSignIn,
  switchBusiness,
  fetchUserBusinesses,
  checkForInvitations,
  checkRedirectResult,
  handleUserData
} from './enhancedAuthServices';

// Export types
export type { ExtendedUser } from './types';

export { AuthContext, AuthProvider };
export default AuthContext;