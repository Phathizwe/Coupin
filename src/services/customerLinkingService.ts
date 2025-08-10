import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer } from '../types';

/**
 * Finds a customer profile by phone number
 * @param phone The phone number to search for
 * @returns The customer profile if found, null otherwise
 */
export const findCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  try {
    // Normalize the phone number by removing spaces, dashes, etc.
    const normalizedPhone = phone.replace(/\s+|-|\(|\)|\+/g, '');
    
    // Query for customers with this phone number
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('phone', '==', normalizedPhone));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Try with the original phone format as a fallback
      const fallbackQuery = query(customersRef, where('phone', '==', phone));
      const fallbackSnapshot = await getDocs(fallbackQuery);
      
      if (fallbackSnapshot.empty) {
        return null;
      }
      
      const customerDoc = fallbackSnapshot.docs[0];
      return {
        id: customerDoc.id,
        ...customerDoc.data()
      } as Customer;
    }
    
    const customerDoc = snapshot.docs[0];
    return {
      id: customerDoc.id,
      ...customerDoc.data()
    } as Customer;
  } catch (error) {
    console.error('Error finding customer by phone:', error);
    throw error;
  }
};

/**
 * Links a user account to an existing customer profile
 * @param userId The Firebase user ID
 * @param customerId The customer profile ID to link
 * @returns True if successful
 */
export const linkUserToCustomer = async (userId: string, customerId: string): Promise<boolean> => {
  try {
    // Update the customer record with the user ID
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, {
      userId: userId,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error linking user to customer:', error);
    throw error;
  }
};

/**
 * Gets all coupons for a customer
 * @param customerId The customer ID
 * @returns Array of coupon distributions with coupon details
 */
export const getCustomerCoupons = async (customerId: string) => {
  try {
    // Get all coupon distributions for this customer
    const distributionsRef = collection(db, 'couponDistributions');
    const q = query(distributionsRef, where('customerId', '==', customerId));
    const snapshot = await getDocs(q);
    
    // Fetch the actual coupon details for each distribution
    const couponsWithDetails = await Promise.all(
      snapshot.docs.map(async (distDoc) => {
        const distData = distDoc.data();
        const couponRef = doc(db, 'coupons', distData.couponId);
        const couponSnap = await getDoc(couponRef);
        
        if (couponSnap.exists()) {
          return {
            id: distDoc.id,
            distribution: {
              id: distDoc.id,
              ...distData
            },
            coupon: {
              id: couponSnap.id,
              ...couponSnap.data()
            }
          };
        }
        return null;
      })
    );
    
    return couponsWithDetails.filter(item => item !== null);
  } catch (error) {
    console.error('Error getting customer coupons:', error);
    throw error;
  }
};

/**
 * Checks if a user already has a linked customer profile
 * @param userId The Firebase user ID
 * @returns The customer profile if found, null otherwise
 */
export const findCustomerByUserId = async (userId: string): Promise<Customer | null> => {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const customerDoc = snapshot.docs[0];
    return {
      id: customerDoc.id,
      ...customerDoc.data()
    } as Customer;
  } catch (error) {
    console.error('Error finding customer by user ID:', error);
    throw error;
  }
};