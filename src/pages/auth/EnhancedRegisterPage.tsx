import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import AccountTypeSelector from '../../components/auth/AccountTypeSelector';
import RegisterForm from '../../components/auth/RegisterForm';
import SocialSignInButtons from '../../components/auth/SocialSignInButtons';
import { registerValidationSchema } from '../../utils/validationSchemas';
import { enhancedHandleRegistration } from '../../utils/enhancedAuthHelpers';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { logAnalyticsEvent } from '../../config/firebase';
import { toast } from 'react-toastify';
import { diagnoseBusiness } from '../../utils/registrationDiagnostics';

/**
 * Enhanced registration page with better error handling and business setup
 */
const EnhancedRegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<'customer' | 'business'>('customer');
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  const { register, googleSignIn, facebookSignIn, microsoftSignIn, linkedInSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email') || '';

  // Log page view
  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_title: 'Registration',
      page_location: window.location.href,
      has_email_param: !!emailFromQuery
    });
  }, [emailFromQuery]);

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
        console.log('[EnhancedRegisterPage] Updated lead record for:', email);
      }
    } catch (error) {
      console.error('[EnhancedRegisterPage] Error updating lead record:', error);
    }
  };

  // Enhanced registration handler with diagnostics
  const handleEnhancedRegistration = async (values: any) => {
    try {
      console.log(`[EnhancedRegisterPage] Starting registration for ${values.email} as ${accountType}`);
      
      // Call the enhanced registration handler
      const result = await enhancedHandleRegistration(
        values, 
        accountType, 
        register, 
        navigate, 
        setIsLoading, 
        setLinkingSuccess
      );
      
      // If registration was successful and we have an email
      if (result && typeof result === 'object' && 'uid' in result) {
        await updateLeadRecord(values.email);
        
        // For business users, run diagnostics to ensure proper setup
        if (accountType === 'business') {
          try {
            console.log('[EnhancedRegisterPage] Verifying business setup');
            const diagnostics = await diagnoseBusiness(result.uid);
            
            if (!diagnostics.success) {
              console.warn('[EnhancedRegisterPage] Business setup issues:', diagnostics.issues);
              toast.warning('Your business profile was created with some issues. Our system will attempt to fix them.');
            } else {
              console.log('[EnhancedRegisterPage] Business setup verified successfully');
            }
          } catch (diagError) {
            console.error('[EnhancedRegisterPage] Error verifying business setup:', diagError);
          }
        }
      }
    } catch (error) {
      console.error('[EnhancedRegisterPage] Registration error:', error);
      // Error handling is done in enhancedHandleRegistration
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

  // Handle social sign-in with enhanced error handling
  const handleSocialSignIn = async (signInMethod: any, provider: string) => {
    setIsLoading(true);
    try {
      console.log(`[EnhancedRegisterPage] Starting ${provider} sign-in as ${accountType}`);
      
      const result = await signInMethod();
      
      if (result && typeof result === 'object' && 'uid' in result) {
        console.log(`[EnhancedRegisterPage] ${provider} sign-in successful:`, result.uid);
        
        // Update user role to match selected account type
        const userRef = doc(db, 'users', result.uid);
        await updateDoc(userRef, {
          role: accountType,
          updatedAt: new Date()
        });
        
        // For business users, ensure business document exists
        if (accountType === 'business') {
          try {
            const diagnostics = await diagnoseBusiness(result.uid);
            
            if (!diagnostics.success) {
              console.log(`[EnhancedRegisterPage] Creating business for ${provider} user`);
              
              // Import and use the business registration service
              const { ensureUserHasBusiness } = await import('../../services/businessRegistrationService');
              await ensureUserHasBusiness(result.uid);
            }
          } catch (error) {
            console.error(`[EnhancedRegisterPage] Error setting up business for ${provider} user:`, error);
          }
        }
        
        // Update lead record if we have an email
        if (emailFromQuery) {
          await updateLeadRecord(emailFromQuery);
        }
        
        // Navigate to the appropriate dashboard
        if (accountType === 'business') {
          navigate('/business/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (error) {
      console.error(`[EnhancedRegisterPage] ${provider} sign-in error:`, error);
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleSocialSignIn(googleSignIn, 'Google');
  const handleFacebookSignIn = () => handleSocialSignIn(facebookSignIn, 'Facebook');
  const handleMicrosoftSignIn = () => handleSocialSignIn(microsoftSignIn, 'Microsoft');
  const handleLinkedInSignIn = () => handleSocialSignIn(linkedInSignIn, 'LinkedIn');

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

export default EnhancedRegisterPage;