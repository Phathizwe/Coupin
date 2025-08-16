/**
 * PhoneNumberUpdater Component
 * 
 * This component allows customers to update their phone number
 * if it's missing or incorrect. It can be shown on the profile page
 * or as a modal when a phone number issue is detected.
 */
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { normalizePhoneNumber, isValidSouthAfricanPhone, formatPhoneWithSpaces } from '../../utils/phoneUtils.enhanced';
import { fixCustomerPhoneLinking } from '../../utils/registrationPhoneHandler';

interface PhoneNumberUpdaterProps {
  onComplete?: () => void;
  showAsModal?: boolean;
}

const PhoneNumberUpdater: React.FC<PhoneNumberUpdaterProps> = ({
  onComplete,
  showAsModal = false
}) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formatted, setFormatted] = useState(false);
  
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhone(user.phoneNumber);
      setOriginalPhone(user.phoneNumber);
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setFormatted(false);
    setError(null);
  };
  
  const formatPhoneOnBlur = () => {
    if (phone && !formatted) {
      try {
        // Show the formatted version to the user
        const displayFormat = formatPhoneWithSpaces(phone);
        setPhone(displayFormat);
        setFormatted(true);
      } catch (err) {
        // Keep the original input if formatting fails
        console.error('Error formatting phone number:', err);
      }
    }
  };
  
  const validatePhone = (): boolean => {
    if (!phone) {
      setError('Please enter your phone number');
      return false;
    }
    
    const isValid = isValidSouthAfricanPhone(phone);
    if (!isValid) {
      setError('Please enter a valid South African phone number');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone() || !user) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('🔍 [PHONE UPDATER] Updating phone number for user:', user.uid);
      console.log('🔍 [PHONE UPDATER] New phone number:', phone);
      
      // Normalize the phone number for storage
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Update user document with new phone number
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phoneNumber: normalizedPhone,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [PHONE UPDATER] Updated phone number in user document');
      
      // Fix customer-user linking with the new phone number
      const fixResult = await fixCustomerPhoneLinking(user.uid, normalizedPhone);
      console.log('✅ [PHONE UPDATER] Fix result:', fixResult);
      
      setSuccess(true);
      setOriginalPhone(normalizedPhone);
      
      // Call onComplete callback if provided
      if (onComplete) {
        setTimeout(onComplete, 1500); // Give user time to see success message
      }
    } catch (err) {
      console.error('❌ [PHONE UPDATER] Error updating phone number:', err);
      setError('Failed to update phone number. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={handleChange}
          onBlur={formatPhoneOnBlur}
          placeholder="e.g. 083 209 1122"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter your South African phone number to link your account to any existing coupons or loyalty programs.
        </p>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting || (phone === originalPhone && originalPhone !== '')}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isSubmitting || (phone === originalPhone && originalPhone !== '') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Updating...' : 'Update Phone Number'}
        </button>
      </div>
      
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Phone number updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
  
  // Render as a modal if showAsModal is true
  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Update Your Phone Number
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            We need your phone number to link your account to any existing coupons or loyalty programs.
          </p>
          
          {renderForm()}
        </div>
      </div>
    );
  }
  
  // Render as a regular component
  return (
    <div className="bg-white shadow sm:rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
      <div className="mt-3">
        {renderForm()}
      </div>
    </div>
  );
};

export default PhoneNumberUpdater;