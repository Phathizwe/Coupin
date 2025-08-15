import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userPhoneService } from '../../services/userPhoneService';

interface PhoneNumberUpdaterProps {
  onSuccess?: (customerId?: string) => void;
  onError?: (error: any) => void;
}

/**
 * Component for updating a user's phone number and linking to customer records
 * This component works within the constraints of the existing Firestore rules
 */
const PhoneNumberUpdater: React.FC<PhoneNumberUpdaterProps> = ({
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
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
      
      // Use the userPhoneService to update the phone number and link to customer records
      const customerId = await userPhoneService.updatePhoneAndLinkCustomer(user.uid, phoneNumber);
      
      if (customerId) {
        setStatus('success');
        setMessage('Your phone number has been updated and linked to your existing coupons!');
        onSuccess?.(customerId);
      } else {
        // Phone was updated but no existing customer was found or linking failed
        setStatus('success');
        setMessage('Your phone number has been updated. No existing coupons were found for this number.');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      setStatus('error');
      setMessage('An error occurred while updating your phone number. Please try again later.');
      onError?.(error);
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
    <div className="phone-number-updater">
      <form onSubmit={handleSubmit}>
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
      
      {status === 'success' && (
        <div className="mt-4 text-center">
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

export default PhoneNumberUpdater;