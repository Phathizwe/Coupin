import React, { useState, useEffect } from 'react';
import { Customer, LoyaltyProgram } from '../../types';
import { updateCustomerLoyaltyPoints } from '../../services/loyalty/customerLoyaltyService';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

interface LoyaltyScanModalProps {
  program: LoyaltyProgram;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal component for scanning loyalty QR codes and recording visits
 */
const LoyaltyScanModal: React.FC<LoyaltyScanModalProps> = ({
  program,
  onClose,
  onSuccess
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');
  const [customerId, setCustomerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Find customer by ID or phone number
  const findCustomer = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      if (customerId) {
        // Try to find by direct ID
        const customerRef = doc(db, 'customers', customerId);
        const customerDoc = await getDoc(customerRef);
        
        if (customerDoc.exists() && customerDoc.data().businessId === program.businessId) {
          setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
        } else {
          setErrorMessage('Customer not found or not associated with this business');
        }
      } else if (phoneNumber) {
        // Try to find by phone number
        const customersRef = collection(db, 'customers');
        const q = query(
          customersRef, 
          where('businessId', '==', program.businessId),
          where('phone', '==', phoneNumber)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const customerDoc = snapshot.docs[0];
          setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);
        } else {
          setErrorMessage('No customer found with this phone number');
        }
      } else {
        setErrorMessage('Please enter a customer ID or phone number');
      }
    } catch (error) {
      console.error('Error finding customer:', error);
      setErrorMessage('An error occurred while searching for the customer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Record a visit for the customer
  const recordVisit = async () => {
    if (!customer) return;
    
    setIsProcessing(true);
    
    try {
      const customerRef = doc(db, 'customers', customer.id);
      
      // Update total visits
      const totalVisits = (customer.totalVisits || 0) + 1;
      
      // For visit-based programs, we need to track visits
      if (program.type === 'visits') {
        await updateDoc(customerRef, {
          totalVisits,
          lastVisit: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        // Check if they've reached the reward threshold
        if (totalVisits % (program.visitsRequired || 10) === 0) {
          toast.success(`${customer.firstName} has earned a reward!`);
        } else {
          toast.success(`Visit recorded for ${customer.firstName}!`);
        }
      } 
      // For points-based programs, we add points
      else if (program.type === 'points') {
        // Add one point for the visit
        await updateCustomerLoyaltyPoints(customer.id, 1);
        
        await updateDoc(customerRef, {
          totalVisits,
          lastVisit: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        toast.success(`Visit recorded and 1 point added for ${customer.firstName}!`);
      }
      // For tiered programs, we also add points
      else if (program.type === 'tiered') {
        // Add one point for the visit
        await updateCustomerLoyaltyPoints(customer.id, 1);
        
        await updateDoc(customerRef, {
          totalVisits,
          lastVisit: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        toast.success(`Visit recorded and 1 point added for ${customer.firstName}!`);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error recording visit:', error);
      toast.error('Failed to record visit');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Record Customer Visit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setScanMode('manual')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                scanMode === 'manual' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setScanMode('camera')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                scanMode === 'camera' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Scan QR
            </button>
          </div>
          
          {scanMode === 'manual' ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID (if known)
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter customer ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <button
                onClick={findCustomer}
                disabled={isProcessing || (!customerId && !phoneNumber)}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isProcessing || (!customerId && !phoneNumber)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Searching...' : 'Find Customer'}
              </button>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Camera access is required to scan QR codes.
                <br />
                Position the QR code in the center of the camera view.
              </p>
              <p className="text-sm text-gray-500">
                Note: This is a placeholder. In a real implementation, this would use the device camera to scan QR codes.
              </p>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          {customer && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800">Customer Found</h3>
              <p className="text-green-700">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-sm text-green-600">
                Visits: {customer.totalVisits || 0}
                {program.type === 'points' && ` | Points: ${customer.loyaltyPoints || 0}`}
              </p>
              
              <button
                onClick={recordVisit}
                disabled={isProcessing}
                className={`mt-3 w-full py-2 px-4 rounded-lg font-medium ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Record Visit'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyScanModal;