import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Customer } from '../types';

interface CustomerContextType {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  addCustomer: (customerData: { firstName: string; lastName: string; phone: string }) => Promise<Customer>;
  refreshCustomers: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    // Use the same business ID logic as addCustomer
    let businessId = user?.businessId || user?.currentBusinessId;

    // If no business ID but user has business role, use their user ID as business ID
    if (!businessId && user?.role === 'business' && user?.uid) {
      businessId = user.uid;
      console.log('Using user ID as business ID for fetching customers:', businessId);
    }

    if (!businessId) {
      console.log('[CustomerContext] No business ID found - user:', {
        uid: user?.uid,
        role: user?.role,
        businessId: user?.businessId,
        currentBusinessId: user?.currentBusinessId
      });
      return;
    }

    console.log('[CustomerContext] Fetching customers with business ID:', businessId);

    setIsLoading(true);
    setError(null);

    try {
      const customersRef = collection(db, 'customers');

      // Remove the orderBy clause that's causing problems
      // Instead, just query by businessId
      const q = query(
        customersRef,
        where('businessId', '==', businessId)
      );

      const snapshot = await getDocs(q);
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];

      // Sort the customers client-side instead
      // This way we can handle null/undefined lastVisit values
      const sortedCustomers = [...customerData].sort((a, b) => {
        // If both have lastVisit, compare them
        if (a.lastVisit && b.lastVisit) {
          return b.lastVisit.seconds - a.lastVisit.seconds;
        }
        // If only a has lastVisit, a comes first
        if (a.lastVisit && !b.lastVisit) {
          return -1;
        }
        // If only b has lastVisit, b comes first
        if (!a.lastVisit && b.lastVisit) {
          return 1;
        }
        // If neither has lastVisit, sort by joinDate or name
        if (a.joinDate && b.joinDate) {
          return b.joinDate.seconds - a.joinDate.seconds;
        }
        // Fallback to alphabetical by first name
        return a.firstName.localeCompare(b.firstName);
      });

      setCustomers(sortedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomer = async (customerData: { firstName: string; lastName: string; phone: string }): Promise<Customer> => {
    // Try to get business ID from multiple sources
    let businessId = user?.businessId || user?.currentBusinessId;

    // If no business ID but user has business role, use their user ID as business ID
    // This is a temporary solution for users who have business access but no business profile
    if (!businessId && user?.role === 'business' && user?.uid) {
      businessId = user.uid;
      console.log('Using user ID as business ID for user with business role:', businessId);
    }

    if (!businessId) {
      throw new Error('User business ID not found. Please ensure you are logged in with a business account.');
    }

    try {
      const newCustomerData = {
        businessId: businessId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        joinDate: Timestamp.now(),
        lastVisit: Timestamp.now(),
        totalVisits: 1,
        totalSpent: 0
      };

      const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
      const newCustomer = { id: docRef.id, ...newCustomerData } as Customer;

      // Update local state with the new customer
      setCustomers(prev => [newCustomer, ...prev]);

      return newCustomer;
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const refreshCustomers = async () => {
    await fetchCustomers();
  };

  // Initial fetch
  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, [user?.businessId, user?.currentBusinessId, user?.role, user?.uid]);

  return (
    <CustomerContext.Provider value={{ customers, isLoading, error, addCustomer, refreshCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};