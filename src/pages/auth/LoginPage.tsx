import React from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoginForm from '../../components/auth/LoginForm';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import DebugLoginButton from '../../components/auth/DebugLoginButton';
import { useLoginLogic } from '../../hooks/useLoginLogic';

const LoginPage: React.FC = () => {
  const {
    isLoading,
    loginError,
    handleLogin,
    handleGoogleSignIn,
    handleFacebookSignIn,
    handleMicrosoftSignIn,
    handleLinkedInSignIn
  } = useLoginLogic();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: handleLogin,
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[LoginPage] Form submitted');
    formik.handleSubmit(e);
  };

  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Or{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          create a new account
        </Link>
      </p>

      {loginError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{loginError}</p>
        </div>
      )}

      <div className="mt-8">
        <div className="mt-6">
          <LoginForm 
            formik={formik} 
            isLoading={isLoading} 
            onSubmit={handleFormSubmit}
          />

          <DebugLoginButton formik={formik} />

          <div className="mt-6">
            <SocialLoginButtons
              onGoogleSignIn={handleGoogleSignIn}
              onFacebookSignIn={handleFacebookSignIn}
              onMicrosoftSignIn={handleMicrosoftSignIn}
              onLinkedInSignIn={handleLinkedInSignIn}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;