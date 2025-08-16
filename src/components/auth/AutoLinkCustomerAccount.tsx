/**
 * Component that automatically handles customer account linking
 * Used in registration flow and profile updates
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerAccountLinkingService } from '../../services/customerAccountLinkingService';
import { findCustomerByPhone, linkUserToCustomer } from '../../services/customerLinkingService';

interface AutoLinkCustomerAccountProps {
  onLinkingComplete?: (success: boolean, customerId?: string) => void;
}

/**
 * Component that automatically attempts to link a customer account
 * when a user registers or updates their profile
 */
const AutoLinkCustomerAccount: React.FC<AutoLinkCustomerAccountProps> = ({ 
  onLinkingComplete 
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only process if we have a user with a phone number who hasn't been processed yet
    if (
      user && 
      user.phoneNumber && 
      !isProcessing && 
      !isComplete && 
      !user.linkedCustomerId
    ) {
      processLinking();
    }
  }, [user]);

  const processLinking = async () => {
    if (!user || !user.phoneNumber) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🔄 Starting automatic customer account linking...');
      
      // Find a customer with this phone number
      const customer = await findCustomerByPhone(user.phoneNumber);
      
      if (customer) {
        console.log('✅ Found customer with matching phone number:', customer.id);
        
        // Link the user to this customer
        const linked = await linkUserToCustomer(user.uid, customer.id);
        
        if (linked) {
          console.log('✅ Successfully linked user to customer:', customer.id);
          setLinkedCustomerId(customer.id);
          onLinkingComplete?.(true, customer.id);
        } else {
          console.error('❌ Failed to link user to customer');
          setError('Failed to link customer account');
          onLinkingComplete?.(false);
        }
      } else {
        console.log('ℹ️ No existing customer account found to link');
        onLinkingComplete?.(false);
      }
    } catch (err) {
      console.error('❌ Error during automatic customer account linking:', err);
      setError('Failed to link customer account');
      onLinkingComplete?.(false);
    } finally {
      setIsProcessing(false);
      setIsComplete(true);
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default AutoLinkCustomerAccount;