import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Get loyal customers count (customers with more than 1 visit)
export const getLoyalCustomersCount = async (businessId: string): Promise<number> => {
  try {
    const customersRef = collection(db, 'customers');
    const loyalCustomersQuery = query(
      customersRef,
      where('businessId', '==', businessId),
      where('totalVisits', '>', 1)
    );
    const loyalCustomersSnapshot = await getCountFromServer(loyalCustomersQuery);
    return loyalCustomersSnapshot.data().count;
  } catch (error) {
    console.error('Error getting loyal customers count:', error);
    return 0;
  }
};

// Get customer data including total revenue and customer count
export const getCustomerData = async (businessId: string): Promise<{
  totalCustomers: number;
  revenueGenerated: number;
}> => {
  try {
    const customersRef = collection(db, 'customers');
    const customersDataQuery = query(customersRef, where('businessId', '==', businessId));
    const customersDataSnapshot = await getDocs(customersDataQuery);
    
    let revenueGenerated = 0;
    let totalCustomers = 0;
    
    customersDataSnapshot.forEach(doc => {
      const customerData = doc.data();
      revenueGenerated += customerData.totalSpent || 0;
      totalCustomers++;
    });
    
    return { totalCustomers, revenueGenerated };
  } catch (error) {
    console.error('Error getting customer data:', error);
    return { totalCustomers: 0, revenueGenerated: 0 };
  }
};