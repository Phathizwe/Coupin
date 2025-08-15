import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer } from '../types';

/**
 * Customer-Business Linking Service
 * This service provides the critical connection between customers and businesses
 * It enables cross-platform visibility and solves the data isolation problem
 */

/**
 * Finds customers for a business by phone number
 * This is the critical function for business owners to find customers
 */
export const findCustomersByPhone = async (businessId: string, phoneNumber: string): Promise<Customer[]> => {
  try {
    console.log(`Finding customers with phone ${phoneNumber} for business ${businessId}`);
    
    // Normalize the phone number by removing spaces, dashes, etc.
    const normalizedPhone = phoneNumber.replace(/\s+|-|\(|\)|\+/g, '');
    
    // Try different phone number formats
    const phoneFormats = [
      phoneNumber,
      normalizedPhone,
      `+${normalizedPhone}`,
      normalizedPhone.startsWith('27') ? `+${normalizedPhone}` : `+27${normalizedPhone}`
    ];
    
    const customers: Customer[] = [];
    
    // Check each phone format
    for (const phone of phoneFormats) {
      console.log(`Trying phone format: ${phone}`);
      
      const customersRef = collection(db, 'customers');
      const phoneQuery = query(
        customersRef,
        where('phone', '==', phone)
      );
      
      const customersSnapshot = await getDocs(phoneQuery);
      
      if (!customersSnapshot.empty) {
        console.log(`Found ${customersSnapshot.size} customers with phone ${phone}`);
        
        customersSnapshot.forEach(customerDoc => {
          const customerData = customerDoc.data();
          
          // Add customer to results
          customers.push({
            id: customerDoc.id,
            businessId: customerData.businessId || '',
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            birthdate: customerData.birthdate,
            joinDate: customerData.joinDate,
            lastVisit: customerData.lastVisit,
            totalSpent: customerData.totalSpent || 0,
            totalVisits: customerData.totalVisits || 0,
            notes: customerData.notes || '',
            tags: customerData.tags || [],
            loyaltyPoints: customerData.loyaltyPoints || 0,
            userId: customerData.userId || ''
          });
        });
      }
    }
    
    return customers;
  } catch (error) {
    console.error('Error finding customers by phone:', error);
    return [];
  }
};

/**
 * Gets all customers for a business
 */
