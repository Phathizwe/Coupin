import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer } from '../types';

// Interface for customer analytics data
export interface CustomerAnalytics {
  customerGrowth: {
    percentage: number;
    comparedTo: string;
  };
  customerRetention: {
    percentage: number;
    description: string;
  };
  averageSpend: {
    amount: number;
    description: string;
  };
}

// Get customer analytics for a business
export const getCustomerAnalytics = async (businessId: string): Promise<CustomerAnalytics> => {
  try {
    if (!businessId) {
      throw new Error('Business ID is required');
    }

    // Get current date and date one month ago for comparison
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    
    // Convert to Firestore timestamps
    const nowTimestamp = Timestamp.fromDate(now);
    const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo);
    const twoMonthsAgoTimestamp = Timestamp.fromDate(twoMonthsAgo);
    
    // 1. Calculate customer growth
    // Query for customers joined in the last month
    const lastMonthQuery = query(
      collection(db, 'customers'),
      where('businessId', '==', businessId),
      where('joinDate', '>=', oneMonthAgoTimestamp),
      where('joinDate', '<=', nowTimestamp)
    );
    
    // Query for customers joined in the month before that
    const previousMonthQuery = query(
      collection(db, 'customers'),
      where('businessId', '==', businessId),
      where('joinDate', '>=', twoMonthsAgoTimestamp),
      where('joinDate', '<', oneMonthAgoTimestamp)
    );
    
    // Get all customers for this business
    const allCustomersQuery = query(
      collection(db, 'customers'),
      where('businessId', '==', businessId)
    );
    
    // Execute all queries in parallel for better performance
    const [lastMonthSnapshot, previousMonthSnapshot, allCustomersSnapshot] = 
      await Promise.all([
        getDocs(lastMonthQuery),
        getDocs(previousMonthQuery),
        getDocs(allCustomersQuery)
      ]);
    
    // Process customer growth data
    const lastMonthCustomers = lastMonthSnapshot.size;
    const previousMonthCustomers = previousMonthSnapshot.size;
    
    // Calculate growth percentage with proper handling for edge cases
    let growthPercentage = 0;
    if (previousMonthCustomers > 0) {
      growthPercentage = ((lastMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100;
    } else if (lastMonthCustomers > 0) {
      growthPercentage = 100; // If there were no customers before, growth is 100%
    }
    
    // Extract all customer data
    const allCustomers: Customer[] = [];
    allCustomersSnapshot.forEach(doc => {
      const data = doc.data() as Omit<Customer, 'id'>;
      allCustomers.push({
        ...data,
        id: doc.id
      });
    });
    
    // 2. Calculate customer retention
    // A customer is considered "returning" if they have more than one visit
    const returningCustomers = allCustomers.filter(customer => 
      customer.totalVisits && customer.totalVisits > 1
    ).length;
    
    const retentionPercentage = allCustomers.length > 0 
      ? (returningCustomers / allCustomers.length) * 100 
      : 0;
    
    // 3. Calculate average spend
    // Sum up total spent across all customers
    const totalSpent = allCustomers.reduce((sum, customer) => 
      sum + (customer.totalSpent || 0), 0);
    
    const averageSpend = allCustomers.length > 0 
      ? totalSpent / allCustomers.length 
      : 0;
    
    // Return formatted analytics data
    return {
      customerGrowth: {
        percentage: parseFloat(growthPercentage.toFixed(1)),
        comparedTo: 'Compared to last month'
      },
      customerRetention: {
        percentage: parseFloat(retentionPercentage.toFixed(1)),
        description: 'Returning customers'
      },
      averageSpend: {
        amount: parseFloat(averageSpend.toFixed(2)),
        description: 'Per customer'
      }
    };
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    throw error;
  }
};