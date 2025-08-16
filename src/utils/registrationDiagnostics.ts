/**
 * Registration diagnostics utility
 * For debugging phone number registration issues
 */
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber } from './phoneUtils';

/**
 * Debug phone number handling during registration
 * 
 * @param userId The user ID to debug
 * @param phone The phone number that was provided during registration
 * @returns Diagnostic information
 */
export const debugPhoneRegistration = async (userId: string, phone?: string): Promise<any> => {
  console.log('🔍 [PHONE DEBUG] Starting phone registration debugging');
  console.log('🔍 [PHONE DEBUG] User ID:', userId);
  console.log('🔍 [PHONE DEBUG] Original phone:', phone);
  
  const results: any = {
    userId,
    originalPhone: phone,
    normalizedPhone: phone ? normalizePhoneNumber(phone) : null,
    userDocument: null,
    phoneInUserDoc: null,
    customerByUserId: null,
    customerByPhone: null,
    phoneFormatsChecked: [],
    success: false,
    issues: []
  };
  
  try {
    // Step 1: Check user document
    console.log('🔍 [PHONE DEBUG] Checking user document...');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      results.issues.push('User document does not exist');
      console.log('❌ [PHONE DEBUG] User document does not exist');
      return results;
    }
    
    const userData = userDoc.data();
    results.userDocument = userData;
    results.phoneInUserDoc = userData.phoneNumber || null;
    
    console.log('🔍 [PHONE DEBUG] User document:', userData);
    console.log('🔍 [PHONE DEBUG] Phone in user document:', results.phoneInUserDoc);
    
    if (!results.phoneInUserDoc) {
      results.issues.push('Phone number missing from user document');
      console.log('❌ [PHONE DEBUG] Phone number missing from user document');
    }
    
    // Step 2: Check customer by user ID
    console.log('🔍 [PHONE DEBUG] Checking customer by user ID...');
    const customersRef = collection(db, 'customers');
    const userIdQuery = query(
      customersRef,
      where('userId', '==', userId),
      limit(1)
    );
    
    const userIdSnapshot = await getDocs(userIdQuery);
    
    if (!userIdSnapshot.empty) {
      const customerData = userIdSnapshot.docs[0].data();
      results.customerByUserId = {
        id: userIdSnapshot.docs[0].id,
        ...customerData
      };
      console.log('✅ [PHONE DEBUG] Found customer by user ID:', results.customerByUserId);
    } else {
      results.issues.push('No customer record found with this user ID');
      console.log('❌ [PHONE DEBUG] No customer record found with this user ID');
    }
    
    // Step 3: Check customer by phone (if phone was provided)
    if (phone) {
      console.log('🔍 [PHONE DEBUG] Checking customer by phone...');
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Try multiple phone formats
      const phoneFormats = [
        normalizedPhone,
        phone,
        phone.replace(/\D/g, ''),
        normalizedPhone.replace(/^\+/, ''),
        `0${normalizedPhone.substring(3)}`,
      ];
      
      results.phoneFormatsChecked = phoneFormats;
      console.log('🔍 [PHONE DEBUG] Checking phone formats:', phoneFormats);
      
      for (const phoneFormat of phoneFormats) {
        if (!phoneFormat) continue;
        
        const phoneQuery = query(
          customersRef,
          where('phone', '==', phoneFormat),
          limit(1)
        );
        
        const phoneSnapshot = await getDocs(phoneQuery);
        
        if (!phoneSnapshot.empty) {
          const customerData = phoneSnapshot.docs[0].data();
          results.customerByPhone = {
            id: phoneSnapshot.docs[0].id,
            ...customerData,
            matchedFormat: phoneFormat
          };
          console.log('✅ [PHONE DEBUG] Found customer by phone format:', phoneFormat);
          console.log('✅ [PHONE DEBUG] Customer data:', results.customerByPhone);
          break;
        }
      }
      
      if (!results.customerByPhone) {
        results.issues.push('No customer record found with any phone format');
        console.log('❌ [PHONE DEBUG] No customer record found with any phone format');
      }
    }
    
    // Determine overall success
    results.success = results.phoneInUserDoc && 
                      (results.customerByUserId || results.customerByPhone);
    
    if (results.success) {
      console.log('✅ [PHONE DEBUG] Phone registration appears successful');
    } else {
      console.log('❌ [PHONE DEBUG] Phone registration has issues:', results.issues);
    }
    
    return results;
  } catch (error) {
    console.error('❌ [PHONE DEBUG] Error during phone registration debugging:', error);
    results.issues.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
};

