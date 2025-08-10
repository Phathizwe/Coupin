import { useCallback } from 'react';
import { ExtendedUser } from '../types';
import { BusinessProfile } from '../../../types';
import { 
  fetchBusinessProfiles,
  switchBusiness as switchBusinessProfile
} from '../businessServices';
import { checkForInvitations } from '../authServices';
import React from 'react';

/**
 * Custom hook for business-related methods
 * Extracts business logic from the main context
 */
export const useBusinessMethods = (
  user: ExtendedUser | null,
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>,
  setBusinessProfile: (profile: BusinessProfile | null) => void,
  setUserBusinesses: (businesses: BusinessProfile[]) => void
) => {
  const switchBusiness = useCallback(async (businessId: string) => {
    if (!user) return;
    
    try {
      console.log('[BusinessMethods] Switching to business:', businessId);
      const newBusinessProfile = await switchBusinessProfile(user.uid, businessId);
      
      if (newBusinessProfile) {
        setBusinessProfile(newBusinessProfile);
        
        // Update user object with new current business
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
      console.error('[BusinessMethods] Switch business error:', error);
      throw error;
    }
  }, []); // Remove user and setter dependencies as they cause infinite loops

  const fetchUserBusinesses = useCallback(async () => {
    if (!user) return;

    try {
      console.log('[BusinessMethods] Fetching user businesses');
      const { businessProfiles, currentProfile } = await fetchBusinessProfiles(
        user.businesses || [],
        user.businessId
      );

      setUserBusinesses(businessProfiles);
      if (currentProfile) {
        setBusinessProfile(currentProfile);
      }
    } catch (error) {
      console.error('[BusinessMethods] Fetch user businesses error:', error);
    }
  }, []); // Remove user and setter dependencies as they cause infinite loops

  const checkForUserInvitations = useCallback(async (): Promise<boolean> => {
    if (!user?.email) return false;
    console.log('[BusinessMethods] Checking for invitations for:', user.email);
    return checkForInvitations(user.email);
  }, []); // Remove user dependency as it causes infinite loops

  return {
    switchBusiness,
    fetchUserBusinesses,
    checkForInvitations: checkForUserInvitations
  };
};