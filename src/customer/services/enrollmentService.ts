import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
// Remove useAuth import as it's not needed in a service file

export interface CustomerProgram {
  id: string;
  customerId: string;
  businessId: string;
  programId: string;
  customerPhone: string;
  customerEmail: string;
  customerName: string;
  businessName: string;
  programName: string;
  programType: 'points' | 'visits' | 'cashback';
  currentPoints: number;
  currentVisits: number;
  totalSpent: number;
  enrolledAt: Date;
  lastVisit?: Date;
  isActive: boolean;
}

export class EnrollmentService {
  /**
   * Enroll customer in a loyalty program
   * Creates customer-business relationship
   */
  async enrollInProgram(
    customerId: string,
    customerData: { phone: string; email: string; name: string },
    businessId: string,
    programId: string
  ): Promise<CustomerProgram> {
    try {
      // Get business and program details
      const [businessDoc, programDoc] = await Promise.all([
        getDoc(doc(db, 'businesses', businessId)),
        getDoc(doc(db, 'loyaltyPrograms', programId))
      ]);
      if (!businessDoc.exists() || !programDoc.exists()) {
        throw new Error('Business or program not found');
      }
      const businessData = businessDoc.data();
      const programData = programDoc.data();

      // Create customer program relationship
      const customerProgramId = `${customerId}_${programId}`;
      const customerProgram: CustomerProgram = {
        id: customerProgramId,
        customerId,
        businessId,
        programId,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        customerName: customerData.name,
        businessName: businessData.businessName || businessData.fullName,
        programName: programData.name,
        programType: programData.type,
        currentPoints: 0,
        currentVisits: 0,
        totalSpent: 0,
        enrolledAt: new Date(),
        isActive: true
      };

      // Save to customerPrograms collection
      await setDoc(doc(db, 'customerPrograms', customerProgramId), customerProgram);

      // Also create customer record in business's customer collection for lookup
      await this.createBusinessCustomerRecord(businessId, customerId, customerData);

      return customerProgram;
    } catch (error) {
      console.error('Enrollment error:', error);
      throw new Error('Failed to enroll in loyalty program');
    }
  }

  /**
   * Get all loyalty programs customer is enrolled in
   */
  async getCustomerPrograms(customerId: string): Promise<CustomerProgram[]> {
    try {
      const customerProgramsRef = collection(db, 'customerPrograms');
      const customerQuery = query(
        customerProgramsRef,
        where('customerId', '==', customerId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(customerQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        enrolledAt: doc.data().enrolledAt.toDate(),
        lastVisit: doc.data().lastVisit?.toDate()
      })) as CustomerProgram[];
    } catch (error) {
      console.error('Error fetching customer programs:', error);
      return [];
    }
  }

  private async createBusinessCustomerRecord(
    businessId: string,
    customerId: string,
    customerData: { phone: string; email: string; name: string }
  ): Promise<void> {
    try {
      const customerRecord = {
        id: customerId,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        businessId,
        addedAt: new Date(),
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: null,
        isActive: true
      };
      await setDoc(doc(db, 'customers', `${businessId}_${customerId}`), customerRecord);
    } catch (error) {
      console.error('Error creating business customer record:', error);
      // Don't throw - enrollment can succeed without this
    }
  }
}

export const enrollmentService = new EnrollmentService();