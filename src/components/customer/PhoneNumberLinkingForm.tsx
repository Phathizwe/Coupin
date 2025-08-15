import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerAccountLinkingService } from '../../services/customerAccountLinkingService';
import { normalizePhoneNumber } from '../../utils/phoneUtils';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';

interface PhoneNumberLinkingFormProps {
  onSuccess?: (customerId: string) => void;
  onError?: (error: any) => void;
}

/**
 * A form component that allows users to add or update their phone number
 * and automatically links their account to existing customer records.
 */
const PhoneNumberLinkingForm: React.FC<PhoneNumberLinkingFormProps> = ({
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [foundCustomerId, setFoundCustomerId] = useState<string | null>(null);
  
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
      
      // Normalize the phone number
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // Update the user's phone number in Firebase Auth
      const db = getFirestore();
      await updateDoc(doc(db, 'users', user.uid), {
        phoneNumber: phoneNumber,
        phoneNumber_normalized: normalizedPhone
      });
      
      // Look for existing customer records with this phone number
      const customer = await customerAccountLinkingService.findCustomerByPhone(phoneNumber);
      
      if (customer) {
        // Link the user to the customer record
        const linked = await customerAccountLinkingService.linkUserToCustomer(user.uid, customer.id);
        
        if (linked) {
          setStatus('success');
          setMessage('Your phone number has been updated and linked to your existing coupons!');
          setFoundCustomerId(customer.id);
          onSuccess?.(customer.id);
        } else {
          setStatus('error');
          setMessage('Your phone number was updated, but we couldn\'t link it to existing coupons. Please try again later.');
          onError?.(new Error('Failed to link customer'));
        }
      } else {
        // No existing customer found, but phone number was updated
        setStatus('success');
        setMessage('Your phone number has been updated. No existing coupons were found for this number.');
        onSuccess?.('');
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
  
  // Format the phone number as the user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, spaces, parentheses, plus, and dashes
    const value = e.target.value.replace(/[^\d\s()+\-]/g, '');
    setPhoneNumber(value);
  };
  
  return (
    <div className="phone-number-linking-form">
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
            Enter your phone number in any format. We'll match it to any coupons sent to this number.
          </small>
        </div>
        
        {status === 'error' && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}
        
        {status === 'success' && (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Phone Number'}
        </button>
      </form>
      
      {foundCustomerId && (
        <div className="mt-3">
          <p>
            <strong>Success!</strong> Your account is now linked to your customer profile.
            You can now view all coupons sent to your phone number.
          </p>
          <button 
            onClick={() => window.location.href = '/customer/coupons'}
            className="btn btn-outline-primary"
          >
            View My Coupons
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberLinkingForm;