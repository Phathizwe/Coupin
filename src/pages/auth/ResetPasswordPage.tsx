import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../config/firebase';

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract oobCode (action code) from URL
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setIsVerifying(false);
        toast.error('Invalid or expired password reset link');
        return;
      }

      try {
        // Verify the password reset code
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setIsValid(true);
        setIsVerifying(false);
      } catch (error: any) {
        setIsVerifying(false);
        toast.error('Invalid or expired password reset link');
      }
    };

    verifyCode();
  }, [oobCode]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      if (!oobCode) return;

      setIsLoading(true);
      try {
        await confirmPasswordReset(auth, oobCode, values.password);
        toast.success('Password has been reset successfully!');
        navigate('/login');
      } catch (error: any) {
        toast.error(error.message || 'Failed to reset password');
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (isVerifying) {
    return (
      <div className="text-center">
        <svg className="animate-spin mx-auto h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-sm text-gray-600">Verifying your reset link...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="text-center">
        <div className="rounded-md bg-red-50 p-4 mx-auto max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Invalid reset link</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The password reset link is invalid or has expired. Please request a new password reset link.</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Request a new password reset link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        For account: {email}
      </p>

      <div className="mt-8">
        <div className="mt-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="form-input"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="form-input"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
                ) : null}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;