/**
 * Component that automatically handles business invitations
 * Used in registration flow and customer dashboard
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { findInvitationsByPhone, acceptPendingInvitations } from '../../services/invitationRelationshipService';
import { findCustomerByUserId } from '../../services/customerLinkingService';

interface InvitationHandlerProps {
  onInvitationsProcessed?: (invitationCount: number) => void;
  showNotifications?: boolean;
}

/**
 * Component that automatically processes business invitations
 * for a customer based on their phone number
 */
const InvitationHandler: React.FC<InvitationHandlerProps> = ({ 
  onInvitationsProcessed,
  showNotifications = false
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only process if we have a user with a phone number who hasn't been processed yet
    if (
      user && 
      user.phoneNumber && 
      !isProcessing && 
      !isComplete
    ) {
      processInvitations();
    }
  }, [user]);

  const processInvitations = async () => {
    if (!user || !user.phoneNumber) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🔄 Checking for business invitations...');
      
      // Find pending invitations for this phone number
      const pendingInvitations = await findInvitationsByPhone(user.phoneNumber);
      
      if (pendingInvitations.length > 0) {
        console.log(`✅ Found ${pendingInvitations.length} pending invitations`);
        setInvitationCount(pendingInvitations.length);
        
        // Find customer record for this user
        const customer = await findCustomerByUserId(user.uid);
        
        if (customer) {
          console.log('✅ Found customer record:', customer.id);
          
          // Accept all pending invitations
          const acceptedIds = await acceptPendingInvitations(customer.id, user.phoneNumber);
          
          if (acceptedIds.length > 0) {
            console.log(`✅ Accepted ${acceptedIds.length} invitations`);
            
            if (showNotifications) {
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5000);
            }
          }
        } else {
          console.log('❌ No customer record found for user');
          setError('Unable to process invitations: No customer record found');
        }
        
        onInvitationsProcessed?.(pendingInvitations.length);
      } else {
        console.log('ℹ️ No pending invitations found');
        onInvitationsProcessed?.(0);
      }
    } catch (err) {
      console.error('❌ Error processing invitations:', err);
      setError('Failed to process business invitations');
    } finally {
      setIsProcessing(false);
      setIsComplete(true);
    }
  };

  // Only render notification if enabled and there are invitations
  if (showNotifications && showNotification && invitationCount > 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50 border-l-4 border-green-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              Welcome! You've been invited to {invitationCount} {invitationCount === 1 ? 'business' : 'businesses'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Check your dashboard to see the businesses that have invited you.
            </p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => setShowNotification(false)}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This component doesn't render anything by default
  return null;
};

export default InvitationHandler;