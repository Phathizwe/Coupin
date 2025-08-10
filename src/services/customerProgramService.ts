import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Define the CustomerProgram interface
export interface CustomerProgram {
  id: string;
  customerId: string;
  businessId: string;
  programId: string;
  enrollmentDate: Date;
  status: 'active' | 'paused' | 'completed';
  progress: {
    visits: number;
    points: number;
    lastVisit?: Date;
  };
  preferences: {
    notifications: boolean;
    communications: boolean;
  };
}

// Enroll a customer in a loyalty program
export const enrollCustomerInProgram = async (
  customerId: string,
  businessId: string,
  programId: string
): Promise<CustomerProgram> => {
  try {
    // Check if the customer is already enrolled in this program
    const existingEnrollment = await getCustomerProgramEnrollment(customerId, programId);
    
    if (existingEnrollment) {
      // If enrollment exists but is not active, reactivate it
      if (existingEnrollment.status !== 'active') {
        await updateCustomerProgramStatus(existingEnrollment.id, 'active');
        return {
          ...existingEnrollment,
          status: 'active'
        };
      }
      
      // Return the existing enrollment if it's already active
      return existingEnrollment;
    }
    
    // Create a new enrollment
    const enrollmentRef = doc(collection(db, 'customerPrograms'));
    const enrollmentId = enrollmentRef.id;
    
    const enrollment: CustomerProgram = {
      id: enrollmentId,
      customerId,
      businessId,
      programId,
      enrollmentDate: new Date(),
      status: 'active',
      progress: {
        visits: 0,
        points: 0
      },
      preferences: {
        notifications: true,
        communications: true
      }
    };
    
    await setDoc(enrollmentRef, enrollment);
    
    return enrollment;
  } catch (error) {
    console.error('Error enrolling customer in program:', error);
    throw error;
  }
};

// Get all programs a customer is enrolled in
export const getCustomerPrograms = async (customerId: string): Promise<CustomerProgram[]> => {
  try {
    const programsRef = collection(db, 'customerPrograms');
    const q = query(
      programsRef,
      where('customerId', '==', customerId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as CustomerProgram[];
  } catch (error) {
    console.error('Error getting customer programs:', error);
    throw error;
  }
};

// Get all customers enrolled in a specific program
export const getProgramCustomers = async (programId: string): Promise<CustomerProgram[]> => {
  try {
    const programsRef = collection(db, 'customerPrograms');
    const q = query(
      programsRef,
      where('programId', '==', programId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as CustomerProgram[];
  } catch (error) {
    console.error('Error getting program customers:', error);
    throw error;
  }
};

// Get a specific customer's enrollment in a program
export const getCustomerProgramEnrollment = async (
  customerId: string,
  programId: string
): Promise<CustomerProgram | null> => {
  try {
    const programsRef = collection(db, 'customerPrograms');
    const q = query(
      programsRef,
      where('customerId', '==', customerId),
      where('programId', '==', programId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      ...snapshot.docs[0].data(),
      id: snapshot.docs[0].id
    } as CustomerProgram;
  } catch (error) {
    console.error('Error getting customer program enrollment:', error);
    throw error;
  }
};

// Update a customer's program status
export const updateCustomerProgramStatus = async (
  enrollmentId: string,
  status: 'active' | 'paused' | 'completed'
): Promise<boolean> => {
  try {
    const enrollmentRef = doc(db, 'customerPrograms', enrollmentId);
    
    await updateDoc(enrollmentRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating customer program status:', error);
    throw error;
  }
};

// Record a visit for a customer in a program
export const recordProgramVisit = async (
  enrollmentId: string,
  pointsToAdd: number = 1
): Promise<boolean> => {
  try {
    const enrollmentRef = doc(db, 'customerPrograms', enrollmentId);
    const enrollmentDoc = await getDoc(enrollmentRef);
    
    if (!enrollmentDoc.exists()) {
      throw new Error('Enrollment not found');
    }
    
    const enrollment = enrollmentDoc.data() as CustomerProgram;
    
    // Update the progress
    const updatedProgress = {
      visits: (enrollment.progress.visits || 0) + 1,
      points: (enrollment.progress.points || 0) + pointsToAdd,
      lastVisit: new Date()
    };
    
    await updateDoc(enrollmentRef, {
      'progress': updatedProgress,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error recording program visit:', error);
    throw error;
  }
};

// Get all programs for a business with enrolled customer count
export const getBusinessProgramsWithEnrollmentCount = async (businessId: string) => {
  try {
    // First get all loyalty programs for this business
    const programsRef = collection(db, 'loyaltyPrograms');
    const programsQuery = query(
      programsRef,
      where('businessId', '==', businessId)
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    
    // Get enrollment counts for each program
    const programsWithCounts = await Promise.all(
      programsSnapshot.docs.map(async (programDoc) => {
        const programId = programDoc.id;
        const programData = programDoc.data();
        
        // Count enrollments for this program
        const enrollmentsRef = collection(db, 'customerPrograms');
        const enrollmentsQuery = query(
          enrollmentsRef,
          where('programId', '==', programId),
          where('status', '==', 'active')
        );
        
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        return {
          id: programId,
          ...programData,
          enrollmentCount: enrollmentsSnapshot.size
        };
      })
    );
    
    return programsWithCounts;
  } catch (error) {
    console.error('Error getting business programs with enrollment count:', error);
    throw error;
  }
};