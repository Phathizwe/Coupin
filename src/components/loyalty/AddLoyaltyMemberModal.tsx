import React, { useState, useEffect } from 'react';
import { doc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Customer } from '../../types';

interface AddLoyaltyMemberModalProps {
  businessId: string;
  programId: string;
  onClose: () => void;
  onMemberAdded: () => void;
}

const AddLoyaltyMemberModal: React.FC<AddLoyaltyMemberModalProps> = ({
  businessId,
  programId,
  onClose,
  onMemberAdded
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [addingMembers, setAddingMembers] = useState(false);

  // Fetch customers for this business
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!businessId) return;
      
      try {
        setLoading(true);
        const customersRef = collection(db, 'customers');
        const q = query(
          customersRef,
          where('businessId', '==', businessId)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setCustomers([]);
          setFilteredCustomers([]);
          return;
        }
        
        const customersList: Customer[] = [];
        snapshot.forEach(doc => {
          const customer = { id: doc.id, ...doc.data() } as Customer;
          customersList.push(customer);
        });
        
        setCustomers(customersList);
        setFilteredCustomers(customersList);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [businessId]);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || 
             (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (customer.phone && customer.phone.includes(searchTerm));
    });
    
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // Toggle customer selection
  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  // Add selected customers to loyalty program
  const addMembersToProgram = async () => {
    if (selectedCustomers.length === 0) return;
    
    try {
      setAddingMembers(true);
      
      // Update each selected customer
      for (const customerId of selectedCustomers) {
        const customerRef = doc(db, 'customers', customerId);
        
        // Initialize loyalty fields if they don't exist
        await updateDoc(customerRef, {
          loyaltyProgramId: programId,
          loyaltyPoints: increment(0), // This will create the field if it doesn't exist
          totalVisits: increment(0),   // This will create the field if it doesn't exist
          lastLoyaltyActivity: new Date()
        });
      }
      
      onMemberAdded();
      onClose();
    } catch (error) {
      console.error('Error adding members to loyalty program:', error);
    } finally {
      setAddingMembers(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Members to Loyalty Program</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers by name, email or phone..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="w-5 h-5 text-gray-400 absolute left-3 top-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No customers found. Try a different search term or add new customers first.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers(filteredCustomers.map(c => c.id));
                          } else {
                            setSelectedCustomers([]);
                          }
                        }}
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleCustomerSelection(customer.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleCustomerSelection(customer.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium">
                              {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">
                            {customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.loyaltyProgramId ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Already in program
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not enrolled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedCustomers.length} customers selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addMembersToProgram}
              disabled={selectedCustomers.length === 0 || addingMembers}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {addingMembers ? 'Adding...' : 'Add Selected Members'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLoyaltyMemberModal;