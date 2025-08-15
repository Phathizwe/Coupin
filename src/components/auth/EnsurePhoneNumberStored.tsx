import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { registrationPhoneHandler } from '../../utils/registrationPhoneHandler';

interface EnsurePhoneNumberStoredProps {
  phoneNumber?: string;
  onComplete?: (success: boolean) => void;
}

/**
 * Component that ensures a user's phone number is properly stored after registration
 * This addresses the issue where phone numbers aren't being saved during registration
 */
const EnsurePhoneNumberStored: React.FC<EnsurePhoneNumberStoredProps> = ({
  phoneNumber,
  onComplete
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const storePhoneNumber = async () => {
      // Only proceed if we have a user, a phone number to store, and haven't already processed
      if (user && phoneNumber && !isProcessing && !isComplete) {
        try {
          setIsProcessing(true);
          console.log('Ensuring phone number is stored for user:', user.uid);
          
          const success = await registrationPhoneHandler.ensurePhoneNumberStored(
            user.uid, 
            phoneNumber
          );
          
          if (success) {
            console.log('Successfully stored phone number');
            onComplete?.(true);
          } else {
            console.log('Failed to store phone number');
            onComplete?.(false);
          }
        } catch (error) {
          console.error('Error storing phone number:', error);
          onComplete?.(false);
        } finally {
          setIsProcessing(false);
          setIsComplete(true);
        }
      }
    };

    storePhoneNumber();
  }, [user, phoneNumber, isProcessing, isComplete, onComplete]);

  // This component doesn't render anything visible
  return null;
};

export default EnsurePhoneNumberStored;