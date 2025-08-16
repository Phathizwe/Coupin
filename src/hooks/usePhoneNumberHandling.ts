/**
 * Hook for handling phone number normalization, validation, and customer linking
 */
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { normalizePhoneNumber } from '../utils/phoneUtils';
import { customerAccountLinkingService } from '../services/customerAccountLinkingService';

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
 * Hook for handling phone number operations
 */
export const usePhoneNumberHandling = (
  options: UsePhoneNumberHandlingOptions = {}
): UsePhoneNumberHandlingResult => {
  const { initialPhoneNumber = '', autoProcess = false } = options;
  const { user } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);

  // Normalize phone number whenever it changes
  useEffect(() => {
    if (phoneNumber) {
      const normalized = normalizePhoneNumber(phoneNumber);
      setNormalizedPhone(normalized);
    } else {
      setNormalizedPhone('');
    }
  }, [phoneNumber]);

  // Auto-process if enabled
  useEffect(() => {
    if (autoProcess && normalizedPhone && !isProcessing && !isComplete && user) {
      processPhoneNumber();
    }
  }, [normalizedPhone, user, autoProcess]);

  // Reset when user changes
  useEffect(() => {
    if (!user) {
      resetStatus();
    }
  }, [user]);

  /**
   * Process the current phone number to link with customer accounts
   */
  const processPhoneNumber = async (): Promise<boolean> => {
    if (!user || !normalizedPhone || isProcessing) {
      return false;
    }

    setIsProcessing(true);
    setStatus('processing');
    setMessage('Processing phone number...');

    try {
      // Attempt to link customer account
      const customerId = await customerAccountLinkingService.updateUserPhoneAndLinkCustomer(
        user.uid,
        normalizedPhone
      );

      if (customerId) {
        setLinkedCustomerId(customerId);
        setStatus('success');
        setMessage('Successfully linked to existing customer account');
        return true;
      } else {
        setStatus('success');
        setMessage('Phone number updated. No existing customer account found.');
        return true;
      }
    } catch (error) {
      console.error('Error processing phone number:', error);
      setStatus('error');
      setMessage('Failed to process phone number. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
      setIsComplete(true);
    }
  };

  /**
   * Reset the status to idle
   */
  const resetStatus = () => {
    setIsProcessing(false);
    setIsComplete(false);
    setStatus('idle');
    setMessage('');
    setLinkedCustomerId(null);
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

export default usePhoneNumberHandling;