import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerAccountLinkingService } from '../../services/customerAccountLinkingService';

interface AutoLinkCustomerAccountProps {
  onLinkingComplete?: (success: boolean, customerId?: string) => void;
  showFeedback?: boolean;
}

/**
 * Component that automatically attempts to link a customer account to the current user
 * based on their phone number. This can be used during the authentication flow.
 */
const AutoLinkCustomerAccount: React.FC<AutoLinkCustomerAccountProps> = ({ 
  onLinkingComplete,
  showFeedback = false
}) => {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [linkingComplete, setLinkingComplete] = useState(false);
  const [linkingStatus, setLinkingStatus] = useState<'idle' | 'linking' | 'success' | 'not-found' | 'error'>('idle');

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
          setLinkingStatus('linking');
          console.log('Attempting to link customer account for user:', user.uid);
          
          // Find a customer with this phone number
          const customer = await customerAccountLinkingService.findCustomerByPhone(user.phoneNumber);
          
          if (customer) {
            console.log('Found customer with matching phone number:', customer.id);
            
            // Link the user to this customer
            const linked = await customerAccountLinkingService.linkUserToCustomer(user.uid, customer.id);
            
            if (linked) {
              console.log('Successfully linked user to customer:', customer.id);
              setLinkingStatus('success');
              onLinkingComplete?.(true, customer.id);
            } else {
              console.log('Failed to link user to customer');
              setLinkingStatus('error');
              onLinkingComplete?.(false);
            }
          } else {
            console.log('No customer found with phone number:', user.phoneNumber);
            setLinkingStatus('not-found');
            onLinkingComplete?.(false);
          }
        } catch (error) {
          console.error('Error linking customer account:', error);
          setLinkingStatus('error');
          onLinkingComplete?.(false);
        } finally {
          setIsLinking(false);
          setLinkingComplete(true);
        }
      }
    };

    linkCustomerAccount();
  }, [user, isLinking, linkingComplete, onLinkingComplete]);

  if (!showFeedback) {
    return null;
  }

  // Only render feedback if showFeedback is true
  return (
    <div className="customer-linking-status">
      {linkingStatus === 'linking' && (
        <div className="linking-in-progress">
          <p>Checking for existing coupons linked to your phone number...</p>
        </div>
      )}
      
      {linkingStatus === 'success' && (
        <div className="linking-success">
          <p>Great news! We found your existing coupons and linked them to your account.</p>
        </div>
      )}
      
      {linkingStatus === 'not-found' && (
        <div className="linking-not-found">
          <p>No existing coupons found for your phone number. You're all set to start collecting new ones!</p>
        </div>
      )}
      
      {linkingStatus === 'error' && (
        <div className="linking-error">
          <p>There was an issue linking your account. Don't worry, you can still use the app normally.</p>
        </div>
      )}
    </div>
  );
};

export default AutoLinkCustomerAccount;