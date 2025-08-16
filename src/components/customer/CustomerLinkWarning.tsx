/**
 * Component to display a warning if a customer account isn't linked
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface CustomerLinkWarningProps {
  className?: string;
}

const CustomerLinkWarning: React.FC<CustomerLinkWarningProps> = ({ className = '' }) => {
  const { user } = useAuth();
  
  // Don't show anything if not logged in or not a customer
  if (!user || user.role !== 'customer') {
    return null;
  }
  
  // Don't show if already linked
  if (user.linkedCustomerId) {
    return null;
  }
  
  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your account is not linked to a customer profile. 
            <Link to="/profile" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
              Update your phone number
            </Link> to link with any existing customer accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLinkWarning;