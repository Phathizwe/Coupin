import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface BusinessCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: Date;
  enrolledPrograms: CustomerProgramSummary[];
  joinedDate: Date;
  isActive: boolean;
  lifetimeValue: number;
  visitFrequency: 'new' | 'occasional' | 'regular' | 'vip';
}

export interface CustomerProgramSummary {
  programId: string;
  programName: string;
  programType: 'points' | 'visits' | 'cashback';
  currentPoints: number;
  currentVisits: number;
  totalSpent: number;
  enrolledAt: Date;
  lastActivity?: Date;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  totalVisits: number;
  totalRevenue: number;
  averageSpendPerCustomer: number;
  topCustomers: BusinessCustomerSummary[];
}

export class CustomerDashboardService {
  /**
   * Get all customers for a business with their loyalty program data
   */
  async getBusinessCustomers(businessId: string): Promise<BusinessCustomerSummary[]> {
    try {
      // Query customerPrograms collection for this business
      const customerProgramsRef = collection(db, 'customerPrograms');
      const businessQuery = query(
        customerProgramsRef,
        where('businessId', '==', businessId),
        where('isActive', '==', true),
        orderBy('enrolledAt', 'desc')
      );
      const snapshot = await getDocs(businessQuery);
      if (snapshot.empty) {
        console.log('No customer programs found for business:', businessId);
        return [];
      }

      // Group programs by customer
      const customerMap = new Map<string, BusinessCustomerSummary>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const customerId = data.customerId;
        if (!customerMap.has(customerId)) {
          // Create new customer summary
          customerMap.set(customerId, {
            id: customerId,
            name: data.customerName || 'Unknown Customer',
            email: data.customerEmail || '',
            phone: data.customerPhone || '',
            totalVisits: 0,
            totalSpent: 0,
            lastVisit: data.lastVisit?.toDate(),
            enrolledPrograms: [],
            joinedDate: data.enrolledAt.toDate(),
            isActive: true,
            lifetimeValue: 0,
            visitFrequency: 'new'
          });
        }

        const customer = customerMap.get(customerId)!;
        // Add program to customer
        const programSummary: CustomerProgramSummary = {
          programId: data.programId,
          programName: data.programName,
          programType: data.programType,
          currentPoints: data.currentPoints || 0,
          currentVisits: data.currentVisits || 0,
          totalSpent: data.totalSpent || 0,
          enrolledAt: data.enrolledAt.toDate(),
          lastActivity: data.lastVisit?.toDate()
        };
        customer.enrolledPrograms.push(programSummary);

        // Aggregate customer totals
        customer.totalVisits += programSummary.currentVisits;
        customer.totalSpent += programSummary.totalSpent;
        customer.lifetimeValue += programSummary.totalSpent;

        // Update last visit if this program has a more recent visit
        if (programSummary.lastActivity && 
            (!customer.lastVisit || programSummary.lastActivity > customer.lastVisit)) {
          customer.lastVisit = programSummary.lastActivity;
        }
      });

      // Calculate visit frequency for each customer
      const customers = Array.from(customerMap.values());
      customers.forEach(customer => {
        customer.visitFrequency = this.calculateVisitFrequency(customer.totalVisits);
      });

      // Sort by lifetime value (highest first)
      customers.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
      console.log(`Found ${customers.length} customers for business ${businessId}`);
      return customers;
    } catch (error) {
      console.error('Error fetching business customers:', error);
      throw new Error('Failed to load customer data');
    }
  }

  /**
   * Get customer statistics for business dashboard
   */
  async getCustomerStats(businessId: string): Promise<CustomerStats> {
    try {
      const customers = await this.getBusinessCustomers(businessId);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: CustomerStats = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.isActive).length,
        newThisMonth: customers.filter(c => c.joinedDate >= thisMonth).length,
        totalVisits: customers.reduce((sum, c) => sum + c.totalVisits, 0),
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        averageSpendPerCustomer: 0,
        topCustomers: customers.slice(0, 5) // Top 5 customers by lifetime value
      };

      stats.averageSpendPerCustomer = stats.totalCustomers > 0 
        ? stats.totalRevenue / stats.totalCustomers 
        : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating customer stats:', error);
      throw new Error('Failed to calculate customer statistics');
    }
  }

  /**
   * Search customers by name, email, or phone
   */
  async searchCustomers(businessId: string, searchTerm: string): Promise<BusinessCustomerSummary[]> {
    try {
      const allCustomers = await this.getBusinessCustomers(businessId);
      const searchLower = searchTerm.toLowerCase().trim();
      
      return allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchTerm.replace(/\s+/g, ''))
      );
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error('Failed to search customers');
    }
  }

  private calculateVisitFrequency(totalVisits: number): 'new' | 'occasional' | 'regular' | 'vip' {
    if (totalVisits === 0) return 'new';
    if (totalVisits <= 3) return 'occasional';
    if (totalVisits <= 10) return 'regular';
    return 'vip';
  }
}

export const customerDashboardService = new CustomerDashboardService();