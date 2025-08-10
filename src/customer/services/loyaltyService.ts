import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyProgram, LoyaltyReward, LoyaltyTier } from '../../types';

/**
 * Fetch loyalty programs for a specific customer
 * @param userId The user ID of the customer
 * @returns Array of loyalty programs with business details
 */
export const fetchCustomerLoyaltyPrograms = async (userId: string) => {
  try {
    // First, get the customer document to find linked businesses
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    // Get the customer document
    const customerDoc = querySnapshot.docs[0];
    const customerData = customerDoc.data();
    
    // Get all the businesses where the customer has loyalty points
    const businessIds: string[] = [];
    
    // If the customer has visited businesses, add them
    if (customerData.visits && Array.isArray(customerData.visits)) {
      customerData.visits.forEach((visit: any) => {
        if (visit.businessId && !businessIds.includes(visit.businessId)) {
          businessIds.push(visit.businessId);
        }
      });
    }
    
    // If the customer has loyalty points directly, add those businesses
    if (customerData.loyaltyPoints && typeof customerData.loyaltyPoints === 'object') {
      Object.keys(customerData.loyaltyPoints).forEach(businessId => {
        if (!businessIds.includes(businessId)) {
          businessIds.push(businessId);
        }
      });
    }
    
    if (businessIds.length === 0) {
      return [];
    }
    
    // Fetch loyalty programs for these businesses
    const loyaltyProgramsRef = collection(db, 'loyaltyPrograms');
    const loyaltyProgramsQuery = query(loyaltyProgramsRef, where('businessId', 'in', businessIds));
    const loyaltyProgramsSnapshot = await getDocs(loyaltyProgramsQuery);
    
    // Prepare to fetch business details
    const programs: Array<LoyaltyProgram & { 
      businessName?: string;
      businessLogo?: string;
      businessColors?: {
        primary: string;
        secondary: string;
      };
      customerPoints?: number;
      customerVisits?: number;
      customerTier?: string;
    }> = [];
    
    // Process each program and add business details
    for (const programDoc of loyaltyProgramsSnapshot.docs) {
      const programData = programDoc.data() as LoyaltyProgram;
      
      // Fetch business details
      const businessRef = doc(db, 'businesses', programData.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (businessDoc.exists()) {
        const businessData = businessDoc.data();
        
        // Get customer's loyalty points for this business
        let customerPoints = 0;
        let customerVisits = 0;
        let customerTier = '';
        
        if (customerData.loyaltyPoints && customerData.loyaltyPoints[programData.businessId]) {
          customerPoints = customerData.loyaltyPoints[programData.businessId];
        }
        
        if (customerData.visits) {
          customerVisits = customerData.visits.filter(
            (visit: any) => visit.businessId === programData.businessId
          ).length;
        }
        
        // Determine customer tier if it's a tiered program
        if (programData.type === 'tiered' && programData.tiers && programData.tiers.length > 0) {
          // Sort tiers by threshold (ascending)
          const sortedTiers = [...programData.tiers].sort((a, b) => a.threshold - b.threshold);
          
          // Find the highest tier the customer qualifies for
          for (let i = sortedTiers.length - 1; i >= 0; i--) {
            if (customerPoints >= sortedTiers[i].threshold) {
              customerTier = sortedTiers[i].name;
              break;
            }
          }
          
          // If no tier found, set to the lowest tier
          if (!customerTier && sortedTiers.length > 0) {
            customerTier = sortedTiers[0].name;
          }
        }
        
        programs.push({
          ...programData,
          id: programDoc.id,
          businessName: businessData.businessName,
          businessLogo: businessData.logo,
          businessColors: businessData.colors,
          customerPoints,
          customerVisits,
          customerTier
        });
      }
    }
    
    return programs;
  } catch (error) {
    console.error('Error fetching customer loyalty programs:', error);
    throw error;
  }
};

/**
 * Fetch rewards for a specific loyalty program
 * @param programId The ID of the loyalty program
 * @returns Array of loyalty rewards
 */
export const fetchLoyaltyRewards = async (programId: string) => {
  try {
    const rewardsRef = collection(db, 'loyaltyRewards');
    const q = query(rewardsRef, where('programId', '==', programId));
    const querySnapshot = await getDocs(q);
    
    const rewards: LoyaltyReward[] = [];
    
    querySnapshot.forEach((doc) => {
      rewards.push({
        ...doc.data() as LoyaltyReward,
        id: doc.id
      });
    });
    
    return rewards;
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error);
    throw error;
  }
};

/**
 * Get customer's loyalty points for a specific business
 * @param userId The user ID of the customer
 * @param businessId The business ID
 * @returns The number of loyalty points
 */
export const getCustomerLoyaltyPoints = async (userId: string, businessId: string) => {
  try {
    // Get the customer document
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return 0;
    }
    
    const customerData = querySnapshot.docs[0].data();
    
    if (customerData.loyaltyPoints && customerData.loyaltyPoints[businessId]) {
      return customerData.loyaltyPoints[businessId];
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting customer loyalty points:', error);
    return 0;
  }
};