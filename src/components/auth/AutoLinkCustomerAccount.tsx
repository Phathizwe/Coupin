import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerAccountLinkingService } from '../../services/customerAccountLinkingService';

interface AutoLinkCustomerAccountProps {
  onLinkingComplete?: (success: boolean, customerId?: string) => void;
}

/**
 * Component that automatically attempts to link a customer account to the current user
 * based on their phone number. This can be used during the authentication flow.
 */
const AutoLinkCustomerAccount: React.FC<AutoLinkCustomerAccountProps> = ({ 
  onLinkingComplete 
}) => {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [linkingComplete, setLinkingComplete] = useState(false);
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const linkCustomerAccount = async () => {
      // Only proceed if we have a user with a phone number and haven't already linked
      if (
        user && 
        user.phoneNumber && 
        !isLinking && 
        !linkingComplete && 
        user.role === 'customer'
      ) {
        try {
          setIsLinking(true);
          console.log('Attempting to link customer account for user:', user.uid);
          
          // Find a customer with this phone number
          const customer = await customerAccountLinkingService.findCustomerByPhone(user.phoneNumber);
          
          if (customer) {
            console.log('Found customer with matching phone number:', customer.id);
            
            // Link the user to this customer
            const linked = await customerAccountLinkingService.linkUserToCustomer(user.uid, customer.id);
            
            if (linked) {
              console.log('Successfully linked user to customer:', customer.id);
              setLinkedCustomerId(customer.id);
              onLinkingComplete?.(true, customer.id);
            } else {
              console.log('Failed to link user to customer');
              onLinkingComplete?.(false);
            }
          } else {
            console.log('No customer found with phone number:', user.phoneNumber);
            onLinkingComplete?.(false);
          }
        } catch (error) {
          console.error('Error linking customer account:', error);
          onLinkingComplete?.(false);
        } finally {
          setIsLinking(false);
          setLinkingComplete(true);
        }
      }
    };

    linkCustomerAccount();
  }, [user, isLinking, linkingComplete, onLinkingComplete]);

  // This component doesn't render anything visible
  return null;
};

export default AutoLinkCustomerAccount;