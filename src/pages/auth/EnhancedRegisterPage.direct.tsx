import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import AccountTypeSelector from '../../components/auth/AccountTypeSelector';
import RegisterForm from '../../components/auth/RegisterForm';
import SocialSignInButtons from '../../components/auth/SocialSignInButtons';
import { registerValidationSchema } from '../../utils/validationSchemas';
import { toast } from 'react-toastify';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { logAnalyticsEvent } from '../../config/firebase';
import { ensureUserHasBusiness } from '../../services/businessRegistrationService';
import { diagnoseBusiness } from '../../utils/registrationDiagnostics';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

/**
 * Direct implementation of enhanced registration page that bypasses the auth hook
 * to ensure proper registration flow
 */
const EnhancedRegisterPageDirect: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email') || '';
  const typeFromQuery = queryParams.get('type') || '';

  // Set account type based on URL parameter, default to 'customer' if not specified
  const [accountType, setAccountType] = useState<'customer' | 'business'>(
    typeFromQuery === 'business' ? 'business' : 'customer'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  const { googleSignIn, facebookSignIn, microsoftSignIn, linkedInSignIn } = useAuth();
  const navigate = useNavigate();

  // Log page view
  useEffect(() => {
    logAnalyticsEvent('page_view', {
      page_title: 'Enhanced Registration',
      page_location: window.location.href,
      has_email_param: !!emailFromQuery,
      account_type: accountType
    });
  }, [emailFromQuery, accountType]);

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

  // Direct registration implementation that bypasses the auth hook
  const directRegister = async (email: string, password: string, name: string, role: 'customer' | 'business', phone?: string) => {
    try {
      console.log(`[DirectRegister] Registering user ${email} as ${role}`);

      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user || !user.uid) {
        throw new Error('Failed to create user account');
      }

      console.log(`[DirectRegister] User created with ID: ${user.uid}`);

      // Normalize phone for consistent lookups
      const normalizedPhone = phone ? normalizePhoneNumber(phone) : undefined;

      // Create user document in Firestore
      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (normalizedPhone) {
        userData.phoneNumber = normalizedPhone;
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log(`[DirectRegister] User document created in Firestore`);

      // For business users, create a business document
      if (role === 'business') {
        try {
          const businessId = await ensureUserHasBusiness(user.uid, name);
          console.log(`[DirectRegister] Business created with ID: ${businessId}`);

          // Update the user document with the business ID
          await updateDoc(doc(db, 'users', user.uid), {
            businessId,
            currentBusinessId: businessId,
            businesses: [businessId]
          });
        } catch (businessError) {
          console.error('[DirectRegister] Error creating business:', businessError);
        }
      }

      return user;
    } catch (error: any) {
      console.error('[DirectRegister] Registration error:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleRegistration = async (values: any) => {
    setIsLoading(true);

    try {
      console.log(`[EnhancedRegisterPage] Starting direct registration for ${values.email} as ${accountType}`);

      // Register the user directly
      const user = await directRegister(values.email, values.password, values.name, accountType, values.phone);

      if (!user || !user.uid) {
        throw new Error('Registration failed: Invalid user credential');
      }

      console.log('[EnhancedRegisterPage] User registered successfully with ID:', user.uid);

      // Update lead record if email was provided
      if (values.email) {
        await updateLeadRecord(values.email);
      }

      // For business users, run diagnostics
      if (accountType === 'business') {
        try {
          console.log('[EnhancedRegisterPage] Running business diagnostics');
          await diagnoseBusiness(user.uid);
        } catch (diagError) {
          console.error('[EnhancedRegisterPage] Diagnostics error:', diagError);
        }
      }

      toast.success('Account created successfully!');

      // Instead of trying to update the auth context directly,
      // we'll force a full page reload to trigger the auth state listener
      // This will ensure the auth context is properly updated

      // Store the destination in session storage
      const destination = accountType === 'business' ? '/business/dashboard' : '/customer/dashboard';
      sessionStorage.setItem('auth_redirect', destination);

      // Reload the page to trigger the auth state listener
      window.location.href = destination;

    } catch (error: any) {
      console.error('[EnhancedRegisterPage] Registration error:', error);

      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Please use a stronger password (at least 6 characters).');
      } else {
        toast.error(error.message || 'Failed to create account');
      }

    } finally {
      setIsLoading(false);
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
    onSubmit: handleRegistration,
  });

  // Update formik's accountType value when the accountType state changes
  useEffect(() => {
    formik.setFieldValue('accountType', accountType);
  }, [accountType]);

  // Handle social sign-in
  const handleSocialSignIn = async (signInMethod: any, provider: string) => {
    setIsLoading(true);
    try {
      console.log(`[EnhancedRegisterPage] Starting ${provider} sign-in as ${accountType}`);

      const result = await signInMethod();

      if (!result || !auth.currentUser) {
        throw new Error(`${provider} sign-in failed`);
      }

      const userId = auth.currentUser.uid;
      console.log(`[EnhancedRegisterPage] ${provider} sign-in successful:`, userId);

      // Update user role to match selected account type
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: accountType,
        updatedAt: serverTimestamp()
      });

      // For business users, ensure business document exists
      if (accountType === 'business') {
        try {
          await ensureUserHasBusiness(userId, auth.currentUser.displayName || 'My Business');
        } catch (error) {
          console.error(`[EnhancedRegisterPage] Error setting up business:`, error);
        }
      }

      // Update lead record if we have an email
      if (emailFromQuery) {
        await updateLeadRecord(emailFromQuery);
      }

      toast.success(`Signed in successfully with ${provider}!`);

      // Store the destination in session storage
      const destination = accountType === 'business' ? '/business/dashboard' : '/customer/dashboard';
      sessionStorage.setItem('auth_redirect', destination);

      // Reload the page to trigger the auth state listener
      window.location.href = destination;

    } catch (error: any) {
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

export default EnhancedRegisterPageDirect;