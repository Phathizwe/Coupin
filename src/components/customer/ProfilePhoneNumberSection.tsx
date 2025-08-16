/**
 * Profile phone number section component
 * Allows users to update their phone number and link to existing customer records
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import usePhoneNumberHandling from '../../hooks/usePhoneNumberHandling';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';

interface ProfilePhoneNumberSectionProps {
  onLinkSuccess?: (customerId: string) => void;
}

const ProfilePhoneNumberSection: React.FC<ProfilePhoneNumberSectionProps> = ({ 
  onLinkSuccess 
}) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  const {
    phoneNumber,
    setPhoneNumber,
    isProcessing,
    status,
    message,
    linkedCustomerId,
    processPhoneNumber,
    resetStatus
  } = usePhoneNumberHandling({
    initialPhoneNumber: user?.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : '',
  });

  // Handle successful linking
  useEffect(() => {
    if (status === 'success' && linkedCustomerId) {
      onLinkSuccess?.(linkedCustomerId);
    }
  }, [status, linkedCustomerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processPhoneNumber();
    
    // Hide form after successful update
    if (status !== 'error') {
      setTimeout(() => setShowForm(false), 3000);
    }
  };

  const handleEditClick = () => {
    resetStatus();
    setShowForm(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
        
        {!showForm && (
          <button
            type="button"
            onClick={handleEditClick}
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            {user?.phoneNumber ? 'Edit' : 'Add'}
          </button>
        )}
      </div>
      
      {!showForm ? (
        <div>
          {user?.phoneNumber ? (
            <div>
              <p className="text-gray-700">{formatPhoneForDisplay(user.phoneNumber)}</p>
              
              {user.linkedCustomerId ? (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Linked to customer account
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Not linked to a customer account yet
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No phone number added</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="083 209 1122"
              disabled={isProcessing}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your phone number to link with any existing customer accounts
            </p>
          </div>
          
          {message && (
            <div className={`mb-4 p-2 rounded ${
              status === 'success' ? 'bg-green-50 text-green-700' :
              status === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {message}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isProcessing}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isProcessing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePhoneNumberSection;