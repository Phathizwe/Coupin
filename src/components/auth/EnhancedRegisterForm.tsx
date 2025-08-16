/**
 * Enhanced registration form with phone number handling
 * Integrates with customer-user linking system
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

interface RegisterFormProps {
  redirectPath?: string;
}

const EnhancedRegisterForm: React.FC<RegisterFormProps> = ({ 
  redirectPath = '/dashboard' 
}) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'customer' as 'customer' | 'business',
    businessName: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneFormatted, setPhoneFormatted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone' && value) {
      // Reset the formatted flag when user edits the phone field
      setPhoneFormatted(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const formatPhoneOnBlur = () => {
    if (formData.phone && !phoneFormatted) {
      const normalized = normalizePhoneNumber(formData.phone);
      setFormData(prev => ({
        ...prev,
        phone: normalized
      }));
      setPhoneFormatted(true);
    }
  };
  
  const validateForm = () => {
    // Reset error
    setError(null);
    
    // Validate email
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate password
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Validate name
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    // Validate business name for business accounts
    if (formData.accountType === 'business' && !formData.businessName.trim()) {
      setError('Please enter your business name');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format phone number before submission
      const normalizedPhone = formData.phone ? normalizePhoneNumber(formData.phone) : undefined;
      
      console.log('📱 Submitting registration with phone:', normalizedPhone);
      
      // Based on the error message, register expects 4-5 arguments
      // Most likely: email, password, name, role, [optional phone]
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.accountType,
        normalizedPhone
      );
      
      // Redirect on success
      navigate(redirectPath);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="rounded-md shadow-sm -space-y-px">
          <div className="mb-4">
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange as any}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              disabled={isSubmitting}
            >
              <option value="customer">Customer</option>
              <option value="business">Business</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Full Name"
              disabled={isSubmitting}
            />
          </div>
          
          {formData.accountType === 'business' && (
            <div className="mb-4">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required={formData.accountType === 'business'}
                value={formData.businessName}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Business Name"
                disabled={isSubmitting}
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={formatPhoneOnBlur}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Phone number (optional)"
              disabled={isSubmitting}
            />
            {formData.accountType === 'customer' && (
              <p className="mt-1 text-sm text-gray-500">
                Adding your phone number helps us link to any existing customer accounts
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Confirm password"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedRegisterForm;