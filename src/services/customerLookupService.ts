import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer } from '../types';
import { enrollCustomerInProgram } from './customerProgramService';

/**
 * Find a customer by phone number across the entire platform
 * @param phoneNumber The phone number to search for
 * @returns The customer data if found, null otherwise
 */
export const findCustomerByPhone = async (phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      return null;
    }
    
    // Normalize the phone number by removing spaces, dashes, etc.
    const normalizedPhone = phoneNumber.replace(/\s+|-|\(|\)|\+/g, '');
    
    // First check in users collection (platform users)
    const usersRef = collection(db, 'users');
    const usersQuery = query(
      usersRef,
      where('phoneNumber', '==', normalizedPhone),
      where('role', '==', 'customer')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userData = usersSnapshot.docs[0].data();
      const userId = usersSnapshot.docs[0].id;
      
      // Check if this user is already linked to a customer in the business's customer list
      return {
        id: userId,
        userId: userId,
        firstName: userData.displayName?.split(' ')[0] || '',
        lastName: userData.displayName?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        phone: normalizedPhone,
        joinDate: userData.createdAt,
        source: 'platform',
        platformUser: true
      };
    }
    
    // If not found in users, check in customers collection
    const customersRef = collection(db, 'customers');
    const customersQuery = query(
      customersRef,
      where('phone', '==', normalizedPhone)
    );
    
    const customersSnapshot = await getDocs(customersQuery);
    
    if (!customersSnapshot.empty) {
      const customerData = customersSnapshot.docs[0].data();
      return {
        ...customerData,
        id: customersSnapshot.docs[0].id,
        platformUser: !!customerData.userId,
        source: 'business'
      };
    }
    
    // Try with the original phone format as a fallback
    const fallbackQuery = query(
      customersRef,
      where('phone', '==', phoneNumber)
    );
    
    const fallbackSnapshot = await getDocs(fallbackQuery);
    
    if (!fallbackSnapshot.empty) {
      const customerData = fallbackSnapshot.docs[0].data();
      return {
        ...customerData,
        id: fallbackSnapshot.docs[0].id,
        platformUser: !!customerData.userId,
        source: 'business'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding customer by phone:', error);
    throw error;
  }
};

/**
 * Get a customer's enrollment status in a business's loyalty programs
 * @param customerId The customer ID
 * @param businessId The business ID
 * @returns Array of program enrollments
 */
export const getCustomerProgramStatus = async (customerId: string, businessId: string) => {
  try {
    // Get all loyalty programs for this business
    const programsRef = collection(db, 'loyaltyPrograms');
    const programsQuery = query(
      programsRef,
      where('businessId', '==', businessId),
      where('active', '==', true)
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    const programs = programsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get customer enrollments in these programs
    const enrollmentsRef = collection(db, 'customerPrograms');
    const enrollmentsQuery = query(
      enrollmentsRef,
      where('customerId', '==', customerId),
      where('businessId', '==', businessId)
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      programId: doc.data().programId,
      status: doc.data().status,
      ...doc.data()
    }));
    
    // Combine program and enrollment data
    return programs.map(program => {
      const enrollment = enrollments.find(e => e.programId === program.id);
      
      return {
        program,
        enrollment: enrollment || null,
        isEnrolled: !!enrollment,
        status: enrollment ? enrollment.status : 'not_enrolled'
      };
    });
  } catch (error) {
    console.error('Error getting customer program status:', error);
    throw error;
  }
};

/**
 * Add a customer to a business's customer list
 * @param businessId The business ID
 * @param customerData The customer data
 * @returns The created customer
 */
export const addCustomerToBusiness = async (businessId: string, customerData: any) => {
  try {
    // Create a new customer document
    const customersRef = collection(db, 'customers');
    const newCustomerRef = doc(customersRef);
    
    const customer = {
      businessId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      joinDate: serverTimestamp(),
      totalSpent: 0,
      totalVisits: 0,
      loyaltyPoints: 0,
      userId: customerData.userId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(newCustomerRef, customer);
    
    return {
      ...customer,
      id: newCustomerRef.id
    };
  } catch (error) {
    console.error('Error adding customer to business:', error);
    throw error;
  }
};

/**
 * Enroll a customer in a loyalty program
 * @param customerId The customer ID
 * @param businessId The business ID
 * @param programId The program ID
 * @returns The enrollment data
 */
export const enrollCustomer = async (customerId: string, businessId: string, programId: string) => {
  try {
    return await enrollCustomerInProgram(customerId, businessId, programId);
  } catch (error) {
    console.error('Error enrolling customer:', error);
    throw error;
  }
};