import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../hooks/useAuth';
import CustomerListItem from './CustomerListItem';
import CustomerSearchBar from './CustomerSearchBar';

interface Customer {
  id: string;
  name: string;
  email: string;
  visits: number;
  lastVisit: string;
  avatar: string | null;
}

interface CustomerListProps {
  onSelect: (customerId: string) => void;
  selectedIds: string[];
  onAddNew: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onSelect, selectedIds, onAddNew }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        
        const customersRef = collection(db, 'customers');
        const q = query(
          customersRef,
          where('businessId', '==', user.businessId),
          limit(20)
  );
        
        const querySnapshot = await getDocs(q);
        const fetchedCustomers: Customer[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Format the last visit date
          let lastVisit = 'Never';
          if (data.lastVisitDate) {
            const lastVisitDate = data.lastVisitDate.toDate ? 
              data.lastVisitDate.toDate() : 
              new Date(data.lastVisitDate);
            
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
              lastVisit = 'Today';
            } else if (diffDays === 1) {
              lastVisit = 'Yesterday';
            } else if (diffDays < 7) {
              lastVisit = `${diffDays} days ago`;
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7);
              lastVisit = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
              const months = Math.floor(diffDays / 30);
              lastVisit = `${months} ${months === 1 ? 'month' : 'months'} ago`;
            }
          }
          
          fetchedCustomers.push({
            id: doc.id,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            email: data.email || '',
            visits: data.totalVisits || 0,
            lastVisit,
            avatar: data.photoURL || null
          });
        });
        
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
};

    fetchCustomers();
  }, [user?.businessId]);
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <CustomerSearchBar onSearch={handleSearch} />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {selectedIds.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-600 font-medium"
              >
                {selectedIds.length} customer{selectedIds.length !== 1 ? 's' : ''} selected
              </motion.span>
            )}
          </div>
          
          <motion.button
            onClick={onAddNew}
            className="text-sm text-rose-600 font-medium flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Welcome a New Friend
          </motion.button>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex p-3 rounded-lg">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence>
              {filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <CustomerListItem
                    customer={customer}
                    isSelected={selectedIds.includes(customer.id)}
                    onSelect={() => onSelect(customer.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-gray-500">No customers found</p>
            <button 
              onClick={onAddNew}
              className="mt-3 text-amber-600 font-medium hover:text-amber-700"
            >
              Add a new customer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;