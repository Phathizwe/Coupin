/**
 * Service for managing business invitations and customer relationships
 * Handles invitation-based visibility and customer-business linking
 */
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber } from '../utils/phoneUtils';

/**
 * Invitation record interface
 */
export interface InvitationRecord {
  id: string;
  businessId: string;
  businessName?: string;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
  acceptedAt?: any;
}

/**
 * Business relationship interface
 */
export interface BusinessRelationship {
  id: string;
  businessId: string;
  businessName: string;
  customerId: string;
  relationshipType: 'invited' | 'loyalty' | 'coupon';
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

/**
 * Find pending invitations for a customer by phone number
 * 
 * @param phone The customer's phone number
 * @returns Array of pending invitations
 */
export const findInvitationsByPhone = async (phone: string): Promise<InvitationRecord[]> => {
  if (!phone) {
    console.log('❌ No phone number provided for invitation lookup');
    return [];
  }
  
  console.log('🔍 Looking for invitations with phone:', phone);
  
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef,
      where('customerPhone', '==', normalizedPhone),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No pending invitations found for phone:', normalizedPhone);
      return [];
    }
    
    const invitations: InvitationRecord[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      invitations.push({
        id: doc.id,
        businessId: data.businessId,
        businessName: data.businessName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        status: data.status,
        createdAt: data.createdAt,
        acceptedAt: data.acceptedAt
      });
    }
    
    console.log(`✅ Found ${invitations.length} pending invitations for phone:`, normalizedPhone);
    return invitations;
  } catch (error) {
    console.error('❌ Error finding invitations by phone:', error);
    return [];
  }
};

/**
 * Accept all pending invitations for a customer
 * 
 * @param customerId The customer ID
 * @param phone The customer's phone number
 * @returns Array of accepted invitation IDs
 */
export const acceptPendingInvitations = async (
  customerId: string,
  phone: string
): Promise<string[]> => {
  try {
    const invitations = await findInvitationsByPhone(phone);
    
    if (invitations.length === 0) {
      return [];
    }
    
    console.log(`🔄 Accepting ${invitations.length} pending invitations for customer:`, customerId);
    
    const acceptedIds: string[] = [];
    
    for (const invitation of invitations) {
      // Update invitation status
      const invitationRef = doc(db, 'invitations', invitation.id);
      await setDoc(invitationRef, {
        status: 'accepted',
        acceptedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      // Create business relationship
      const relationshipsRef = collection(db, 'businessRelationships');
      const newRelationshipRef = doc(relationshipsRef);
      
      await setDoc(newRelationshipRef, {
        id: newRelationshipRef.id,
        businessId: invitation.businessId,
        businessName: invitation.businessName || '',
        customerId: customerId,
        relationshipType: 'invited',
        status: 'active',
        invitationId: invitation.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Created business relationship:', newRelationshipRef.id);
      acceptedIds.push(invitation.id);
    }
    
    return acceptedIds;
  } catch (error) {
    console.error('❌ Error accepting pending invitations:', error);
    return [];
  }
};

/**
 * Get all businesses related to a customer
 * 
 * @param customerId The customer ID
 * @returns Array of business relationships
 */
export const getCustomerBusinessRelationships = async (
  customerId: string
): Promise<BusinessRelationship[]> => {
  if (!customerId) {
    console.log('❌ No customer ID provided for relationship lookup');
    return [];
  }
  
  try {
    const relationshipsRef = collection(db, 'businessRelationships');
    const q = query(
      relationshipsRef,
      where('customerId', '==', customerId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No business relationships found for customer:', customerId);
      return [];
    }
    
    const relationships: BusinessRelationship[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      relationships.push({
        id: doc.id,
        businessId: data.businessId,
        businessName: data.businessName,
        customerId: data.customerId,
        relationshipType: data.relationshipType,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    }
    
    console.log(`✅ Found ${relationships.length} business relationships for customer:`, customerId);
    return relationships;
  } catch (error) {
    console.error('❌ Error getting customer business relationships:', error);
    return [];
  }
};

/**
 * Check if a customer has a relationship with a business
 * 
 * @param customerId The customer ID
 * @param businessId The business ID
 * @returns True if a relationship exists
 */
export const hasBusinessRelationship = async (
  customerId: string,
  businessId: string
): Promise<boolean> => {
  if (!customerId || !businessId) {
    return false;
  }
  
  try {
    const relationshipsRef = collection(db, 'businessRelationships');
    const q = query(
      relationshipsRef,
      where('customerId', '==', customerId),
      where('businessId', '==', businessId),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error checking business relationship:', error);
    return false;
  }
};

/**
 * Create a business invitation for a customer
 * 
 * @param businessId The business ID
 * @param businessName The business name
 * @param customerPhone The customer's phone number
 * @param customerName Optional customer name
 * @param customerEmail Optional customer email
 * @returns The created invitation ID
 */
export const createBusinessInvitation = async (
  businessId: string,
  businessName: string,
  customerPhone: string,
  customerName?: string,
  customerEmail?: string
): Promise<string> => {
  try {
    const normalizedPhone = normalizePhoneNumber(customerPhone);
    
    // Check if an invitation already exists
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef,
      where('businessId', '==', businessId),
      where('customerPhone', '==', normalizedPhone),
      where('status', '==', 'pending'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingId = querySnapshot.docs[0].id;
      console.log('ℹ️ Invitation already exists:', existingId);
      return existingId;
    }
    
    // Create new invitation
    const newInvitationRef = doc(invitationsRef);
    
    await setDoc(newInvitationRef, {
      id: newInvitationRef.id,
      businessId,
      businessName,
      customerPhone: normalizedPhone,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Created business invitation:', newInvitationRef.id);
    return newInvitationRef.id;
  } catch (error) {
    console.error('❌ Error creating business invitation:', error);
    throw error;
  }
};