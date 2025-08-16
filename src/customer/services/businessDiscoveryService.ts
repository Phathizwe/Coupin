/**
 * Service for customer business discovery
 * Only shows businesses that have invited the customer
 */
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { findCustomerByUserId } from '../../services/customerLinkingService';
import { getCustomerBusinessRelationships } from '../../services/invitationRelationshipService';

/**
 * Business interface
 */
export interface Business {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  relationshipType?: string;
  hasLoyaltyProgram?: boolean;
  hasCoupons?: boolean;
}

/**
 * Get all businesses that have invited the customer
 * 
 * @param userId The user ID
 * @returns Array of businesses the customer has been invited to
 */
export const getInvitedBusinesses = async (userId: string): Promise<Business[]> => {
  if (!userId) {
    console.log('❌ No user ID provided for business lookup');
    return [];
  }
  
  try {
    console.log('🔍 Finding customer record for user:', userId);
    
    // Step 1: Find customer record for this user
    const customer = await findCustomerByUserId(userId);
    
    if (!customer) {
      console.log('❌ No customer record found for user:', userId);
      return [];
    }
    
    console.log('✅ Found customer record:', customer.id);
    
    // Step 2: Get all business relationships for this customer
    const relationships = await getCustomerBusinessRelationships(customer.id);
    
    if (relationships.length === 0) {
      console.log('ℹ️ No business relationships found for customer:', customer.id);
      return [];
    }
    
    console.log(`🏢 Found ${relationships.length} business relationships`);
    
    // Step 3: Get business details for each relationship
    const businesses: Business[] = [];
    
    for (const relationship of relationships) {
      try {
        const businessDoc = await getDoc(doc(db, 'businesses', relationship.businessId));
        
        if (businessDoc.exists()) {
          const businessData = businessDoc.data();
          
          // Check if business has loyalty programs
          const loyaltyProgramsRef = collection(db, 'loyaltyPrograms');
          const loyaltyQuery = query(
            loyaltyProgramsRef,
            where('businessId', '==', relationship.businessId),
            where('active', '==', true)
          );
          const loyaltySnapshot = await getDocs(loyaltyQuery);
          const hasLoyaltyProgram = !loyaltySnapshot.empty;
          
          // Check if business has coupons
          const couponsRef = collection(db, 'coupons');
          const couponsQuery = query(
            couponsRef,
            where('businessId', '==', relationship.businessId),
            where('active', '==', true)
          );
          const couponsSnapshot = await getDocs(couponsQuery);
          const hasCoupons = !couponsSnapshot.empty;
          
          businesses.push({
            id: businessDoc.id,
            name: businessData.name || relationship.businessName,
            description: businessData.description,
            logo: businessData.logo,
            address: businessData.address,
            phone: businessData.phone,
            email: businessData.email,
            website: businessData.website,
            relationshipType: relationship.relationshipType,
            hasLoyaltyProgram,
            hasCoupons
          });
        } else {
          // If business document doesn't exist, still add the relationship info
          businesses.push({
            id: relationship.businessId,
            name: relationship.businessName,
            relationshipType: relationship.relationshipType,
            hasLoyaltyProgram: false,
            hasCoupons: false
          });
        }
      } catch (error) {
        console.error(`❌ Error getting details for business ${relationship.businessId}:`, error);
        // Continue with next business
      }
    }
    
    console.log(`✅ Found ${businesses.length} businesses for customer`);
    return businesses;
  } catch (error) {
    console.error('❌ Error getting invited businesses:', error);
    return [];
  }
};

/**
 * Check if a customer has a relationship with a specific business
 * 
 * @param userId The user ID
 * @param businessId The business ID
 * @returns True if the customer has a relationship with the business
 */
export const hasBusinessRelationship = async (
  userId: string,
  businessId: string
): Promise<boolean> => {
  if (!userId || !businessId) {
    return false;
  }
  
  try {
    // Find customer record
    const customer = await findCustomerByUserId(userId);
    
    if (!customer) {
      console.log('❌ No customer record found for user:', userId);
      return false;
    }
    
    // Check if customer has a relationship with this business
    const relationshipsRef = collection(db, 'businessRelationships');
    const q = query(
      relationshipsRef,
      where('customerId', '==', customer.id),
      where('businessId', '==', businessId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error checking business relationship:', error);
    return false;
  }
};