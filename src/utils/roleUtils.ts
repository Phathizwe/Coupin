import { BusinessProfile } from '../types';
import { DocumentData } from 'firebase/firestore';
import { getDeviceAppropriateBusinessDashboard } from './deviceDetection';

// Define a minimal user type that includes only the properties we need for role determination
interface UserWithRole {
  uid: string;
  email?: string | null;  // Updated to accept null values
  role?: 'business' | 'customer' | 'staff' | 'admin';
  businessId?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Determines the user's role based on user data and business profile
 * @param user The user object
 * @param businessProfile The business profile object (if available)
 * @returns The determined role ('business' or 'customer')
 */
export const determineUserRole = (
  user: UserWithRole | null | undefined,
  businessProfile: BusinessProfile | DocumentData | null | undefined
): 'business' | 'customer' | 'staff' | 'admin' => {
  if (!user) {
    console.log('[DEBUG][Role] No user provided, defaulting to customer');
    return 'customer';
  }

  console.log('[DEBUG][Role] Starting role determination for user:', {
    uid: user.uid,
    email: user.email,
    explicitRole: user.role,
    businessId: user.businessId,
    hasBusinesses: user.businesses ? `Yes (${user.businesses.length} businesses)` : 'No',
    currentBusinessId: user.currentBusinessId || 'None'
  });

  console.log('[DEBUG][Role] User object keys:', Object.keys(user));
  console.log('[DEBUG][Role] Business profile:', businessProfile ? {
    businessId: businessProfile.businessId,
    businessName: businessProfile.businessName,
    // Only log other properties if they exist
    ...(businessProfile.industry && { industry: businessProfile.industry }),
    ...(businessProfile.subscriptionTier && { subscriptionTier: businessProfile.subscriptionTier })
  } : 'None');

  // First check explicit role - this is the most reliable indicator
  if (user.role) {
    console.log(`[DEBUG][Role] Using explicit role from user data: ${user.role}`);
    return user.role;
  }

  // Then check businessId - but only if it's a valid string
  if (user.businessId && typeof user.businessId === 'string' && user.businessId.trim() !== '') {
    console.log('[DEBUG][Role] Using businessId to determine role as business:', user.businessId);
    return 'business';
  }

  // Check businesses array - but only if it has valid entries
  if (user.businesses && Array.isArray(user.businesses) && user.businesses.length > 0) {
    // Check if the businesses array contains valid business IDs
    const validBusinesses = user.businesses.filter(id => id && typeof id === 'string' && id.trim() !== '');
    if (validBusinesses.length > 0) {
      console.log('[DEBUG][Role] User has valid businesses array with entries:', validBusinesses);
      return 'business';
    }
  }

  // Finally check business profile - but only if it has valid data
  if (businessProfile && businessProfile.businessId && typeof businessProfile.businessId === 'string') {
    console.log('[DEBUG][Role] Using business profile to determine role as business:',
      businessProfile.businessId);
    return 'business';
  }

  // Check email domain as a heuristic (optional) - but don't use it to determine business role
  if (user.email) {
    const emailDomain = user.email.split('@')[1]?.toLowerCase();
    console.log('[DEBUG][Role] Checking email domain:', emailDomain);

    // List of common consumer email domains
    const consumerDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'];

    if (emailDomain && !consumerDomains.includes(emailDomain)) {
      console.log('[DEBUG][Role] Email domain appears to be a business domain, but no other business indicators found - still defaulting to customer');
    }
  }

  console.log('[DEBUG][Role] No valid business indicators found, defaulting to customer role');
  return 'customer';
};

/**
 * Gets the default route for a user based on their role
 * @param role The user's role
 * @returns The default route for the user
 */
export const getDefaultRouteForRole = (role: 'business' | 'customer' | 'staff' | 'admin'): string => {
  console.log(`[DEBUG][Role] Getting default route for role: ${role}`);

  switch (role) {
    case 'business':
      console.log('[DEBUG][Role] Routing to device-appropriate business dashboard');
      // Use device detection to determine appropriate dashboard
      return getDeviceAppropriateBusinessDashboard();
    case 'customer':
      console.log('[DEBUG][Role] Routing to consumer dashboard');
      return '/consumer/dashboard';
    case 'staff':
      console.log('[DEBUG][Role] Routing to staff dashboard');
      return '/staff/dashboard';
    case 'admin':
      console.log('[DEBUG][Role] Routing to admin dashboard');
      return '/admin/dashboard';
    default:
      console.log('[DEBUG][Role] Unknown role, defaulting to customer dashboard');
      return '/consumer/dashboard';
  }
};