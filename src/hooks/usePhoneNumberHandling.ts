import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { userPhoneService } from '../services/userPhoneService';
import { registrationPhoneHandler } from '../utils/registrationPhoneHandler';

interface UsePhoneNumberHandlingOptions {
  initialPhoneNumber?: string;
  autoProcess?: boolean;
}

interface UsePhoneNumberHandlingResult {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  isProcessing: boolean;
  isComplete: boolean;
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  linkedCustomerId: string | null;
  processPhoneNumber: () => Promise<boolean>;
  resetStatus: () => void;
}

/**
 * Hook for handling phone number storage and customer linking
 * This hook combines the functionality of our various services and can be used
 * in both the registration flow and the profile page
 */
export const usePhoneNumberHandling = (
  options: UsePhoneNumberHandlingOptions = {}
): UsePhoneNumberHandlingResult => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(options.initialPhoneNumber || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);

  // Pre-fill the phone number if the user already has one
  useEffect(() => {
    if (user?.phoneNumber && !phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user, phoneNumber]);

  // Auto-process if requested
  useEffect(() => {
    if (options.autoProcess && user && phoneNumber && !isProcessing && !isComplete) {
      processPhoneNumber();
    }
  }, [user, phoneNumber, options.autoProcess, isProcessing, isComplete]);

  const processPhoneNumber = async (): Promise<boolean> => {
    if (!user) {
      setStatus('error');
      setMessage('You must be logged in to update your phone number.');
      return false;
    }

    if (!phoneNumber.trim()) {
      setStatus('error');
      setMessage('Please enter a valid phone number.');
      return false;
    }

    try {
      setIsProcessing(true);
      setStatus('processing');
      setMessage('Processing your phone number...');

      // First, ensure the phone number is stored in the user record
      const stored = await registrationPhoneHandler.ensurePhoneNumberStored(
        user.uid,
        phoneNumber
      );

      if (!stored) {
        setStatus('error');
        setMessage('Failed to store your phone number. Please try again later.');
        return false;
      }

      // Then, try to find and link any matching customer records
      const customerId = await userPhoneService.findAndLinkCustomerByPhone(
        user.uid,
        phoneNumber
      );

      if (customerId) {
        setStatus('success');
        setMessage('Your phone number has been updated and linked to your existing coupons!');
        setLinkedCustomerId(customerId);
      } else {
        setStatus('success');
        setMessage('Your phone number has been updated. No existing coupons were found for this number.');
      }

      setIsComplete(true);
      return true;
    } catch (error) {
      console.error('Error processing phone number:', error);
      setStatus('error');
      setMessage('An error occurred while processing your phone number. Please try again later.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setMessage('');
    setIsComplete(false);
  };

  return {
    phoneNumber,
    setPhoneNumber,
    isProcessing,
    isComplete,
    status,
    message,
    linkedCustomerId,
    processPhoneNumber,
    resetStatus
  };
};