import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { findCustomerByPhone, linkUserToCustomer } from '../services/customerLinkingService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Success page shown after a new customer account is created
 * Allows user to explicitly link their account to an existing customer profile
 */
const NewCustomerSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLinking, setIsLinking] = useState(false);
  const [linkResult, setLinkResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Handle the "Go to Dashboard" button click
  const handleGotoDashboard = async () => {
    if (!user) {
      navigate('/customer/dashboard');
      return;
    }

    setIsLinking(true);
    setLinkResult(null);

    try {
      console.log('🔄 Starting customer account linking process...');
      
      // Get the phone number from the user
      const phoneNumber = user.phoneNumber;
      
      if (!phoneNumber) {
        console.log('⚠️ No phone number found for user');
        setLinkResult({
          success: false,
          message: 'No phone number associated with your account. You can still use the app, but some features may be limited.'
        });
        setIsLinking(false);
        return;
      }
      
      console.log(`📱 Found phone number: ${phoneNumber}`);
      
      // Look for a customer with this phone number
      const customerProfile = await findCustomerByPhone(phoneNumber);
      
      if (customerProfile) {
        console.log('✅ Found matching customer profile:', customerProfile.id);
        
        // Link the user to the customer
        const linkSuccess = await linkUserToCustomer(user.uid, customerProfile.id);
        
        if (linkSuccess) {
          console.log('🎉 Successfully linked user to customer profile');
          setLinkResult({
            success: true,
            message: 'Your account has been successfully linked to your customer profile!'
          });
        } else {
          console.error('❌ Failed to link user to customer profile');
          setLinkResult({
            success: false,
            message: 'There was an issue linking your account. Please try again later.'
          });
        }
      } else {
        console.log('ℹ️ No matching customer profile found');
        setLinkResult({
          success: true,
          message: 'No existing customer profile found. A new profile will be created for you.'
        });
        
        // Ensure the phone number is saved to the user record
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            phone: phoneNumber,
            updatedAt: new Date()
          }, { merge: true });
          console.log('✅ Phone number saved to user record');
        } catch (error) {
          console.error('❌ Error saving phone number to user record:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error during account linking:', error);
      setLinkResult({
        success: false,
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setIsLinking(false);
      
      // Navigate to dashboard after a short delay (to show the result message)
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to TYCA!</h1>
          <p className="text-gray-600 mt-2">
            Your account has been successfully created. You're ready to start saving with coupons!
          </p>
        </div>

        {linkResult && (
          <div className={`p-4 rounded-lg mb-6 ${
            linkResult.success ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {linkResult.message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGotoDashboard}
            disabled={isLinking}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isLinking ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Linking your account...
              </>
            ) : (
              'Go to Dashboard'
            )}
          </button>
          
          <div className="text-center text-sm text-gray-500">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerSuccessPage;