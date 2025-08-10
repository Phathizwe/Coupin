import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyProgram } from '../../types';

// Helper function to get the correct businessId
const getCorrectBusinessId = (businessId: string): string => {
  // Handle the hardcoded "business_id" case - this should never be used
  if (businessId === 'business_id') {
    console.error('🚨 CRITICAL: Attempted to save program with hardcoded "business_id"!');
    throw new Error('Invalid businessId: Cannot save program with hardcoded "business_id"');
  }

  // Handle the known businessId mismatch
  if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
    return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
  }

  // Add your specific business ID mapping if needed
  if (businessId === 'FDO1T2TrcWcglFBm4w68') {
    console.log('✅ Using the correct business ID for FDO1T2TrcWcglFBm4w68');
  return businessId;
  }

  return businessId;
};

// Get loyalty program for a business
export const getLoyaltyProgram = async (businessId: string) => {
  try {
    if (!businessId) {
      console.error('🚨 NULL or UNDEFINED businessId provided to getLoyaltyProgram!');
      throw new Error('Invalid businessId: Cannot get program with null or undefined businessId');
    }

    const correctedBusinessId = getCorrectBusinessId(businessId);
    console.log('Fetching loyalty program for business:', businessId);
    console.log('Corrected businessId:', correctedBusinessId);

    const loyaltyQuery = query(
      collection(db, 'loyaltyPrograms'),
      where('businessId', '==', correctedBusinessId)
    );

    const snapshot = await getDocs(loyaltyQuery);
    console.log('Loyalty program query result:', snapshot.empty ? 'No programs found' : `Found ${snapshot.docs.length} programs`);

    if (snapshot.empty) {
      return null; // No loyalty program found
    }

    // Assuming a business has only one loyalty program
    const doc = snapshot.docs[0];
    const data = doc.data();

    // Properly handle the timestamp conversion
    const program = {
      ...data,
      id: doc.id,
      // Safely convert timestamps or keep as is if they're not Timestamp objects
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      // Ensure rewards array exists
      rewards: data.rewards || []
    } as LoyaltyProgram;

    console.log('Returning loyalty program:', program);
    return program;
  } catch (error) {
    console.error('Error getting loyalty program:', error);
    throw error;
  }
};

// Save loyalty program (create or update) - FIXED VERSION
export const saveLoyaltyProgram = async (program: Partial<LoyaltyProgram>) => {
  try {
    if (!program.businessId) {
      console.error('🚨 NULL or UNDEFINED businessId in program object!');
      throw new Error('Invalid businessId: Cannot save program with null or undefined businessId');
    }
    
    console.log('🚀 Starting saveLoyaltyProgram with businessId:', program.businessId);
    const correctedBusinessId = getCorrectBusinessId(program.businessId);
    console.log('✅ Using corrected businessId:', correctedBusinessId);

    // Check if we're updating an existing program or creating a new one
    const isNewProgram = !program.id;
    console.log(`Operation: ${isNewProgram ? 'Creating new' : 'Updating existing'} loyalty program`);
    
    // Generate a predictable ID if creating a new program
    const programId = isNewProgram ? `loyalty_${Date.now()}` : program.id;
    console.log('📝 Using program ID:', programId);
    
    // Direct reference to the document
    const programRef = doc(db, 'loyaltyPrograms', programId!);
    
    // Check if this specific document exists
    const existingDoc = await getDoc(programRef);
    const exists = existingDoc.exists();
    console.log(`Document ${programId} exists: ${exists}`);
    
    // Create a clean copy of the program data without undefined values
    // and remove the id field (it's used as the document ID)
    const programData: Record<string, any> = {};
    
    // Copy all defined fields from the program object
    Object.entries(program).forEach(([key, value]) => {
      // Skip the id field and undefined values
      if (key !== 'id' && value !== undefined) {
        programData[key] = value;
      }
    });
    
    // Ensure required fields have values
    programData.businessId = correctedBusinessId;
    programData.updatedAt = new Date();
    
    // Add default values for required fields if needed
    if (program.type === 'points') {
      programData.pointsPerAmount = program.pointsPerAmount || 10;
      programData.amountPerPoint = program.amountPerPoint || 0.1;
    } else if (program.type === 'visits') {
      programData.visitsRequired = program.visitsRequired || 10;
    }
    programData.tiers = program.tiers || [];
    programData.rewards = program.rewards || [];
    
    console.log('📝 Clean program data to save:', programData);

    if (exists) {
      // Update existing document
      console.log('📝 Updating existing program document');
      await updateDoc(programRef, programData);
      console.log('✅ Program updated successfully!');
    } else {
      // Create new document
      console.log('🆕 Creating new program document');
      programData.createdAt = new Date();
      await setDoc(programRef, programData);
      console.log('✅ Program created successfully!');
    }

    // Verify document was saved
    const verifyDoc = await getDoc(programRef);
    if (!verifyDoc.exists()) {
      console.error('❌ CRITICAL: Document not found after save operation!');
      throw new Error('Document save verification failed');
    }
    
    // Return the complete program object
    return {
      ...program,
      id: programId,
      businessId: correctedBusinessId,
      createdAt: exists ? (existingDoc.data()?.createdAt || new Date()) : new Date(),
      updatedAt: new Date(),
      // Ensure these fields have values in the returned object too
      pointsPerAmount: program.type === 'points' ? (program.pointsPerAmount || 10) : 0,
      amountPerPoint: program.type === 'points' ? (program.amountPerPoint || 0.1) : 0,
      visitsRequired: program.type === 'visits' ? (program.visitsRequired || 10) : 0,
      tiers: program.tiers || [],
      rewards: program.rewards || []
    } as LoyaltyProgram;
  } catch (error) {
    console.error('❌ Error saving loyalty program:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    throw error;
  }
};