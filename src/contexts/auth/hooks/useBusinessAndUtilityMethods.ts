import { useCallback } from 'react';
import { logoutUser, resetUserPassword, checkForInvitations as checkInvitations } from '../authServices';
import { fetchBusinessProfiles, switchBusiness as switchBusinessProfile } from '../businessServices';
import { ExtendedUser } from '../types/extendedTypes';
import { BusinessProfile } from '../../../types';

/**
 * Custom hook for business and utility methods
 * Compatible with both the original and new architecture
 */
export const useBusinessAndUtilityMethods = (
  user: ExtendedUser | null,
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>,
  setBusinessProfile: React.Dispatch<React.SetStateAction<BusinessProfile | null>>,
  setUserBusinesses: React.Dispatch<React.SetStateAction<BusinessProfile[]>>
) => {
  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('[BusinessUtility] Logging out user');
      await logoutUser();
      setUser(null);
      setBusinessProfile(null);
      setUserBusinesses([]);
    } catch (error) {
      console.error('[BusinessUtility] Error in logout function:', error);
      throw error;
    }
  }, [setUser, setBusinessProfile, setUserBusinesses]);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      console.log('[BusinessUtility] Resetting password for:', email);
      await resetUserPassword(email);
    } catch (error) {
      console.error('[BusinessUtility] Error in resetPassword function:', error);
      throw error;
    }
  }, []);

  // Function to switch between businesses
  const switchBusiness = useCallback(async (businessId: string) => {
    if (!user) return;
    
    try {
      console.log('[BusinessUtility] Switching to business:', businessId);
      const newBusinessProfile = await switchBusinessProfile(user.uid, businessId);
      
      if (newBusinessProfile) {
        setBusinessProfile(newBusinessProfile);
        
        // Update user object with new current business
        // Add explicit type for prev parameter
        setUser((prev: ExtendedUser | null) => {
          if (!prev) return null;
          return {
            ...prev,
            businessId: businessId,
            currentBusinessId: businessId
          };
        });
      }
    } catch (error) {
      console.error('[BusinessUtility] Error in switchBusiness function:', error);
      throw error;
    }
  }, [user, setUser, setBusinessProfile]);

  // Function to fetch all businesses for the current user
  const fetchUserBusinesses = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('[BusinessUtility] Fetching businesses for user:', user.uid);
      const { businessProfiles, currentProfile } = await fetchBusinessProfiles(
        user.businesses || [],
        user.businessId
      );
      
      setUserBusinesses(businessProfiles);
      if (currentProfile) {
        setBusinessProfile(currentProfile);
      }
    } catch (error) {
      console.error('[BusinessUtility] Error in fetchUserBusinesses function:', error);
    }
  }, [user, setBusinessProfile, setUserBusinesses]);

  // Check for pending invitations
  const checkForInvitations = useCallback(async (): Promise<boolean> => {
    if (!user?.email) return false;
    console.log('[BusinessUtility] Checking for invitations for:', user.email);
    return checkInvitations(user.email);
  }, [user]);

  return {
    logout,
    resetPassword,
    switchBusiness,
    fetchUserBusinesses,
    checkForInvitations
  };
};