export const getBusinessCustomers = async (businessId: string): Promise<Customer[]> => {
  try {
    console.log(`Getting customers for business ${businessId}`);
    
    // First, get customers directly associated with this business
    const customersRef = collection(db, 'customers');
    const businessQuery = query(
      customersRef,
      where('businessId', '==', businessId)
    );
    
    const customersSnapshot = await getDocs(businessQuery);
    
    const customers: Customer[] = [];
    
    customersSnapshot.forEach(customerDoc => {
      const customerData = customerDoc.data();
      
      customers.push({
        id: customerDoc.id,
        businessId: customerData.businessId || '',
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        birthdate: customerData.birthdate,
        joinDate: customerData.joinDate,
        lastVisit: customerData.lastVisit,
        totalSpent: customerData.totalSpent || 0,
        totalVisits: customerData.totalVisits || 0,
        notes: customerData.notes || '',
        tags: customerData.tags || [],
        loyaltyPoints: customerData.loyaltyPoints || 0,
        userId: customerData.userId || ''
      });
    });
    
    // Next, get customers from customerPrograms collection
    const programsRef = collection(db, 'customerPrograms');
    const programsQuery = query(
      programsRef,
      where('businessId', '==', businessId)
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    
    // Set to track customer IDs we've already added
    const customerIds = new Set(customers.map(c => c.id));
    
    // Process each customer program
    for (const programDoc of programsSnapshot.docs) {
      const programData = programDoc.data();
      const customerId = programData.customerId;
      
      // Skip if we already have this customer
      if (customerIds.has(customerId)) {
        continue;
      }
      
      // Get customer details
      try {
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        
        if (customerDoc.exists()) {
          const customerData = customerDoc.data();
          
          customers.push({
            id: customerDoc.id,
            businessId: customerData.businessId || '',
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            birthdate: customerData.birthdate,
            joinDate: customerData.joinDate,
            lastVisit: customerData.lastVisit,
            totalSpent: customerData.totalSpent || 0,
            totalVisits: customerData.totalVisits || 0,
            notes: customerData.notes || '',
            tags: customerData.tags || [],
            loyaltyPoints: customerData.loyaltyPoints || 0,
            userId: customerData.userId || ''
          });
          
          customerIds.add(customerId);
        }
      } catch (error) {
        console.error(`Error getting customer ${customerId}:`, error);
      }
    }
    
    // Finally, get customers from couponDistributions collection
    const distributionsRef = collection(db, 'couponDistributions');
    const distributionsQuery = query(
      distributionsRef,
      where('businessId', '==', businessId)
    );
    
    const distributionsSnapshot = await getDocs(distributionsQuery);
    
    // Process each distribution
    for (const distributionDoc of distributionsSnapshot.docs) {
      const distributionData = distributionDoc.data();
      const customerId = distributionData.customerId;
      
      // Skip if we already have this customer
      if (customerIds.has(customerId)) {
        continue;
      }
      
      // Get customer details
      try {
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        
        if (customerDoc.exists()) {
          const customerData = customerDoc.data();
          
          customers.push({
            id: customerDoc.id,
            businessId: customerData.businessId || '',
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            birthdate: customerData.birthdate,
            joinDate: customerData.joinDate,
            lastVisit: customerData.lastVisit,
            totalSpent: customerData.totalSpent || 0,
            totalVisits: customerData.totalVisits || 0,
            notes: customerData.notes || '',
            tags: customerData.tags || [],
            loyaltyPoints: customerData.loyaltyPoints || 0,
            userId: customerData.userId || ''
          });
          
          customerIds.add(customerId);
        }
      } catch (error) {
        console.error(`Error getting customer ${customerId}:`, error);
      }
    }
    
    console.log(`Found ${customers.length} total customers for business ${businessId}`);
    return customers;
  } catch (error) {
    console.error('Error getting business customers:', error);
    return [];
  }
};

/**
 * Links a customer to a business
 * This is used when a customer joins a loyalty program
 */
export const linkCustomerToBusiness = async (
  customerId: string,
  businessId: string,
  programId: string
): Promise<boolean> => {
  try {
    console.log(`Linking customer ${customerId} to business ${businessId} with program ${programId}`);
    
    // Create a unique ID for the customer program
    const customerProgramId = `${customerId}_${programId}`;
    
    // Get customer details
    const customerDoc = await getDoc(doc(db, 'customers', customerId));
    
    if (!customerDoc.exists()) {
      console.error(`Customer ${customerId} not found`);
      return false;
    }
    
    const customerData = customerDoc.data();
    
    // Get program details
    const programDoc = await getDoc(doc(db, 'loyaltyPrograms', programId));
    
    if (!programDoc.exists()) {
      console.error(`Program ${programId} not found`);
      return false;
    }
    
    const programData = programDoc.data();
    
    // Get business details
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    
    if (!businessDoc.exists()) {
      console.error(`Business ${businessId} not found`);
      return false;
    }
    
    const businessData = businessDoc.data();
    
    // Create customer program record
    await setDoc(doc(db, 'customerPrograms', customerProgramId), {
      customerId,
      businessId,
      programId,
      customerName: `${customerData.firstName} ${customerData.lastName}`,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      programName: programData.name,
      programType: programData.type,
      businessName: businessData.businessName,
      currentPoints: 0,
      currentVisits: 0,
      totalSpent: 0,
      enrolledAt: Timestamp.now(),
      isActive: true
    });
    
    // Update customer record with business ID if not already set
    if (!customerData.businessId) {
      await updateDoc(doc(db, 'customers', customerId), {
        businessId
      });
    }
    
    // Update business record with customer ID
    await updateDoc(doc(db, 'businesses', businessId), {
      customerIds: arrayUnion(customerId)
    });
    
    console.log(`Successfully linked customer ${customerId} to business ${businessId}`);
    return true;
  } catch (error) {
    console.error('Error linking customer to business:', error);
    return false;
  }
};

/**
 * Gets loyalty programs a customer is enrolled in
 */
export const getCustomerLoyaltyPrograms = async (customerId: string): Promise<any[]> => {
  try {
    console.log(`Getting loyalty programs for customer ${customerId}`);
    
    const programsRef = collection(db, 'customerPrograms');
    const programsQuery = query(
      programsRef,
      where('customerId', '==', customerId),
      where('isActive', '==', true)
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    
    const programs: any[] = [];
    
    programsSnapshot.forEach(programDoc => {
      const programData = programDoc.data();
      
      programs.push({
        id: programDoc.id,
        programId: programData.programId,
        businessId: programData.businessId,
        programName: programData.programName,
        programType: programData.programType,
        businessName: programData.businessName,
        currentPoints: programData.currentPoints || 0,
        currentVisits: programData.currentVisits || 0,
        totalSpent: programData.totalSpent || 0,
        enrolledAt: programData.enrolledAt,
        lastVisit: programData.lastVisit
      });
    });
    
    return programs;
  } catch (error) {
    console.error('Error getting customer loyalty programs:', error);
    return [];
  }
};

/**
 * Records a visit for a customer
 */
export const recordCustomerVisit = async (
  customerId: string,
  businessId: string,
  programId: string,
  amount: number = 0,
  notes: string = ''
): Promise<boolean> => {
  try {
    console.log(`Recording visit for customer ${customerId} at business ${businessId}`);
    
    // Create a unique ID for the customer program
    const customerProgramId = `${customerId}_${programId}`;
    
    // Get customer program
    const programDoc = await getDoc(doc(db, 'customerPrograms', customerProgramId));
    
    if (!programDoc.exists()) {
      console.error(`Customer program ${customerProgramId} not found`);
      return false;
    }
    
    const programData = programDoc.data();
    
    // Update customer program
    await updateDoc(doc(db, 'customerPrograms', customerProgramId), {
      currentVisits: (programData.currentVisits || 0) + 1,
      totalSpent: (programData.totalSpent || 0) + amount,
      lastVisit: Timestamp.now()
    });
    
    // Update customer record
    await updateDoc(doc(db, 'customers', customerId), {
      totalVisits: (programData.totalVisits || 0) + 1,
      totalSpent: (programData.totalSpent || 0) + amount,
      lastVisit: Timestamp.now()
    });
    
    // Create visit record
    const visitId = `${customerId}_${businessId}_${Date.now()}`;
    await setDoc(doc(db, 'visits', visitId), {
      customerId,
      businessId,
      programId,
      amount,
      notes,
      timestamp: Timestamp.now()
    });
    
    console.log(`Successfully recorded visit for customer ${customerId}`);
    return true;
  } catch (error) {
    console.error('Error recording customer visit:', error);
    return false;
  }
};