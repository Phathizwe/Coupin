import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { logAnalyticsEvent } from '../config/firebase';

/**
 * Comprehensive diagnostic function to check if a user registration completed successfully
 */
export const diagnoseBusiness = async (userId: string): Promise<{
  success: boolean;
  issues: string[];
  userData: any;
  businessData: any;
}> => {
  const issues: string[] = [];
  let userData = null;
  let businessData = null;
  let success = false;

  try {
    console.log('🔍 [Diagnostics] Checking registration for user:', userId);
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      issues.push('User document does not exist in Firestore');
      return { success: false, issues, userData: null, businessData: null };
    }
    
    // Get user data
    userData = userDoc.data();
    console.log('✅ [Diagnostics] User document exists:', userData);
    
    // Check if user has role
    if (!userData.role) {
      issues.push('User document has no role defined');
    } else if (userData.role !== 'business') {
      issues.push(`User has incorrect role: ${userData.role} (expected: business)`);
    }
    
    // Check if user has businessId
    const businessId = userData.businessId || userData.currentBusinessId;
    if (!businessId) {
      issues.push('User has no businessId or currentBusinessId');
      return { success: false, issues, userData, businessData: null };
    }
    
    // Check if business document exists
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    if (!businessDoc.exists()) {
      issues.push(`Business document does not exist for ID: ${businessId}`);
      return { success: false, issues, userData, businessData: null };
    }
    
    // Get business data
    businessData = businessDoc.data();
    console.log('✅ [Diagnostics] Business document exists:', businessData);
    
    // Check if business has correct ownerId
    if (businessData.ownerId !== userId) {
      issues.push(`Business has incorrect ownerId: ${businessData.ownerId} (expected: ${userId})`);
    }
    
    // Check if business is active
    if (businessData.active !== true) {
      issues.push('Business is not active');
    }
    
    success = issues.length === 0;
    
    // Log diagnostics results to analytics
    logAnalyticsEvent('business_registration_diagnostics', {
      success,
      issueCount: issues.length,
      issues: issues.join(', '),
      userId
    });
    
    return { success, issues, userData, businessData };
  } catch (error: any) {
    console.error('❌ [Diagnostics] Error diagnosing registration:', error);
    issues.push(`Error during diagnostics: ${error?.message || 'Unknown error'}`);
    return { success: false, issues, userData, businessData };
  }
};

/**
 * Fix common business registration issues automatically
 */
export const fixBusinessRegistration = async (userId: string): Promise<{
  fixed: boolean;
  actions: string[];
}> => {
  const actions: string[] = [];
  
  try {
    console.log('🔧 [Diagnostics] Attempting to fix registration for user:', userId);
    
    // First run diagnostics
    const { success, issues, userData } = await diagnoseBusiness(userId);
    
    if (success) {
      console.log('✅ [Diagnostics] No issues found, no fixes needed');
      return { fixed: true, actions: ['No issues found, no fixes needed'] };
    }
    
    // If user document exists but has no business
    if (userData && (!userData.businessId || !userData.currentBusinessId)) {
      await createBusinessForUser(userId, userData.displayName || 'My Business');
      actions.push('Created new business document for user');
    }
    
    // Run diagnostics again to see if fixes worked
    const afterFix = await diagnoseBusiness(userId);
    
    return { 
      fixed: afterFix.success, 
      actions 
    };
  } catch (error: any) {
    console.error('❌ [Diagnostics] Error fixing registration:', error);
    actions.push(`Error during fix: ${error?.message || 'Unknown error'}`);
    return { fixed: false, actions };
  }
};

/**
 * Helper function to create a business for an existing user
 */
const createBusinessForUser = async (userId: string, businessName: string): Promise<string> => {
  // Create a business document with a generated ID
  const businessRef = doc(collection(db, 'businesses'));
  const businessId = businessRef.id;
  
  // Create business document
  await setDoc(businessRef, {
    businessId,
    businessName: businessName || 'My Business',
    industry: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ownerId: userId,
    active: true
  });
  
  // Update user document with business reference
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    businessId,
    businesses: [businessId],
    currentBusinessId: businessId,
    role: 'business',
    updatedAt: serverTimestamp()
  });
  
  console.log('✅ [Diagnostics] Created business document with ID:', businessId);
  
  return businessId;
};