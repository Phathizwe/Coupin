import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import AccountTypeSelector from '../../components/auth/AccountTypeSelector';
import RegisterForm from '../../components/auth/RegisterForm';
import SocialSignInButtons from '../../components/auth/SocialSignInButtons';
import { registerValidationSchema } from '../../utils/validationSchemas';
import { handleRegistration, handleSocialSignIn } from '../../utils/authHelpers';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { diagnoseBusiness } from '../../utils/registrationDiagnostics'; // Import the diagnostics function

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<'customer' | 'business'>('customer');
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  const { register, googleSignIn, facebookSignIn, microsoftSignIn, linkedInSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email') || '';

  // Update lead record when registration is completed
  const updateLeadRecord = async (email: string) => {
    try {
      // Find the lead record with this email
      const leadsRef = collection(db, 'leadCapture');
      const q = query(leadsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update the first matching record (should be only one)
        const docRef = doc(db, 'leadCapture', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          completed: true,
          completedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating lead record:', error);
    }
  };

  // Enhanced registration handler with direct business routing
  const handleEnhancedRegistration = async (values: any) => {
    try {
      console.log(`[RegisterPage] Starting registration for ${values.email} as ${accountType}`);

      // Call the standard registration handler
      const result = await handleRegistration(
        values,
        accountType,
        register,
        navigate,
        setIsLoading,
        setLinkingSuccess
      );

      // If we reach this point without an error, registration was successful
      if (values.email) {
        await updateLeadRecord(values.email);
      }

      // Debug the registration result - Fixed the error by checking if result exists and has uid property
      if (result && typeof result === 'object' && 'uid' in result) {
        await diagnoseBusiness(result.uid);
      }

      // Additional safeguard for business users - ensure they are redirected to business dashboard
      if (accountType === 'business') {
        console.log('[RegisterPage] Ensuring business user is redirected to business dashboard');
        navigate('/business/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('[RegisterPage] Registration error:', error);
      // Error handling is already done in handleRegistration
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: emailFromQuery, // Pre-populate email from URL
      phone: '',
      password: '',
      confirmPassword: '',
      accountType: accountType,
    },
    validationSchema: registerValidationSchema,
    enableReinitialize: true,
    onSubmit: handleEnhancedRegistration,
  });

  // Update formik's accountType value when the accountType state changes
  useEffect(() => {
    formik.setFieldValue('accountType', accountType);
  }, [accountType]);

  // Enhanced social sign-in handler with direct business routing
  const handleEnhancedSocialSignIn = async (signInMethod: any, provider: string) => {
    try {
      console.log(`[RegisterPage] Starting ${provider} sign-in as ${accountType}`);
      
      // Call the standard social sign-in handler
      await handleSocialSignIn(
        signInMethod, 
        provider, 
        accountType, 
        navigate, 
        setIsLoading
  );
      
      // If we reach this point without an error, sign-in was successful
      if (emailFromQuery) {
        await updateLeadRecord(emailFromQuery);
      }
      
      // Additional safeguard for business users - ensure they are redirected to business dashboard
      if (accountType === 'business') {
        console.log(`[RegisterPage] Ensuring business user from ${provider} is redirected to business dashboard`);
        navigate('/business/dashboard', { replace: true });
      }
    } catch (error) {
      console.error(`[RegisterPage] ${provider} sign-in error:`, error);
      // Error handling is already done in handleSocialSignIn
    }
};

  const handleGoogleSignIn = () => handleEnhancedSocialSignIn(googleSignIn, 'Google');
  const handleFacebookSignIn = () => handleEnhancedSocialSignIn(facebookSignIn, 'Facebook');
  const handleMicrosoftSignIn = () => handleEnhancedSocialSignIn(microsoftSignIn, 'Microsoft');
  const handleLinkedInSignIn = () => handleEnhancedSocialSignIn(linkedInSignIn, 'LinkedIn');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          
          {/* Account type selector component */}
          <AccountTypeSelector 
            accountType={accountType} 
            setAccountType={setAccountType} 
          />
        </div>

        {/* Registration form component */}
        <RegisterForm 
          formik={formik} 
          accountType={accountType} 
          isLoading={isLoading} 
        />

        {/* Social sign-in buttons component */}
        <SocialSignInButtons 
          onGoogleSignIn={handleGoogleSignIn}
          onFacebookSignIn={handleFacebookSignIn}
          onMicrosoftSignIn={handleMicrosoftSignIn}
          onLinkedInSignIn={handleLinkedInSignIn}
          isLoading={isLoading}
        />

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
