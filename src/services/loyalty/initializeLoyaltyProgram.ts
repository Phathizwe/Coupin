import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyProgram } from '../../types';
// import { getLoyaltyAchievements } from './achievementService';

// Helper function to get the correct businessId
const getCorrectBusinessId = (businessId: string): string => {
  // Handle the hardcoded "business_id" case - this should never be used
  if (businessId === 'business_id') {
    console.error('🚨 CRITICAL: Attempted to initialize program with hardcoded "business_id"!');
    throw new Error('Invalid businessId: Cannot initialize program with hardcoded "business_id"');
  }

  // Handle the known businessId mismatch
  if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
    return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
  }
  
  // Additional check for common error patterns
  if (businessId.includes('undefined') || businessId.includes('null')) {
    console.error('🚨 CRITICAL: BusinessId contains invalid string patterns:', businessId);
    throw new Error('Invalid businessId: Contains invalid string patterns');
  }
  
  return businessId;
};

// Initialize a loyalty program for a business if one doesn't exist
export const initializeLoyaltyProgram = async (businessId: string): Promise<LoyaltyProgram> => {
  try {
    console.log('🚀 STARTING initializeLoyaltyProgram for business:', businessId);

    // Validate businessId before proceeding
    if (!businessId || businessId === 'undefined' || businessId === 'null') {
      console.error('❌ Invalid businessId provided:', businessId);
      throw new Error('Invalid businessId provided to initializeLoyaltyProgram');
    }

    const correctedBusinessId = getCorrectBusinessId(businessId);
    console.log('✅ Corrected businessId:', correctedBusinessId);

    // Check if a program already exists
    console.log('🔍 Checking for existing loyalty programs...');
    const loyaltyQuery = query(
      collection(db, 'loyaltyPrograms'),
      where('businessId', '==', correctedBusinessId)
    );

    console.log('📊 Executing Firestore query...');
    const snapshot = await getDocs(loyaltyQuery);
    console.log('📊 Query completed. Empty?', snapshot.empty, 'Size:', snapshot.size);

    if (!snapshot.empty) {
      // Program exists, return it
      const doc = snapshot.docs[0];
      const data = doc.data();

      const program = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
        rewards: data.rewards || []
      } as LoyaltyProgram;

      console.log('✅ Found existing loyalty program:', program);
      return program;
    }

    // No program exists, create a default one
    console.log('🆕 No existing program found. Creating new program...');
    const programRef = doc(collection(db, 'loyaltyPrograms'));
    console.log('📝 Generated program reference with ID:', programRef.id);

    const defaultProgram = {
      businessId: correctedBusinessId,
      name: 'Customer Rewards',
      description: 'Earn points with every purchase and redeem for rewards',
      type: 'points',
      pointsPerAmount: 10, // 10 points per $1
      amountPerPoint: 0.1, // $0.1 value per point when redeeming
      active: true,
      rewards: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('💾 About to save loyalty program to Firestore with data:', defaultProgram);
    console.log('💾 Program reference path:', programRef.path);
    console.log('💾 Database instance:', db ? 'Connected' : 'Not connected');

    // Try to save the document
    try {
    await setDoc(programRef, defaultProgram);
    console.log('✅ Successfully saved loyalty program to Firestore!');
    } catch (saveError) {
      console.error('❌ Error saving loyalty program:', saveError);
      throw new Error('Failed to save loyalty program to database');
    }

    // Verify the document was saved
    console.log('🔍 Verifying document was saved...');
    const verifyQuery = query(
      collection(db, 'loyaltyPrograms'),
      where('businessId', '==', correctedBusinessId)
    );
    const verifySnapshot = await getDocs(verifyQuery);
    console.log('🔍 Verification query result - Empty?', verifySnapshot.empty, 'Size:', verifySnapshot.size);

    if (verifySnapshot.empty) {
      console.error('❌ Verification failed: Loyalty program not found after saving');
      throw new Error('Verification failed: Loyalty program not found after saving');
    }

    const newProgram = {
      ...defaultProgram,
      id: programRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as LoyaltyProgram;

    console.log('✅ Created new loyalty program:', newProgram);

    // TEMPORARILY DISABLED: Initialize achievements for this program
    // await getLoyaltyAchievements(correctedBusinessId, programRef.id);
    console.log('⚠️ Achievement initialization temporarily disabled for debugging');

    return newProgram;
  } catch (error) {
    console.error('❌ ERROR in initializeLoyaltyProgram:', error);

    // Safe error logging
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error('❌ Unknown error type:', error);
    }

    throw error;
  }
};