/**
 * Test phone number registration with a specific phone number
 * 
 * @param phone The phone number to test
 * @returns Test results
 */
export const testPhoneRegistration = async (phone: string): Promise<any> => {
  console.log('🧪 [PHONE TEST] Testing phone registration with:', phone);
  
  const normalized = normalizePhoneNumber(phone);
  console.log('🧪 [PHONE TEST] Normalized phone:', normalized);
  
  // Check various formats
  const formats = [
    phone,
    normalized,
    phone.replace(/\D/g, ''),
    normalized.replace(/^\+/, ''),
    `0${normalized.substring(3)}`,
  ];
  
  console.log('🧪 [PHONE TEST] Testing formats:', formats);
  
  const results: any = {
    originalPhone: phone,
    normalizedPhone: normalized,
    formatsChecked: formats,
    customersFound: []
  };
  
  try {
    const customersRef = collection(db, 'customers');
    
    for (const format of formats) {
      if (!format) continue;
      
      console.log(`🧪 [PHONE TEST] Checking format: "${format}"`);
      
      const phoneQuery = query(
        customersRef,
        where('phone', '==', format),
        limit(5)
      );
      
      const snapshot = await getDocs(phoneQuery);
      
      if (!snapshot.empty) {
        const customers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          matchedFormat: format
        }));
        
        results.customersFound.push(...customers);
        console.log(`✅ [PHONE TEST] Found ${customers.length} customers with format "${format}"`);
      } else {
        console.log(`ℹ️ [PHONE TEST] No customers found with format "${format}"`);
      }
    }
    
    console.log('🧪 [PHONE TEST] Test complete, found customers:', results.customersFound.length);
    return results;
  } catch (error) {
    console.error('❌ [PHONE TEST] Error testing phone registration:', error);
    return {
      ...results,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Diagnose business registration issues
 * 
 * @param userId User ID to diagnose
 * @returns Diagnostic information
 */
export const diagnoseBusiness = async (userId: string): Promise<any> => {
  console.log('🔍 [BUSINESS DEBUG] Starting business registration diagnostics');
  console.log('🔍 [BUSINESS DEBUG] User ID:', userId);
  
  const results: any = {
    userId,
    userDocument: null,
    businessId: null,
    businessDocument: null,
    currentBusinessId: null,
    businessesArray: null,
    success: false,
    issues: []
  };
  
  try {
    // Step 1: Check user document
    console.log('🔍 [BUSINESS DEBUG] Checking user document...');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      results.issues.push('User document does not exist');
      console.log('❌ [BUSINESS DEBUG] User document does not exist');
      return results;
    }
    
    const userData = userDoc.data();
    results.userDocument = userData;
    results.businessId = userData.businessId || null;
    results.currentBusinessId = userData.currentBusinessId || null;
    results.businessesArray = userData.businesses || null;
    
    console.log('🔍 [BUSINESS DEBUG] User document:', userData);
    console.log('🔍 [BUSINESS DEBUG] Business ID:', results.businessId);
    console.log('🔍 [BUSINESS DEBUG] Current Business ID:', results.currentBusinessId);
    console.log('🔍 [BUSINESS DEBUG] Businesses array:', results.businessesArray);
    
    // Check for issues with business IDs
    if (!results.businessId) {
      results.issues.push('No businessId in user document');
      console.log('❌ [BUSINESS DEBUG] No businessId in user document');
    }
    
    if (!results.currentBusinessId) {
      results.issues.push('No currentBusinessId in user document');
      console.log('❌ [BUSINESS DEBUG] No currentBusinessId in user document');
    }
    
    if (!results.businessesArray || results.businessesArray.length === 0) {
      results.issues.push('No businesses array or empty array in user document');
      console.log('❌ [BUSINESS DEBUG] No businesses array or empty array in user document');
    }
    
    // Step 2: Check business document if we have a business ID
    if (results.businessId) {
      console.log('🔍 [BUSINESS DEBUG] Checking business document...');
      const businessDocRef = doc(db, 'businesses', results.businessId);
      const businessDoc = await getDoc(businessDocRef);
      
      if (!businessDoc.exists()) {
        results.issues.push('Business document does not exist');
        console.log('❌ [BUSINESS DEBUG] Business document does not exist');
      } else {
        const businessData = businessDoc.data();
        results.businessDocument = businessData;
        console.log('✅ [BUSINESS DEBUG] Business document exists:', businessData);
      }
    }
    
    // Determine overall success
    results.success = results.businessId && 
                      results.currentBusinessId && 
                      results.businessesArray && 
                      results.businessesArray.length > 0 &&
                      results.businessDocument;
    
    if (results.success) {
      console.log('✅ [BUSINESS DEBUG] Business registration appears successful');
    } else {
      console.log('❌ [BUSINESS DEBUG] Business registration has issues:', results.issues);
    }
    
    return results;
  } catch (error) {
    console.error('❌ [BUSINESS DEBUG] Error during business diagnostics:', error);
    results.issues.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
};

/**
 * Fix business registration issues
 * 
 * @param userId User ID to fix
 * @returns Fix results
 */
export const fixBusinessRegistration = async (userId: string): Promise<any> => {
  console.log('🔧 [BUSINESS FIX] Starting business registration fix');
  console.log('🔧 [BUSINESS FIX] User ID:', userId);
  
  // First, diagnose the issues
  const diagnostics = await diagnoseBusiness(userId);
  
  const results = {
    userId,
    diagnostics,
    fixes: {
      businessIdUpdated: false,
      currentBusinessIdUpdated: false,
      businessesArrayUpdated: false,
      businessDocumentCreated: false
    },
    success: false
  };
  
  try {
    // If already successful, no need to fix
    if (diagnostics.success) {
      console.log('✅ [BUSINESS FIX] No issues to fix');
      results.success = true;
      return results;
    }
    
    const userDocRef = doc(db, 'users', userId);
    const updateData: any = {};
    
    // Fix 1: If we have a businessId but no currentBusinessId
    if (diagnostics.businessId && !diagnostics.currentBusinessId) {
      console.log('🔧 [BUSINESS FIX] Setting currentBusinessId to match businessId');
      updateData.currentBusinessId = diagnostics.businessId;
      results.fixes.currentBusinessIdUpdated = true;
    }
    
    // Fix 2: If we have a businessId but no businesses array
    if (diagnostics.businessId && (!diagnostics.businessesArray || diagnostics.businessesArray.length === 0)) {
      console.log('🔧 [BUSINESS FIX] Setting businesses array to include businessId');
      updateData.businesses = [diagnostics.businessId];
      results.fixes.businessesArrayUpdated = true;
    }
    
    // Apply user document updates if needed
    if (Object.keys(updateData).length > 0) {
      await updateDoc(userDocRef, updateData);
      console.log('✅ [BUSINESS FIX] Updated user document with:', updateData);
    }
    
    // Fix 3: If we have a businessId but no business document
    if (diagnostics.businessId && !diagnostics.businessDocument) {
      console.log('🔧 [BUSINESS FIX] Creating missing business document');
      
      const businessDocRef = doc(db, 'businesses', diagnostics.businessId);
      const businessData = {
        businessId: diagnostics.businessId,
        businessName: diagnostics.userDocument.displayName || 'My Business',
        industry: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        active: true,
        businessNameLower: (diagnostics.userDocument.displayName || 'My Business').toLowerCase()
      };
      
      await setDoc(businessDocRef, businessData);
      console.log('✅ [BUSINESS FIX] Created business document:', businessData);
      results.fixes.businessDocumentCreated = true;
    }
    
    // Run diagnostics again to verify fixes
    const updatedDiagnostics = await diagnoseBusiness(userId);
    results.success = updatedDiagnostics.success;
    
    console.log('🔧 [BUSINESS FIX] Fix results:', results);
    return results;
  } catch (error) {
    console.error('❌ [BUSINESS FIX] Error fixing business registration:', error);
    return {
      ...results,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
};

/**
 * Add this function to the window object for easy browser console testing
 */
if (typeof window !== 'undefined') {
  (window as any).debugPhoneRegistration = debugPhoneRegistration;
  (window as any).testPhoneRegistration = testPhoneRegistration;
  (window as any).diagnoseBusiness = diagnoseBusiness;
  (window as any).fixBusinessRegistration = fixBusinessRegistration;
}