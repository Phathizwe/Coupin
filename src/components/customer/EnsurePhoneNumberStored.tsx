/**
 * EnsurePhoneNumberStored Component
 * 
 * This component automatically ensures that phone numbers are properly stored
 * and linked for customer accounts. It runs silently in the background and
 * attempts to fix any phone number registration issues.
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ensurePhoneNumberStored, verifyCustomerPhoneLinking, fixCustomerPhoneLinking } from '../../utils/registrationPhoneHandler';

interface EnsurePhoneNumberStoredProps {
  onComplete?: (result: any) => void;
  showDebugInfo?: boolean;
}

const EnsurePhoneNumberStored: React.FC<EnsurePhoneNumberStoredProps> = ({ 
  onComplete,
  showDebugInfo = false
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'checking' | 'fixing' | 'complete' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  
  useEffect(() => {
    const checkAndFixPhoneNumber = async () => {
      if (!user || user.role !== 'customer') {
        console.log('🔍 [ENSURE PHONE] Not a customer user, skipping phone number check');
        return;
      }
      
      try {
        setStatus('checking');
        console.log('🔍 [ENSURE PHONE] Checking phone number for user:', user.uid);
        
        // Step 1: Ensure phone number is stored in user document
        const phoneNumber = user.phoneNumber || undefined;
        const phoneStored = await ensurePhoneNumberStored(user.uid, phoneNumber);
        
        console.log('🔍 [ENSURE PHONE] Phone number stored result:', phoneStored);
        
        // Step 2: Verify customer-user linking
        const verificationResult = await verifyCustomerPhoneLinking(user.uid, phoneNumber);
        console.log('🔍 [ENSURE PHONE] Verification result:', verificationResult);
        
        // Step 3: If there are issues, attempt to fix them
        if (!verificationResult.success) {
          console.log('🔧 [ENSURE PHONE] Issues detected, attempting to fix...');
          setStatus('fixing');
          
          const fixResult = await fixCustomerPhoneLinking(user.uid, phoneNumber);
          console.log('🔧 [ENSURE PHONE] Fix result:', fixResult);
          
          setResult({
            phoneStored,
            verificationResult,
            fixResult,
            finalStatus: fixResult.success ? 'fixed' : 'failed'
          });
        } else {
          setResult({
            phoneStored,
            verificationResult,
            finalStatus: 'already_correct'
          });
        }
        
        setStatus('complete');
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(result);
        }
      } catch (error) {
        console.error('❌ [ENSURE PHONE] Error checking/fixing phone number:', error);
        setStatus('error');
        setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };
    
    if (user) {
      checkAndFixPhoneNumber();
    }
  }, [user, onComplete]);
  
  // This component doesn't render anything visible unless showDebugInfo is true
  if (!showDebugInfo) {
    return null;
  }
  
  // Debug display for development purposes
  return (
    <div className="fixed bottom-0 right-0 bg-gray-100 p-2 text-xs border border-gray-300 m-2 rounded max-w-xs z-50 opacity-80">
      <h4 className="font-bold">Phone Number Debug</h4>
      <div>Status: {status}</div>
      {user && (
        <div>
          <div>User ID: {user.uid}</div>
          <div>Phone: {user.phoneNumber || 'Not set'}</div>
        </div>
      )}
      {result && (
        <div>
          <div>Final Status: {result.finalStatus}</div>
          {result.fixResult && (
            <div>
              <div>User Doc Updated: {result.fixResult.userDocumentUpdated ? 'Yes' : 'No'}</div>
              <div>Customer Created: {result.fixResult.customerRecordCreated ? 'Yes' : 'No'}</div>
              <div>Customer Linked: {result.fixResult.customerRecordLinked ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnsurePhoneNumberStored;