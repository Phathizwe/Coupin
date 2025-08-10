import { useCallback } from 'react';
import { loadUserData } from '../userDataService';
import { fetchBusinessProfiles } from '../businessServices';
import { ExtendedUser } from '../types';
import { BusinessProfile } from '../../../types';

/**
 * Custom hook to safely handle user data with improved error handling
 * This ensures the loading state always resolves, even in edge cases
 */
export const useSafeUserData = (
  setUser: (user: ExtendedUser | null) => void,
  setBusinessProfile: (profile: BusinessProfile | null) => void,
  setUserBusinesses: (businesses: BusinessProfile[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const handleUserData = useCallback(async (firebaseUser: any) => {
    // Start a safety timer to ensure loading state resolves
    const safetyTimer = setTimeout(() => {
      console.error('[SafetyTimer] handleUserData took too long, forcing loading state to resolve');
      setIsLoading(false);
    }, 5000); // 5 second safety timeout
    
    try {
      // Input validation - ensure we have a valid user
      if (!firebaseUser || !firebaseUser.uid) {
        console.error('[SafeUserData] Invalid firebase user:', firebaseUser);
        setIsLoading(false);
        clearTimeout(safetyTimer);
        return null;
      }

      console.log('[SafeUserData] Processing user:', firebaseUser.uid);
      
      // Try to load user data with error handling
      let userData;
      try {
        userData = await loadUserData(firebaseUser);
      } catch (loadError) {
        console.error('[SafeUserData] Error loading user data:', loadError);
        // Create minimal user data to prevent blocking
        userData = {
          extendedUser: {
            ...firebaseUser,
            role: 'customer', // Default role as fallback
          },
          businessIds: [],
          currentBusinessId: undefined
        };
      }
      
      const { extendedUser, businessIds, currentBusinessId } = userData;
      
      // Update user state
      setUser(extendedUser);
      
      // Try to load business data if available
      if (businessIds && businessIds.length > 0) {
        try {
          // Convert null to undefined to satisfy TypeScript
          const businessIdParam = currentBusinessId === null ? undefined : currentBusinessId;
          
          const { businessProfiles, currentProfile } = await fetchBusinessProfiles(
            businessIds,
            businessIdParam
          );
          
          setUserBusinesses(businessProfiles);
          if (currentProfile) {
            setBusinessProfile(currentProfile);
          }
        } catch (businessError) {
          console.error('[SafeUserData] Error fetching business profiles:', businessError);
          // Don't block the app if business data fails
          setUserBusinesses([]);
          setBusinessProfile(null);
        }
      }
      
      return extendedUser;
    } catch (error) {
      console.error('[SafeUserData] Unhandled error in handleUserData:', error);
      return null;
    } finally {
      // Always ensure loading state resolves and safety timer is cleared
      setIsLoading(false);
      clearTimeout(safetyTimer);
    }
  }, []); // Remove setter dependencies as React state setters are stable

  return handleUserData;
};