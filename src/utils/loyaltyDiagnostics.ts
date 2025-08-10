import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const diagnoseLoyaltyProgramIssue = async (businessId: string) => {
  try {
    console.log('🔍 Starting loyalty program diagnostic for business:', businessId);
    
    // Step 1: Check if the loyaltyPrograms collection exists and is accessible
    console.log('Step 1: Checking loyaltyPrograms collection access...');
    try {
      const testQuery = query(collection(db, 'loyaltyPrograms'), where('businessId', '==', businessId));
      const snapshot = await getDocs(testQuery);
      console.log('✅ Collection access successful. Found', snapshot.docs.length, 'documents');
    } catch (error) {
      console.error('❌ Error accessing loyaltyPrograms collection:', error);
      return {
        success: false,
        error: 'Collection access error',
        details: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Step 2: Try to create a test document
    console.log('Step 2: Attempting to create a test document...');
    const testId = `test_${Date.now()}`;
    const testDocRef = doc(db, 'loyaltyPrograms', testId);
    
    try {
      await setDoc(testDocRef, {
        businessId,
        name: 'Test Program',
        description: 'Diagnostic test document',
        type: 'points',
        testField: true,
        createdAt: new Date()
      });
      console.log('✅ Test document created successfully');
      
      // Verify the document was created
      const verifyDoc = await getDoc(testDocRef);
      if (verifyDoc.exists()) {
        console.log('✅ Test document verified in database');
      } else {
        console.log('❌ Test document not found after creation!');
        return {
          success: false,
          error: 'Document creation verification failed',
          details: 'Document was not found after creation attempt'
        };
      }
    } catch (error) {
      console.error('❌ Error creating test document:', error);
      return {
        success: false,
        error: 'Document creation error',
        details: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Step 3: Check for any existing loyalty program documents
    console.log('Step 3: Checking for existing loyalty programs...');
    const existingQuery = query(collection(db, 'loyaltyPrograms'));
    const allDocs = await getDocs(existingQuery);
    
    console.log(`Found ${allDocs.docs.length} total loyalty program documents`);
    allDocs.docs.forEach(doc => {
      console.log(`- Document ID: ${doc.id}, Business ID: ${doc.data().businessId}`);
    });
    
    return {
      success: true,
      message: 'Diagnostic completed successfully',
      existingPrograms: allDocs.docs.length,
      testDocumentId: testId
    };
  } catch (error) {
    console.error('❌ Diagnostic failed with error:', error);
    return {
      success: false,
      error: 'Diagnostic process error',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

export const createDirectLoyaltyProgram = async (businessId: string) => {
  try {
    console.log('🚀 Creating direct loyalty program for business:', businessId);
    
    // Generate a predictable ID based on the business ID
    const programId = `loyalty_${Date.now()}`;
    const programRef = doc(db, 'loyaltyPrograms', programId);
    
    const programData = {
      businessId,
      name: 'Customer Rewards',
      description: 'Earn points with every purchase and redeem for rewards',
      type: 'points',
      pointsPerAmount: 10,
      amountPerPoint: 0.1,
      active: true,
      rewards: [],
      tiers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(programRef, programData);
    console.log('✅ Direct program creation successful with ID:', programId);
    
    // Verify the program was created
    const verifyDoc = await getDoc(programRef);
    if (verifyDoc.exists()) {
      console.log('✅ Program document verified in database');
      return {
        success: true,
        programId,
        message: 'Loyalty program created successfully'
      };
    } else {
      console.log('❌ Program document not found after creation!');
      return {
        success: false,
        error: 'Document creation verification failed',
        details: 'Document was not found after creation attempt'
      };
    }
  } catch (error) {
    console.error('❌ Error creating direct loyalty program:', error);
    return {
      success: false,
      error: 'Program creation error',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};