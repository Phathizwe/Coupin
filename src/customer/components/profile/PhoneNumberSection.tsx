import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { ExtendedUser } from '../../../types/auth';
import { normalizePhoneNumber } from '../../../utils/phoneUtils';

interface PhoneNumberSectionProps {
  user: ExtendedUser | null;
  phoneNumber: string;
  originalPhoneNumber: string;
  onPhoneNumberChange: (newPhoneNumber: string, changed: boolean) => void;
  isLoading: boolean;
  viewMode?: 'detailed' | 'simple';
}

const PhoneNumberSection: React.FC<PhoneNumberSectionProps> = ({
  user,
  phoneNumber,
  originalPhoneNumber,
  onPhoneNumberChange,
  isLoading,
  viewMode = 'detailed'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPhoneNumber, setEditPhoneNumber] = useState(phoneNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update local state when prop changes
  useEffect(() => {
    setEditPhoneNumber(phoneNumber);
  }, [phoneNumber]);

  const validatePhoneNumber = (phone: string) => {
    // Basic validation - can be enhanced based on regional requirements
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!editPhoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(editPhoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Normalize phone number for consistent storage
      const normalizedPhone = normalizePhoneNumber(editPhoneNumber);

      // Check if user document exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          phone: normalizedPhone,
          phoneNormalized: normalizedPhone.replace(/\D/g, ''), // Store digits only version for queries
          updatedAt: new Date()
        });
      } else {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          phone: normalizedPhone,
          phoneNormalized: normalizedPhone.replace(/\D/g, ''),
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Check if phone number has changed
      const hasChanged = normalizedPhone !== originalPhoneNumber;
      
      // Update the phone number in the parent component
      onPhoneNumberChange(normalizedPhone, hasChanged);
      
      toast.success('Phone number updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      setError(error.message || 'Failed to update profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditPhoneNumber(phoneNumber);
    setIsEditing(false);
    setError('');
  };

  // Simple view rendering
  if (viewMode === 'simple') {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                {phoneNumber ? 'Edit' : 'Add'}
              </button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="mt-2">
              <div className="mb-3">
                <input
                  type="tel"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                  disabled={isSubmitting}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-700">{phoneNumber || 'Not provided'}</p>
              {!phoneNumber && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Required to see coupons
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    Adding your phone number will link your account to your customer profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view rendering (default)
  return (
    <>
      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Phone number</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="tel"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  disabled={isSubmitting}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center">
                <span>{phoneNumber || 'Not provided'}</span>
                {!phoneNumber && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Required to see coupons
                  </span>
                )}
              </div>
              {!isLoading && !phoneNumber && (
                <p className="mt-1 text-sm text-yellow-600">
                  Adding your phone number will link your account to your customer profile and allow you to see your coupons.
                </p>
              )}
            </>
          )}
        </dd>
      </div>

      {!isEditing && (
        <div className="px-4 py-3 bg-white">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {phoneNumber ? 'Update Phone Number' : 'Add Phone Number'}
          </button>
        </div>
      )}
    </>
  );
};

export default PhoneNumberSection;