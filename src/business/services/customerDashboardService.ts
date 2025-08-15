import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
   * Get customer statistics for a business
   */
  /**
   * Get aggregate customer stats for a business
   */
  async getCustomerStats(businessId: string): Promise<CustomerStats> {
    try {
      const customerProgramsRef = collection(db, 'customerPrograms');
      const qPrograms = query(
        customerProgramsRef,
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(qPrograms);

      const customerAggregates = new Map<string, { visits: number; spent: number; joined: Date; lastVisit?: Date; name: string; email: string; phone: string }>();
      let totalVisits = 0;
      let totalRevenue = 0;
      let newThisMonth = 0;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const customerId: string = data.customerId;
        const visits: number = data.currentVisits || 0;
        const spent: number = data.totalSpent || 0;
        const enrolledAt: Date = data.enrolledAt?.toDate ? data.enrolledAt.toDate() : new Date(data.enrolledAt);
        const lastVisit: Date | undefined = data.lastVisit?.toDate ? data.lastVisit.toDate() : undefined;
        const name: string = data.customerName || 'Unknown Customer';
        const email: string = data.customerEmail || '';
        const phone: string = data.customerPhone || '';

        totalVisits += visits;
        totalRevenue += spent;
        if (enrolledAt >= startOfMonth) newThisMonth += 1;

        const agg = customerAggregates.get(customerId) || { visits: 0, spent: 0, joined: enrolledAt, lastVisit: undefined, name, email, phone };
        agg.visits += visits;
        agg.spent += spent;
        if (!agg.joined || enrolledAt < agg.joined) agg.joined = enrolledAt;
        if (lastVisit && (!agg.lastVisit || lastVisit > agg.lastVisit)) agg.lastVisit = lastVisit;
        agg.name = name;
        agg.email = email;
        agg.phone = phone;
        customerAggregates.set(customerId, agg);
      });

      const totalCustomers = customerAggregates.size;
      const activeCustomers = totalCustomers; // with isActive filter, all counted are active
      const averageSpendPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Build top customers list
      const topCustomers: BusinessCustomerSummary[] = Array.from(customerAggregates.entries())
        .map(([id, agg]) => ({
          id,
          name: agg.name,
          email: agg.email,
          phone: agg.phone,
          totalVisits: agg.visits,
          totalSpent: agg.spent,
          lastVisit: agg.lastVisit,
          enrolledPrograms: [],
          joinedDate: agg.joined,
          isActive: true,
          lifetimeValue: agg.spent,
          visitFrequency: this.calculateVisitFrequency(agg.visits)
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      return {
        totalCustomers,
        activeCustomers,
        newThisMonth,
        totalVisits,
        totalRevenue,
        averageSpendPerCustomer,
        topCustomers
      };
    } catch (error) {
      console.error('Error computing customer stats:', error);
      // Return safe defaults
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        newThisMonth: 0,
        totalVisits: 0,
        totalRevenue: 0,
        averageSpendPerCustomer: 0,
        topCustomers: []
      };
    }
  }

  /**
   * Calculate visit frequency based on total visits
   */
  calculateVisitFrequency(totalVisits: number): 'new' | 'occasional' | 'regular' | 'vip' {
    if (totalVisits === 0) return 'new';
    if (totalVisits < 5) return 'occasional';
    if (totalVisits < 20) return 'regular';
    return 'vip';
  }
}

export const customerDashboardService = new CustomerDashboardService();