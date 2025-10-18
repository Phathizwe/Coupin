import React, { useState } from 'react';
import { Customer, LoyaltyProgram } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import { phoneUtils } from './phoneUtils';
import { customerSearchService } from './customerSearchService';

interface LoyaltyInviteMemberModalProps {
  program: LoyaltyProgram;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal component for inviting customers to join the loyalty program
 */
const LoyaltyInviteMemberModal: React.FC<LoyaltyInviteMemberModalProps> = ({
  program,
  onClose,
  onSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Search for customers
  const searchCustomers = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setErrorMessage('Please enter at least 2 characters to search');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setDebugInfo(null);
    
    try {
      const fetchedCustomers = await customerSearchService.searchCustomers(
        searchTerm, 
        program.businessId,
        setDebugInfo
      );
      
      setCustomers(fetchedCustomers);
      
      if (fetchedCustomers.length === 0) {
        setErrorMessage('No customers found matching your search');
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setErrorMessage('An error occurred while searching for customers');
      setDebugInfo({
        error: error instanceof Error ? error.message : String(error),
        searchTerm,
        businessId: program.businessId
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Invite customer to loyalty program
  const inviteMember = async () => {
    if (!selectedCustomer) {
      setErrorMessage('Please select a customer to invite');
      return;
    }

    // Check if customer is already in the program
    if (selectedCustomer.loyaltyProgramId === program.id) {
      setErrorMessage('This customer is already a member of your loyalty program');
      return;
    }

    setIsInviting(true);

    try {
      // Update the customer record to add them to the loyalty program
      const customerRef = doc(db, 'customers', selectedCustomer.id);
      
      // First get the latest customer data to ensure we have the most up-to-date info
      const customerSnapshot = await getDoc(customerRef);
      if (!customerSnapshot.exists()) {
        throw new Error('Customer record not found');
      }
      
      const customerData = customerSnapshot.data();
      
      // Check if this customer has a user account linked
      const userId = customerData.userId;
      
      // Update the customer with loyalty program info
      await updateDoc(customerRef, {
        loyaltyProgramId: program.id,
        loyaltyPoints: 0,
        lastLoyaltyActivity: Timestamp.now(),
        // Add program name for easier debugging
        loyaltyProgramName: program.name,
        // Add business info for easier querying
        loyaltyBusinessId: program.businessId
      });
      
      // If the customer has a linked user account, create a relationship record
      if (userId) {
        try {
          // Create a business relationship record for this customer
          const relationshipsRef = collection(db, 'businessRelationships');
          const relationshipQuery = query(
            relationshipsRef,
            where('customerId', '==', selectedCustomer.id),
            where('businessId', '==', program.businessId)
  );
          
          const relationshipSnapshot = await getDocs(relationshipQuery);
          
          if (relationshipSnapshot.empty) {
            // Create a new relationship record
            const newRelationshipRef = doc(collection(db, 'businessRelationships'));
            await updateDoc(newRelationshipRef, {
              businessId: program.businessId,
              customerId: selectedCustomer.id,
              userId: userId,
              relationshipType: 'loyalty',
              status: 'active',
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              programId: program.id
            });
          }
        } catch (relationshipError) {
          console.error('Error creating relationship record:', relationshipError);
          // Continue even if relationship creation fails
        }
      }

      toast.success(`${selectedCustomer.firstName} has been added to your loyalty program!`);
      onSuccess();
    } catch (error) {
      console.error('Error inviting member:', error);
      setErrorMessage('Failed to add member to loyalty program');
    } finally {
      setIsInviting(false);
    }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Invite Member to Loyalty Program</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Customer search section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Find Customer
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, email or phone"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={searchCustomers}
              disabled={isLoading || searchTerm.length < 2}
              className={`px-4 py-2 rounded-md font-medium ${
                isLoading || searchTerm.length < 2
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {/* Customer results */}
        {customers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select a Customer to Invite
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {customers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedCustomer?.id === customer.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-800">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.email || 'No email'} • {customer.phone || 'No phone'}
                    {customer.userId && <span className="ml-1 text-green-600">• Has account</span>}
                  </div>
                  {customer.loyaltyProgramId === program.id && (
                    <div className="mt-1 text-xs inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Already a member
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p>{errorMessage}</p>
            {debugInfo && (
              <div className="mt-2 text-xs border-t border-red-200 pt-2">
                <p className="font-semibold">Debug info:</p>
                {debugInfo.error && <p>Error: {debugInfo.error}</p>}
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={inviteMember}
            disabled={isInviting || !selectedCustomer || selectedCustomer.loyaltyProgramId === program.id}
            className={`px-4 py-2 rounded-md font-medium ${
              isInviting || !selectedCustomer || selectedCustomer.loyaltyProgramId === program.id
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isInviting ? 'Adding...' : 'Add to Program'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyInviteMemberModal;