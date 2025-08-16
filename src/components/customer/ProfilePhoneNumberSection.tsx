/**
 * ProfilePhoneNumberSection Component
 * 
 * This component displays the phone number section on the customer profile page
 * with proper handling of missing or incorrect phone numbers.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatPhoneWithSpaces } from '../../utils/phoneUtils.enhanced';
import { verifyCustomerPhoneLinking } from '../../utils/registrationPhoneHandler';
import PhoneNumberUpdater from './PhoneNumberUpdater';

interface ProfilePhoneNumberSectionProps {
  onPhoneUpdate?: () => void;
}

const ProfilePhoneNumberSection: React.FC<ProfilePhoneNumberSectionProps> = ({
  onPhoneUpdate
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'issue'>('pending');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Verify phone number linking when component mounts
    const verifyPhoneLinking = async () => {
      if (!user) return;
      
      setIsVerifying(true);
      try {
        const result = await verifyCustomerPhoneLinking(user.uid, user.phoneNumber || undefined);
        setVerificationStatus(result.success ? 'verified' : 'issue');
      } catch (error) {
        console.error('Error verifying phone linking:', error);
        setVerificationStatus('issue');
      } finally {
        setIsVerifying(false);
      }
    };

    if (user) {
      verifyPhoneLinking();
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateComplete = () => {
    setIsEditing(false);
    setVerificationStatus('verified');
    if (onPhoneUpdate) {
      onPhoneUpdate();
    }
  };

  if (!user) {
    return null;
  }

  // If editing, show the phone number updater
  if (isEditing) {
    return (
      <PhoneNumberUpdater onComplete={handleUpdateComplete} />
    );
  }

  // Display the phone number section
  return (
    <div className="bg-white shadow sm:rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
        <button
          onClick={handleEditClick}
          className="text-sm text-primary-600 hover:text-primary-800"
        >
          {user.phoneNumber ? 'Edit' : 'Add'}
        </button>
      </div>
      
      <div className="mt-3">
        {isVerifying ? (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying phone number...
          </div>
        ) : user.phoneNumber ? (
          <div>
            <p className="text-base text-gray-900">
              {formatPhoneWithSpaces(user.phoneNumber)}
            </p>
            
            {verificationStatus === 'verified' ? (
              <div className="mt-1 flex items-center text-sm text-green-600">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            ) : (
              <div className="mt-1 flex items-center text-sm text-yellow-600">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                There may be an issue with your phone number. Please edit to update.
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-base text-gray-500 italic">
              Not provided
            </p>
            <p className="mt-1 text-sm text-yellow-600">
              Adding your phone number helps us link your account to any existing coupons or loyalty programs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePhoneNumberSection;