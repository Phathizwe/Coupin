import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { enhancedCustomerAccountLinkingService } from '../../services/enhancedCustomerAccountLinkingService';

/**
 * Component for the profile page phone number section
 * Handles adding/updating phone numbers and linking customer accounts
 */
const ProfilePhoneNumberSection: React.FC = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  
  // Pre-fill the phone number if the user already has one
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setStatus('error');
      setMessage('You must be logged in to update your phone number.');
      return;
    }
    
    if (!phoneNumber.trim()) {
      setStatus('error');
      setMessage('Please enter a valid phone number.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setStatus('submitting');
      setMessage('Updating your phone number and checking for existing coupons...');
      
      // Use the enhanced service to update phone and link customer
      const customerId = await enhancedCustomerAccountLinkingService.updateUserPhoneAndLinkCustomer(
        user.uid, 
        phoneNumber
      );
      
      if (customerId) {
        setStatus('success');
        setMessage('Your phone number has been updated and linked to your existing coupons!');
        setLinkedCustomerId(customerId);
      } else {
        // Phone was updated but no existing customer was found
        setStatus('success');
        setMessage('Your phone number has been updated. No existing coupons were found for this number.');
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      setStatus('error');
      setMessage('An error occurred while updating your phone number. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format the phone number as the user types (optional)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, spaces, parentheses, plus, and dashes
    const value = e.target.value.replace(/[^\d\s()+\-]/g, '');
    setPhoneNumber(value);
  };
  
  return (
    <div className="profile-section phone-number-section">
      <h3>Phone Number</h3>
      <p className="text-muted">
        {user?.phoneNumber ? 
          'Update your phone number to link to your coupons.' : 
          'Adding your phone number will link your account to your customer profile and allow you to see your coupons.'}
      </p>
      
      {!user?.phoneNumber && (
        <div className="alert alert-warning">
          <strong>Required to see coupons</strong>
          <p>Adding your phone number will link your account to your customer profile and allow you to see your coupons.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="e.g., (083) 209 1122 or 0832091122"
            disabled={isSubmitting}
            className="form-control"
          />
          <small className="form-text text-muted">
            Try using the phone number that businesses have on file for you.
          </small>
        </div>
        
        {status === 'error' && (
          <div className="alert alert-danger mt-3" role="alert">
            {message}
          </div>
        )}
        
        {status === 'success' && (
          <div className="alert alert-success mt-3" role="alert">
            {message}
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary mt-3" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : user?.phoneNumber ? 'Update Phone Number' : 'Add Phone Number'}
        </button>
      </form>
      
      {linkedCustomerId && (
        <div className="mt-4 text-center">
          <p className="mb-3">
            <strong>Success!</strong> Your account is now linked to your customer profile.
          </p>
          <a 
            href="/customer/coupons"
            className="btn btn-outline-primary"
          >
            View My Coupons
          </a>
        </div>
      )}
      
      <div className="mt-4">
        <div className="alert alert-info">
          <span className="icon">ℹ️</span> <strong>Important:</strong> To see your coupons, add your phone number to link your account to your customer profile.
          <p className="mt-2 mb-0">Try using the phone number that businesses have on file for you.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoneNumberSection;