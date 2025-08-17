import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { findCustomerByUserId } from '../services/customerLinkingService';
import { db } from '../config/firebase';
import ProfileHeader from './components/profile/ProfileHeader';
import ProfileDetails from './components/profile/ProfileDetails';
import PhoneNumberSection from './components/profile/PhoneNumberSection';
import CustomerLinkWarning from './components/profile/CustomerLinkWarning';
import AutoLinkCustomerAccount from '../components/AutoLinkCustomerAccount';
import { useLocation } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumberChanged, setPhoneNumberChanged] = useState(false);
  
  // Get the current view mode from URL query parameter
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewMode = queryParams.get('view') === 'simple' ? 'simple' : 'detailed';

  // Check if user already has a linked customer profile
  useEffect(() => {
    const checkCustomerProfile = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        console.log('🔍 [PROFILE DEBUG] Component mounted');
        console.log('🔍 [PROFILE DEBUG] Current user:', user);
        console.log('🔍 [PROFILE DEBUG] User data keys:', user ? Object.keys(user) : 'No user');
        console.log('🔍 [PROFILE DEBUG] Phone number field:', user?.phoneNumber);
        
        // Get user's phone number from their profile
        let userPhone = '';
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('🔍 [PROFILE DEBUG] User data from Firestore:', userData);
          
          // Check both phoneNumber and phone fields in the Firestore document
          if (userData.phoneNumber) {
            userPhone = userData.phoneNumber;
            setPhoneNumber(userData.phoneNumber);
            setOriginalPhoneNumber(userData.phoneNumber);
            console.log('🔍 [PROFILE DEBUG] Found phoneNumber:', userData.phoneNumber);
          } else if (userData.phone) {
            userPhone = userData.phone;
            setPhoneNumber(userData.phone);
            setOriginalPhoneNumber(userData.phone);
            console.log('🔍 [PROFILE DEBUG] Found phone:', userData.phone);
          } else {
            console.log('🔍 [PROFILE DEBUG] No phone number found in user data');
        }
      }
        
        // Query for customers with this user ID
        const linkedCustomer = await findCustomerByUserId(user.uid);
        console.log('🔍 [PROFILE DEBUG] Linked customer:', linkedCustomer);
        
        if (linkedCustomer) {
          setCustomerProfile(linkedCustomer);
          
          // If customer profile has a phone and user doesn't, update user's phone
          if (linkedCustomer.phone && !userPhone) {
            setPhoneNumber(linkedCustomer.phone);
            setOriginalPhoneNumber(linkedCustomer.phone);
            console.log('🔍 [PROFILE DEBUG] Using phone from customer profile:', linkedCustomer.phone);
          }
        }
      } catch (error) {
        console.error('Error checking customer profile:', error);
      } finally {
        setIsLoading(false);
      }
};

    checkCustomerProfile();
  }, [user]);

  const handlePhoneNumberChange = (newPhoneNumber: string, changed: boolean) => {
    setPhoneNumber(newPhoneNumber);
    if (changed) {
      setPhoneNumberChanged(true);
      setOriginalPhoneNumber(newPhoneNumber);
    }
  };

  // Simple view rendering
  if (viewMode === 'simple') {
    return (
      <div className="max-w-lg mx-auto p-4">
        {phoneNumberChanged && (
          <AutoLinkCustomerAccount 
            phoneNumberChanged={phoneNumberChanged} 
            newPhoneNumber={phoneNumber} 
          />
        )}
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mr-4">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">{user?.displayName || 'Customer'}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <PhoneNumberSection 
            user={user as any}
            phoneNumber={phoneNumber}
            originalPhoneNumber={originalPhoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
            isLoading={isLoading}
            viewMode="simple"
          />
          
          {!customerProfile && !isLoading && (
            <div className="p-4 bg-yellow-50 border-t border-yellow-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Link your account</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Add your phone number to link your account with your customer profile and access your coupons.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Detailed view rendering (default)
  return (
    <div>
      {phoneNumberChanged && (
        <AutoLinkCustomerAccount 
          phoneNumberChanged={phoneNumberChanged} 
          newPhoneNumber={phoneNumber} 
        />
      )}
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <ProfileHeader user={user as any} />
        
        <div className="border-t border-gray-200">
          <dl>
            <ProfileDetails user={user as any} customerProfile={customerProfile} />
            
            <PhoneNumberSection 
              user={user as any}
              phoneNumber={phoneNumber}
              originalPhoneNumber={originalPhoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
              isLoading={isLoading}
              viewMode="detailed"
            />
          </dl>
        </div>
      </div>
      
      {!customerProfile && !isLoading && (
        <CustomerLinkWarning />
      )}
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;