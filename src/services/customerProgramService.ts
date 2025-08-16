/**
 * Service for managing customer access to loyalty programs
 * Based on business relationships and invitations
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
  orderBy,
  limit as firestoreLimit,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { findCustomerByUserId } from './customerLinkingService';
import { getCustomerBusinessRelationships } from './invitationRelationshipService';

/**
 * Loyalty program interface
 */
export interface LoyaltyProgram {
  id: string;
  businessId: string;
  businessName?: string;
  name: string;
  description: string;
  type: 'points' | 'visits' | 'tiered';
  pointsPerAmount?: number;
  amountPerPoint?: number;
  visitsRequired?: number;
  tiers?: LoyaltyTier[];
  rewards: LoyaltyReward[];
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

/**
 * Loyalty tier interface
 */
export interface LoyaltyTier {
  id: string;
  name: string;
  threshold: number;
  multiplier: number;
  benefits: string[];
}

/**
 * Loyalty reward interface
 */
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost?: number;
  visitsCost?: number;
  tierRequired?: string;
  type: 'discount' | 'freeItem' | 'custom';
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  freeItem?: string;
  customDescription?: string;
  active: boolean;
}

/**
 * Program enrollment interface
 */
export interface ProgramEnrollment {
  id: string;
  programId: string;
  customerId: string;
  businessId: string;
  points: number;
  visits: number;
  currentTier?: string;
  enrollmentDate: any;
  lastVisitDate?: any;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

/**
 * Program visit interface
 */
export interface ProgramVisit {
  id: string;
  programId: string;
  enrollmentId: string;
  customerId: string;
  businessId: string;
  visitDate: any;
  pointsEarned?: number;
  amountSpent?: number;
  notes?: string;
  createdAt: any;
}

/**
 * Get all loyalty programs for a customer based on their business relationships
 * 
 * @param userId The user ID
 * @returns Array of loyalty programs the customer has access to
 */
export const getCustomerPrograms = async (userId: string): Promise<LoyaltyProgram[]> => {
  if (!userId) {
    console.log('❌ No user ID provided for program lookup');
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
    
    // Step 3: Get all loyalty programs for these businesses
    const businessIds = relationships.map(rel => rel.businessId);
    const programs: LoyaltyProgram[] = [];
    
    // Query loyalty programs for all related businesses
    const programsRef = collection(db, 'loyaltyPrograms');
    const q = query(
      programsRef,
      where('businessId', 'in', businessIds),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Find the business name from relationships
      const relationship = relationships.find(rel => rel.businessId === data.businessId);
      const businessName = relationship ? relationship.businessName : '';
      
      programs.push({
        id: doc.id,
        businessId: data.businessId,
        businessName,
        name: data.name,
        description: data.description,
        type: data.type,
        pointsPerAmount: data.pointsPerAmount,
        amountPerPoint: data.amountPerPoint,
        visitsRequired: data.visitsRequired,
        tiers: data.tiers || [],
        rewards: data.rewards || [],
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    }
    
    console.log(`✅ Found ${programs.length} loyalty programs for customer`);
    return programs;
  } catch (error) {
    console.error('❌ Error getting customer programs:', error);
    return [];
  }
};

/**
 * Check if a customer has access to a specific program
 * 
 * @param userId The user ID
 * @param programId The program ID
 * @returns True if the customer has access to the program
 */
export const hasAccessToProgram = async (
  userId: string,
  programId: string
): Promise<boolean> => {
  if (!userId || !programId) {
    return false;
  }
  
  try {
    // Get the program details
    const programDoc = await getDoc(doc(db, 'loyaltyPrograms', programId));
    
    if (!programDoc.exists()) {
      console.log('❌ Program does not exist:', programId);
      return false;
    }
    
    const programData = programDoc.data();
    const businessId = programData.businessId;
    
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
    console.error('❌ Error checking program access:', error);
    return false;
  }
};

/**
 * Get a customer's enrollment in a specific program
 * 
 * @param customerId The customer ID
 * @param programId The program ID
 * @returns The program enrollment if found, null otherwise
 */
export const getCustomerProgramEnrollment = async (
  customerId: string,
  programId: string
): Promise<ProgramEnrollment | null> => {
  if (!customerId || !programId) {
    console.log('❌ Missing customerId or programId for enrollment lookup');
    return null;
  }
  
  try {
    console.log(`🔍 Looking for enrollment: customer=${customerId}, program=${programId}`);
    
    const enrollmentsRef = collection(db, 'programEnrollments');
    const q = query(
      enrollmentsRef,
      where('customerId', '==', customerId),
      where('programId', '==', programId),
      where('status', '==', 'active'),
      firestoreLimit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No active enrollment found');
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const enrollment: ProgramEnrollment = {
      id: doc.id,
      programId: data.programId,
      customerId: data.customerId,
      businessId: data.businessId,
      points: data.points || 0,
      visits: data.visits || 0,
      currentTier: data.currentTier,
      enrollmentDate: data.enrollmentDate,
      lastVisitDate: data.lastVisitDate,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
    
    console.log('✅ Found enrollment:', enrollment);
    return enrollment;
  } catch (error) {
    console.error('❌ Error getting program enrollment:', error);
    return null;
  }
};

/**
 * Record a visit to a loyalty program
 * 
 * @param enrollmentId The enrollment ID
 * @param amountSpent Optional amount spent during the visit
 * @param notes Optional notes about the visit
 * @returns The created visit record ID
 */
export const recordProgramVisit = async (
  enrollmentId: string,
  amountSpent?: number,
  notes?: string
): Promise<string> => {
  if (!enrollmentId) {
    throw new Error('Enrollment ID is required to record a visit');
  }
  
  try {
    console.log(`🔄 Recording visit for enrollment: ${enrollmentId}`);
    
    // Get enrollment details
    const enrollmentDoc = await getDoc(doc(db, 'programEnrollments', enrollmentId));
    
    if (!enrollmentDoc.exists()) {
      throw new Error(`Enrollment ${enrollmentId} does not exist`);
    }
    
    const enrollmentData = enrollmentDoc.data();
    const { programId, customerId, businessId } = enrollmentData;
    
    // Get program details to calculate points
    const programDoc = await getDoc(doc(db, 'loyaltyPrograms', programId));
    
    if (!programDoc.exists()) {
      throw new Error(`Program ${programId} does not exist`);
    }
    
    const programData = programDoc.data();
    let pointsEarned = 0;
    
    // Calculate points based on program type and amount spent
    if (programData.type === 'points' && amountSpent && programData.pointsPerAmount) {
      pointsEarned = Math.floor(amountSpent / programData.pointsPerAmount);
    }
    
    // Create visit record
    const visitsRef = collection(db, 'programVisits');
    const visitData = {
      programId,
      enrollmentId,
      customerId,
      businessId,
      visitDate: Timestamp.now(),
      pointsEarned,
      amountSpent: amountSpent || null,
      notes: notes || null,
      createdAt: Timestamp.now()
    };
    
    const visitDoc = await addDoc(visitsRef, visitData);
    console.log('✅ Created visit record:', visitDoc.id);
    
    // Update enrollment with new points, visits, and last visit date
    const updatedPoints = (enrollmentData.points || 0) + pointsEarned;
    const updatedVisits = (enrollmentData.visits || 0) + 1;
    
    await setDoc(doc(db, 'programEnrollments', enrollmentId), {
      points: updatedPoints,
      visits: updatedVisits,
      lastVisitDate: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log(`✅ Updated enrollment: points=${updatedPoints}, visits=${updatedVisits}`);
    
    return visitDoc.id;
  } catch (error) {
    console.error('❌ Error recording program visit:', error);
    throw error;
  }
};

/**
 * Get a customer's visit history for a program
 * 
 * @param enrollmentId The enrollment ID
 * @param maxResults Optional limit on the number of visits to retrieve
 * @returns Array of visit records
 */
export const getProgramVisitHistory = async (
  enrollmentId: string,
  maxResults?: number
): Promise<ProgramVisit[]> => {
  if (!enrollmentId) {
    console.log('❌ No enrollment ID provided for visit history lookup');
    return [];
  }
  
  try {
    const visitsRef = collection(db, 'programVisits');
    const q = query(
      visitsRef,
      where('enrollmentId', '==', enrollmentId),
      orderBy('visitDate', 'desc'),
      ...(maxResults ? [firestoreLimit(maxResults)] : [])
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No visit history found for enrollment:', enrollmentId);
      return [];
    }
    
    const visits: ProgramVisit[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      visits.push({
        id: doc.id,
        programId: data.programId,
        enrollmentId: data.enrollmentId,
        customerId: data.customerId,
        businessId: data.businessId,
        visitDate: data.visitDate,
        pointsEarned: data.pointsEarned,
        amountSpent: data.amountSpent,
        notes: data.notes,
        createdAt: data.createdAt
      });
    }
    
    console.log(`✅ Found ${visits.length} visits for enrollment:`, enrollmentId);
    return visits;
  } catch (error) {
    console.error('❌ Error getting program visit history:', error);
    return [];
  }
};