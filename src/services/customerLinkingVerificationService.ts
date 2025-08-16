import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  runTransaction,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber } from './enhancedCustomerLookupService';

// Define interfaces for type safety
interface Customer {
  id: string;
  userId?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  updatedAt?: any;
  createdAt?: any;
  [key: string]: any;
}

interface UserCustomerMap {
  [userId: string]: Customer[] | string[];
}

/**
 * Verify and repair customer-user linking
 */
export const verifyCustomerUserLink = async (userId: string, phoneNumber: string) => {
  try {
    console.log(`[verifyCustomerUserLink] Verifying link for user ${userId} with phone ${phoneNumber}`);

    // Find customer by phone
    const customersRef = collection(db, 'customers');
    const customersQuery = query(
      customersRef,
      where('phone', '==', phoneNumber)
    );
    const customersSnapshot = await getDocs(customersQuery);

    if (customersSnapshot.empty) {
      console.log(`[verifyCustomerUserLink] No customer found with phone ${phoneNumber}`);
      return { linked: false, reason: 'customer_not_found' };
    }

    const customerDoc = customersSnapshot.docs[0];
    const customerData = customerDoc.data();

    // Check if customer already has correct userId
    if (customerData.userId === userId) {
      console.log(`[verifyCustomerUserLink] Customer already correctly linked`);
      return { linked: true, customerId: customerDoc.id };
    }

    // Check if customer has different userId
    if (customerData.userId && customerData.userId !== userId) {
      console.log(`[verifyCustomerUserLink] Customer linked to different user: ${customerData.userId}`);
      return { linked: false, reason: 'linked_to_different_user', existingUserId: customerData.userId };
    }

    // Customer exists but not linked - repair the link
    console.log(`[verifyCustomerUserLink] Repairing customer-user link`);
    await runTransaction(db, async (transaction) => {
      const customerRef = doc(db, 'customers', customerDoc.id);
      transaction.update(customerRef, {
        userId: userId,
        updatedAt: serverTimestamp()
      });

      // Also update the user record with the linked customer ID
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists()) {
        transaction.update(userRef, {
          linkedCustomerId: customerDoc.id,
          updatedAt: serverTimestamp()
        });
      }
    });

    console.log(`[verifyCustomerUserLink] Successfully repaired link`);
    return { linked: true, customerId: customerDoc.id, repaired: true };
  } catch (error) {
    console.error('[verifyCustomerUserLink] Error verifying customer link:', error);
    throw error;
  }
};

/**
 * Get customer data for a user
 */
export const getCustomerForUser = async (userId: string) => {
  try {
    const customersRef = collection(db, 'customers');
    const customersQuery = query(
      customersRef,
      where('userId', '==', userId)
    );
    const customersSnapshot = await getDocs(customersQuery);

    if (customersSnapshot.empty) {
      return null;
    }

    const customerDoc = customersSnapshot.docs[0];
    return {
      ...customerDoc.data(),
      id: customerDoc.id
    };
  } catch (error) {
    console.error('[getCustomerForUser] Error getting customer for user:', error);
    throw error;
  }
};

/**
 * Generate a link status report for monitoring
 */
export const generateLinkStatusReport = async () => {
  try {
    console.log(`[generateLinkStatusReport] Generating link status report`);

    const report = {
      totalCustomers: 0,
      linkedCustomers: 0,
      unlinkedCustomers: 0,
      multipleCustomersPerUser: 0,
      brokenLinks: 0,
      timestamp: new Date().toISOString()
    };

    // Count customers
    const customersRef = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersRef);

    report.totalCustomers = customersSnapshot.size;

    // Count linked and unlinked customers
    const userCustomerMap: UserCustomerMap = {};

    customersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        report.linkedCustomers++;

        // Track customers per user for multiple customer detection
        if (!userCustomerMap[data.userId]) {
          userCustomerMap[data.userId] = [];
        }

        (userCustomerMap[data.userId] as string[]).push(doc.id);
      } else {
        report.unlinkedCustomers++;
      }
    });

    // Check for users with multiple customers
    Object.keys(userCustomerMap).forEach(userId => {
      if (userCustomerMap[userId].length > 1) {
        report.multipleCustomersPerUser++;
      }
    });

    console.log(`[generateLinkStatusReport] Report generated:`, report);

    // Store the report
    const reportsRef = collection(db, 'linking_reports');
    await addDoc(reportsRef, {
      ...report,
      createdAt: serverTimestamp()
    });

    return report;
  } catch (error) {
    console.error('[generateLinkStatusReport] Error generating link status report:', error);
    throw error;
  }
};

