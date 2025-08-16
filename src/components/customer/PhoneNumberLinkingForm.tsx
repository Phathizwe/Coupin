/**
 * Phone number linking form component
 * Allows users to update their phone number and link to existing customer records
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerAccountLinkingService } from '../../services/customerAccountLinkingService';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';

interface PhoneNumberLinkingFormProps {
  onSuccess?: (customerId: string) => void;
}

const PhoneNumberLinkingForm: React.FC<PhoneNumberLinkingFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // Initialize with user's current phone number if available
    if (user?.phoneNumber) {
      setPhoneNumber(formatPhoneForDisplay(user.phoneNumber));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ text: 'You must be logged in to update your phone number', type: 'error' });
      return;
    }
    
    if (!phoneNumber) {
      setMessage({ text: 'Please enter a phone number', type: 'error' });
      return;
    }
    
    setIsProcessing(true);
    setMessage(null);
    
    try {
      const customerId = await customerAccountLinkingService.updateUserPhoneAndLinkCustomer(
        user.uid,
        phoneNumber
      );
      
      if (customerId) {
        setMessage({ 
          text: 'Your phone number has been updated and linked to your customer account!', 
          type: 'success' 
        });
        onSuccess?.(customerId);
      } else {
        setMessage({ 
          text: 'Your phone number has been updated. No existing customer account was found to link.', 
          type: 'info' 
        });
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      setMessage({ 
        text: 'Failed to update phone number. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Update Phone Number</h3>
      
      {user?.linkedCustomerId && (
        <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
          ✅ Your account is linked to a customer profile
        </div>
      )}
      
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
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            message.type === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isProcessing ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? 'Processing...' : 'Update Phone Number'}
        </button>
      </form>
    </div>
  );
};

export default PhoneNumberLinkingForm;