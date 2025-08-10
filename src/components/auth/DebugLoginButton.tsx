import React from 'react';
import { FormikProps } from 'formik';

interface DebugLoginButtonProps {
  formik: FormikProps<{
    email: string;
    password: string;
  }>;
}

const DebugLoginButton: React.FC<DebugLoginButtonProps> = ({ formik }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleDebugLogin = () => {
    console.log('[LoginPage] Debug login clicked with values:', formik.values);
    // Use a synthetic event to avoid TypeScript errors
    formik.handleSubmit();
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleDebugLogin}
        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Debug Login
      </button>
    </div>
  );
};

export default DebugLoginButton;