/**
 * Repair all broken links found in the system
 */
export const repairAllBrokenLinks = async () => {
  try {
    console.log(`[repairAllBrokenLinks] Starting repair of all broken links`);

    const repairResults = {
      totalRepaired: 0,
      missingUserLinks: 0,
      mismatchedLinks: 0,
      multipleCustomers: 0,
      details: []
    };

    // Get all customers with userId
    const customersRef = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersRef);

    // Group customers by userId using a plain object instead of Map
    const userCustomerMap: UserCustomerMap = {};

    customersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        if (!userCustomerMap[data.userId]) {
          userCustomerMap[data.userId] = [];
        }

        (userCustomerMap[data.userId] as Customer[]).push({
          id: doc.id,
          ...data
        });
      }
    });

    // Process each user's customers
    const userIds = Object.keys(userCustomerMap);
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const customers = userCustomerMap[userId] as Customer[];

      // Check if user exists
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // User doesn't exist - unlink customers
        const batch = writeBatch(db);

        for (const customer of customers) {
          const customerRef = doc(db, 'customers', customer.id);
          batch.update(customerRef, {
            userId: null,
            updatedAt: serverTimestamp()
          });

          repairResults.totalRepaired++;
        }

        await batch.commit();
        continue;
      }

      const userData = userDoc.data();

      // Handle multiple customers linked to one user
      if (customers.length > 1) {
        repairResults.multipleCustomers++;

        // Keep the most recent customer
        const sortedCustomers = [...customers].sort((a, b) => {
          const aDate = a.updatedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
          const bDate = b.updatedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });

        const primaryCustomer = sortedCustomers[0];
        const batch = writeBatch(db);

        // Update user to point to primary customer
        batch.update(userRef, {
          linkedCustomerId: primaryCustomer.id,
          updatedAt: serverTimestamp()
        });

        // Unlink other customers
        for (let i = 1; i < sortedCustomers.length; i++) {
          const customerRef = doc(db, 'customers', sortedCustomers[i].id);
          batch.update(customerRef, {
            userId: null,
            updatedAt: serverTimestamp()
          });

          repairResults.totalRepaired++;
        }

        await batch.commit();
      } else {
        // Single customer
        const customer = customers[0];

        // Check if user has correct linkedCustomerId
        if (!userData.linkedCustomerId) {
          // Missing link
          await updateDoc(userRef, {
            linkedCustomerId: customer.id,
            updatedAt: serverTimestamp()
          });

          repairResults.missingUserLinks++;
          repairResults.totalRepaired++;
        } else if (userData.linkedCustomerId !== customer.id) {
          // Mismatched link
          await updateDoc(userRef, {
            linkedCustomerId: customer.id,
            updatedAt: serverTimestamp()
          });

          repairResults.mismatchedLinks++;
          repairResults.totalRepaired++;
        }
      }
    }

    console.log(`[repairAllBrokenLinks] Repair completed: ${repairResults.totalRepaired} links repaired`);
    return repairResults;
  } catch (error) {
    console.error('[repairAllBrokenLinks] Error repairing broken links:', error);
    throw error;
  }
};

/**
 * Record a linking action in the linking_logs collection
 */
export const recordLinkingAction = async (userId: string, customerId: string | null, action: string, details: any) => {
  try {
    const logsRef = collection(db, 'linking_logs');

    await addDoc(logsRef, {
      userId,
      customerId,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('[recordLinkingAction] Error recording linking action:', error);
  }
};