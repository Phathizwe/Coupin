import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { findCustomerByPhone, findCustomerByUserId, linkUserToCustomer } from '../../services/customerLinkingService';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface AutoLinkCustomerAccountProps {
  phoneNumberChanged?: boolean;
  newPhoneNumber?: string;
}

/**
 * Component that automatically attempts to link a user account with a customer profile
 * This runs silently in the background after login or when phone number is updated
 */
const AutoLinkCustomerAccount: React.FC<AutoLinkCustomerAccountProps> = ({ 
  phoneNumberChanged = false,
  newPhoneNumber = ''
}) => {
  const { user } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Reset check status when phone number changes
    if (phoneNumberChanged) {
      setHasChecked(false);
    }
  }, [phoneNumberChanged, newPhoneNumber]);

  useEffect(() => {
    // Skip if already checked or no user
    if (hasChecked || !user) return;

    const attemptAutoLink = async () => {
      try {
        console.log('AutoLink: Checking if user account needs linking...');
        
        // Get the phone number to use
        let phoneNumber = newPhoneNumber;
        
        // If no new phone number provided (not from a phone update), get from user profile
        if (!phoneNumber) {
          // Try to get phone from user object directly
          if (user.phoneNumber) {
            phoneNumber = user.phoneNumber;
          } else {
            // Otherwise try to get from Firestore user document
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.phone) {
                phoneNumber = userData.phone;
              }
            }
          }
        }

        // First check if user is already linked to a customer
        const linkedCustomer = await findCustomerByUserId(user.uid);
        
        // If phone number changed and there's a linked customer, we need to check if we should de-link
        if (phoneNumberChanged && linkedCustomer) {
          console.log('AutoLink: Phone number changed, checking if we need to de-link');
          
          // If the new phone number doesn't match a customer profile, de-link
          const newCustomerProfile = phoneNumber ? await findCustomerByPhone(phoneNumber) : null;
          
          if (!newCustomerProfile) {
            console.log('AutoLink: New phone number has no matching customer profile, de-linking');
            
            // Remove userId from the customer document
            const customerRef = doc(db, 'customers', linkedCustomer.id);
            await updateDoc(customerRef, {
              userId: null,
              updatedAt: new Date()
            });
            
            console.log('AutoLink: Successfully de-linked user from customer profile');
          } else if (newCustomerProfile.id !== linkedCustomer.id) {
            console.log('AutoLink: New phone number matches different customer profile, updating link');
            
            // Remove userId from the old customer document
            const oldCustomerRef = doc(db, 'customers', linkedCustomer.id);
            await updateDoc(oldCustomerRef, {
              userId: null,
              updatedAt: new Date()
            });
            
            // Link to the new customer profile
            await linkUserToCustomer(user.uid, newCustomerProfile.id);
            console.log('AutoLink: Successfully linked user to new customer profile');
          }
          
          setHasChecked(true);
          return;
        }
        
        // If already linked and not a phone number change, nothing to do
        if (linkedCustomer && !phoneNumberChanged) {
          console.log('AutoLink: User already linked to customer profile', linkedCustomer.id);
          setHasChecked(true);
          return;
        }

        // If we found a phone number, try to find and link customer profile
        if (phoneNumber) {
          console.log(`AutoLink: Searching for customer profile with phone ${phoneNumber}`);
          const customerProfile = await findCustomerByPhone(phoneNumber);
          
          if (customerProfile) {
            console.log('AutoLink: Found matching customer profile', customerProfile.id);
            
            // Link user to customer
            await linkUserToCustomer(user.uid, customerProfile.id);
            console.log('AutoLink: Successfully linked user to customer profile');
            
            // Also store the phone number in the user document
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              // Update existing document
              await updateDoc(userRef, {
                phone: phoneNumber,
                updatedAt: new Date()
              });
            } else {
              // Create new user document if it doesn't exist
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                phone: phoneNumber,
                role: 'customer',
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
            
            console.log('AutoLink: Updated user document with phone number');
          } else {
            console.log('AutoLink: No matching customer profile found for this phone number');
          }
        } else {
          console.log('AutoLink: No phone number found for user');
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('AutoLink: Error during auto-linking:', error);
        setHasChecked(true);
      }
    };

    attemptAutoLink();
  }, [user, hasChecked, phoneNumberChanged, newPhoneNumber]);

  // This component doesn't render anything visible
  return null;
};

export default AutoLinkCustomerAccount;