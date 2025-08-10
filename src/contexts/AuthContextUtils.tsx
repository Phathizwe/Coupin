import { User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BusinessProfile } from '../types';
import { ExtendedUser } from './AuthContext';
import React from 'react';

export const AuthContextUtils = (
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>,
  setBusinessProfile: React.Dispatch<React.SetStateAction<BusinessProfile | null>>,
  setUserBusinesses: React.Dispatch<React.SetStateAction<BusinessProfile[]>>,
  user: ExtendedUser | null
) => {
  // Load user data including all associated businesses
  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // Get user document by UID
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Get list of businesses this user belongs to
        const businesses = userData.businesses || [];
        let currentBusinessId = userData.currentBusinessId;
        
        // If no current business is set but user has businesses, use the first one
        if (!currentBusinessId && businesses.length > 0) {
          currentBusinessId = businesses[0];
          // Update user's current business in Firestore
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            currentBusinessId,
            updatedAt: serverTimestamp()
          });
        }
        
        // Create extended user with business info
        const extendedUser = {
          ...firebaseUser,
          businessId: currentBusinessId,
          businesses: businesses,
          role: userData.role
        } as ExtendedUser;
        
        setUser(extendedUser);
        
        // Load all businesses this user belongs to
        await fetchBusinessProfiles(businesses, currentBusinessId);
      } else {
        console.log('No user document found, using basic Firebase user');
        setUser(firebaseUser as ExtendedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(firebaseUser as ExtendedUser);
    }
  };

  // Fetch profiles for all businesses user belongs to
  const fetchBusinessProfiles = async (businessIds: string[], currentBusinessId?: string) => {
    try {
      const businessProfiles: BusinessProfile[] = [];
      
      for (const businessId of businessIds) {
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        if (businessDoc.exists()) {
          const businessData = businessDoc.data() as BusinessProfile;
          businessProfiles.push({
            ...businessData,
            businessId: businessDoc.id
          });
          
          // Set the current business profile
          if (businessId === currentBusinessId) {
            setBusinessProfile({
              ...businessData,
              businessId: businessDoc.id
            });
          }
        }
      }
      
      setUserBusinesses(businessProfiles);
    } catch (error) {
      console.error('Error fetching business profiles:', error);
    }
  };

  // Function to switch between businesses
  const switchBusiness = async (businessId: string) => {
    if (!user) return;
    
    try {
      // Update the current business ID in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        currentBusinessId: businessId,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));
      if (businessDoc.exists()) {
        const businessData = businessDoc.data() as BusinessProfile;
        
        setBusinessProfile({
          ...businessData,
          businessId: businessDoc.id
        });
        
        // Update user object with new current business
        setUser((prev: ExtendedUser | null) => {
          if (!prev) return null;
          return {
            ...prev,
            businessId: businessId
          };
        });
      }
    } catch (error) {
      console.error('Error switching business:', error);
      throw error;
    }
  };

  // Function to fetch all businesses for the current user
  const fetchUserBusinesses = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const businesses = userData.businesses || [];
        
        await fetchBusinessProfiles(businesses, user.businessId);
      }
    } catch (error) {
      console.error('Error fetching user businesses:', error);
    }
  };

  // Check for pending invitations
  const checkForInvitations = async (): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef, 
        where('email', '==', user.email),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking for invitations:', error);
      return false;
    }
  };

  return {
    loadUserData,
    fetchBusinessProfiles,
    switchBusiness,
    fetchUserBusinesses,
    checkForInvitations
  };
};