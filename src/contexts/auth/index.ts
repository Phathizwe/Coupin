/**
 * Authentication services index
 * Exports all auth-related functions from modular services
 */

// Export all functions from the auth services
export {
  loginWithEmail,
  registerUser,
  logoutUser,
  resetUserPassword,
  socialSignIn,
  switchBusiness,
  fetchUserBusinesses,
  checkForInvitations,
  checkRedirectResult,
  handleUserData,
  debugUserData
} from './authServices';

// Export types using 'export type' for TypeScript isolated modules
export type { ExtendedUser } from './types';

// Export phone registration utilities for direct access
export {
  processPhoneNumber,
  findCustomerByPhone,
  handleCustomerRecord
} from './services/phoneRegistrationService';
