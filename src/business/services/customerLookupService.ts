import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface BusinessCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessId: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: Date;
  loyaltyPrograms: CustomerLoyaltyProgram[];
  isActive: boolean;
}

export interface CustomerLoyaltyProgram {
  programId: string;
  programName: string;
  currentPoints: number;
  currentVisits: number;
  enrolledAt: Date;
}

export class CustomerLookupService {
  /**
   * Find customers by phone number across all customer records
   */
  async findCustomerByPhone(businessId: string, phoneNumber: string): Promise<BusinessCustomer | null> {
    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, '').trim();
      // First, search in customerPrograms collection for this business
      const customerProgramsRef = collection(db, 'customerPrograms');
      const phoneQuery = query(
        customerProgramsRef,
        where('businessId', '==', businessId),
        where('customerPhone', '==', cleanPhone),
        where('isActive', '==', true)
      );
      const programsSnapshot = await getDocs(phoneQuery);
      if (programsSnapshot.empty) {
        return null;
      }

      // Get the first customer program to extract customer info
      const firstProgram = programsSnapshot.docs[0].data();
      const customerId = firstProgram.customerId;

      // Get all loyalty programs for this customer with this business
      const loyaltyPrograms: CustomerLoyaltyProgram[] = programsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          programId: data.programId,
          programName: data.programName,
          currentPoints: data.currentPoints || 0,
          currentVisits: data.currentVisits || 0,
          enrolledAt: data.enrolledAt.toDate()
        };
      });

      // Calculate totals across all programs
      const totalVisits = loyaltyPrograms.reduce((sum, p) => sum + p.currentVisits, 0);
      const totalSpent = programsSnapshot.docs.reduce((sum, d) => sum + (d.data().totalSpent || 0), 0);

      // Try to fetch customer profile for additional info
      let customerName = firstProgram.customerName || '';
      let email = firstProgram.customerEmail || '';
      const customerDoc = await getDoc(doc(db, 'customers', customerId));
      if (customerDoc.exists()) {
        const data = customerDoc.data();
        customerName = customerName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
        email = email || data.email || '';
      }

      return {
        id: customerId,
        name: customerName || 'Unknown Customer',
        email,
        phone: firstProgram.customerPhone,
        businessId,
        totalVisits,
        totalSpent,
        lastVisit: firstProgram.lastVisit?.toDate(),
        loyaltyPrograms,
        isActive: true
      };
    } catch (error) {
      console.error('Error looking up customer by phone:', error);
      return null;
    }
  }
}

export const customerLookupService = new CustomerLookupService();