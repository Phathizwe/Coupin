/**
 * Authentication services index
 * Exports all auth-related functions from modular services
 */

// Export all functions from the fixed auth services
export {
  loginWithEmail,
  registerUser,
  logoutUser,
  resetUserPassword,
  socialSignIn,
  switchBusiness,
  checkForInvitations,
  checkRedirectResult,
  handleUserData,
  debugUserData
} from './authServices.fixed';

// Export types using 'export type' for TypeScript isolated modules
export type { ExtendedUser } from './types';

// Export phone registration utilities for direct access
export {
  processPhoneNumber,
  findCustomerByPhone,
  handleCustomerRecord
} from './services/phoneRegistrationService';