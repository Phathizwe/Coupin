import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
      const totalVisits = loyaltyPrograms.reduce((sum, program) => sum + program.currentVisits, 0);
      const totalSpent = programsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalSpent || 0), 0);

      const customer: BusinessCustomer = {
        id: customerId,
        name: firstProgram.customerName,
        email: firstProgram.customerEmail,
        phone: firstProgram.customerPhone,
        businessId,
        totalVisits,
        totalSpent,
        lastVisit: firstProgram.lastVisit?.toDate(),
        loyaltyPrograms,
        isActive: true
      };

      return customer;
    } catch (error) {
      console.error('Customer lookup error:', error);
      throw new Error('Failed to find customer');
    }
  }

  /**
   * Get all customers for a business
   */
  async getBusinessCustomers(businessId: string): Promise<BusinessCustomer[]> {
    try {
      const customerProgramsRef = collection(db, 'customerPrograms');
      const businessQuery = query(
        customerProgramsRef,
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(businessQuery);
      const customerMap = new Map<string, BusinessCustomer>();

      // Group programs by customer
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const customerId = data.customerId;

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
            businessId,
            totalVisits: 0,
            totalSpent: 0,
            lastVisit: data.lastVisit?.toDate(),
            loyaltyPrograms: [],
            isActive: true
          });
        }

        const customer = customerMap.get(customerId)!;
        customer.loyaltyPrograms.push({
          programId: data.programId,
          programName: data.programName,
          currentPoints: data.currentPoints || 0,
          currentVisits: data.currentVisits || 0,
          enrolledAt: data.enrolledAt.toDate()
        });
        customer.totalVisits += data.currentVisits || 0;
        customer.totalSpent += data.totalSpent || 0;
      });

      return Array.from(customerMap.values());
    } catch (error) {
      console.error('Error fetching business customers:', error);
      return [];
    }
  }
}

export const customerLookupService = new CustomerLookupService();