import React from 'react';
import { FormikProps } from 'formik';

export interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: 'customer' | 'business';
}

interface RegisterFormProps {
  formik: FormikProps<RegisterFormValues>;
  accountType: 'customer' | 'business';
  isLoading: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ formik, accountType, isLoading }) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="sr-only">Full Name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Full Name"
            {...formik.getFieldProps('name')}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
          )}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
          )}
        </div>
        
        {/* Phone number field - only shown for customer accounts */}
        {accountType === 'customer' && (
          <div>
            <label htmlFor="phone" className="sr-only">Phone Number</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Phone Number (to link your existing coupons)"
              {...formik.getFieldProps('phone')}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Enter the phone number where you received your coupon to link your account
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            {...formik.getFieldProps('password')}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Confirm Password"
            {...formik.getFieldProps('confirmPassword')}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Sign up'
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;