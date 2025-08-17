import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { findCustomerByPhone, findCustomerByUserId, linkUserToCustomer } from '../services/customerLinkingService';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AutoLinkCustomerAccountProps {
  phoneNumberChanged?: boolean;
  newPhoneNumber?: string;
  onLinkingComplete?: (success: boolean, message: string) => void;
  enableManualLinking?: boolean;
}

/**
 * Component that automatically attempts to link a user account with a customer profile
 * This runs silently in the background after login or when phone number is updated
 */
const AutoLinkCustomerAccount: React.FC<AutoLinkCustomerAccountProps> = ({ 
  phoneNumberChanged = false,
  newPhoneNumber = '',
  onLinkingComplete,
  enableManualLinking = false
}) => {
  const { user } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);
  const [linkingStatus, setLinkingStatus] = useState<{
    success: boolean;
    message: string;
    error?: any;
  } | null>(null);

  useEffect(() => {
    // Reset check status when phone number changes
    if (phoneNumberChanged) {
      setHasChecked(false);
      setLinkingStatus(null);
    }
  }, [phoneNumberChanged, newPhoneNumber]);

  // Report linking status to parent component if callback provided
  useEffect(() => {
    if (linkingStatus && onLinkingComplete) {
      onLinkingComplete(linkingStatus.success, linkingStatus.message);
    }
  }, [linkingStatus, onLinkingComplete]);

  useEffect(() => {
    // Skip if already checked or no user
    if (hasChecked || !user) return;

    const attemptAutoLink = async () => {
      try {
        console.log('🔄 AutoLink: Starting account linking process...');
        
        // Get the phone number to use
        let phoneNumber = newPhoneNumber;
        let phoneSource = 'provided';
        
        // If no new phone number provided (not from a phone update), get from user profile
        if (!phoneNumber) {
          // Try to get phone from user object directly (from Firebase Auth)
          if (user.phoneNumber) {
            phoneNumber = user.phoneNumber;
            phoneSource = 'auth';
            console.log(`📱 AutoLink: Using phone number from auth: ${phoneNumber}`);
          } else {
            // Otherwise try to get from Firestore user document
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            // If user document doesn't exist, create it
            if (!userDoc.exists()) {
              console.log('📝 AutoLink: User document does not exist, creating it');
              await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName || '',
                createdAt: new Date(),
                updatedAt: new Date()
              });
            } else {
              const userData = userDoc.data();
              if (userData.phone) {
                phoneNumber = userData.phone;
                phoneSource = 'firestore';
                console.log(`📱 AutoLink: Using phone number from Firestore: ${phoneNumber}`);
              }
            }
          }
        } else {
          console.log(`📱 AutoLink: Using provided phone number: ${phoneNumber}`);
        }

        // CRITICAL: Always save phone number to user record if available
        if (phoneNumber) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { 
              phone: phoneNumber,
              updatedAt: new Date()
            }, { merge: true });
            console.log('✅ AutoLink: Phone number saved to user record');
          } catch (error) {
            console.error('❌ AutoLink: Error saving phone number to user record:', error);
          }
        } else {
          console.warn('⚠️ AutoLink: No phone number available to save to user record');
        }

        // First check if user is already linked to a customer
        console.log(`🔍 AutoLink: Checking if user ${user.uid} is already linked to a customer`);
        const linkedCustomer = await findCustomerByUserId(user.uid);
        
        // If phone number changed and there's a linked customer, we need to check if we should de-link
        if (phoneNumberChanged && linkedCustomer) {
          console.log('🔄 AutoLink: Phone number changed, checking if we need to de-link');
          
          // If the new phone number doesn't match a customer profile, de-link
          const newCustomerProfile = phoneNumber ? await findCustomerByPhone(phoneNumber) : null;
          
          if (!newCustomerProfile) {
            console.log('🔗 AutoLink: New phone number has no matching customer profile, de-linking');
            
            try {
              // Remove userId from the customer document
              const customerRef = doc(db, 'customers', linkedCustomer.id);
              
              // Check if document exists before updating
              const customerDoc = await getDoc(customerRef);
              if (customerDoc.exists()) {
                await updateDoc(customerRef, {
                  userId: null,
                  updatedAt: new Date()
                });
                console.log('✅ AutoLink: Successfully de-linked user from customer profile');
                setLinkingStatus({
                  success: true,
                  message: 'Account de-linked due to phone number change'
                });
              } else {
                console.error('❌ AutoLink: Customer document does not exist, cannot de-link');
                setLinkingStatus({
                  success: false,
                  message: 'Failed to de-link account: Customer record not found'
                });
              }
            } catch (error) {
              console.error('❌ AutoLink: Error de-linking customer:', error);
              setLinkingStatus({
                success: false,
                message: 'Failed to de-link account',
                error
              });
            }
          } else if (newCustomerProfile.id !== linkedCustomer.id) {
            console.log('🔄 AutoLink: New phone number matches different customer profile, updating link');
            
            try {
              // Remove userId from the old customer document
              const oldCustomerRef = doc(db, 'customers', linkedCustomer.id);
              
              // Check if document exists before updating
              const oldCustomerDoc = await getDoc(oldCustomerRef);
              if (oldCustomerDoc.exists()) {
                await updateDoc(oldCustomerRef, {
                  userId: null,
                  updatedAt: new Date()
                });
              } else {
                console.error('❌ AutoLink: Old customer document does not exist, cannot de-link');
              }
              
              // Link to the new customer profile
              await linkUserToCustomer(user.uid, newCustomerProfile.id);
              console.log('✅ AutoLink: Successfully linked user to new customer profile');
              setLinkingStatus({
                success: true,
                message: 'Account linked to new customer profile'
              });
            } catch (error) {
              console.error('❌ AutoLink: Error updating customer link:', error);
              setLinkingStatus({
                success: false,
                message: 'Failed to update customer link',
                error
              });
            }
          }
          
          setHasChecked(true);
          return;
        }
        
        // If already linked and not a phone number change, nothing to do
        if (linkedCustomer && !phoneNumberChanged) {
          console.log('✅ AutoLink: User already linked to customer profile', linkedCustomer.id);
          setLinkingStatus({
            success: true,
            message: 'Account already linked to customer profile'
          });
          setHasChecked(true);
          return;
        }

        // If we found a phone number, try to find and link customer profile
        if (phoneNumber) {
          console.log(`🔍 AutoLink: Searching for customer profile with phone ${phoneNumber}`);
          const customerProfile = await findCustomerByPhone(phoneNumber);
          
          if (customerProfile) {
            console.log('✅ AutoLink: Found matching customer profile', customerProfile.id);
            
            try {
              // Link user to customer
              await linkUserToCustomer(user.uid, customerProfile.id);
              console.log('✅ AutoLink: Successfully linked user to customer profile');
              
              // Also store the phone number in the user document (redundant but ensures consistency)
              const userRef = doc(db, 'users', user.uid);
              
              // Check if document exists before updating
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                await updateDoc(userRef, {
                  phone: phoneNumber,
                  updatedAt: new Date()
                });
              } else {
                // Create the document if it doesn't exist
                await setDoc(userRef, {
                  email: user.email,
                  displayName: user.displayName || '',
                  phone: phoneNumber,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
              
              setLinkingStatus({
                success: true,
                message: 'Account successfully linked to customer profile'
              });
            } catch (error) {
              console.error('❌ AutoLink: Error linking user to customer:', error);
              setLinkingStatus({
                success: false,
                message: 'Failed to link account to customer profile',
                error
              });
            }
          } else {
            console.log('ℹ️ AutoLink: No matching customer profile found for this phone number');
            setLinkingStatus({
              success: false,
              message: 'No matching customer profile found for your phone number'
            });
          }
        } else {
          console.warn('⚠️ AutoLink: No phone number found for user');
          setLinkingStatus({
            success: false,
            message: 'No phone number associated with your account'
          });
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('❌ AutoLink: Error during auto-linking:', error);
        setLinkingStatus({
          success: false,
          message: 'An error occurred during account linking',
          error
        });
        setHasChecked(true);
      }
    };

    attemptAutoLink();
  }, [user, hasChecked, phoneNumberChanged, newPhoneNumber]);

  // This component doesn't render anything visible unless manual linking is enabled
  if (!enableManualLinking || !linkingStatus || linkingStatus.success) {
    return null;
  }

  // Render manual linking option if auto-linking failed and manual linking is enabled
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {linkingStatus.message}
          </p>
          <button
            className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
            onClick={() => setHasChecked(false)} // Retry linking
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoLinkCustomerAccount;