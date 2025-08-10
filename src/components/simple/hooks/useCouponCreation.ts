import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useCouponCreation = (navigate: NavigateFunction) => {
  const [step, setStep] = useState<'type' | 'customers' | 'confirm'>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setTimeout(() => {
      setStep('customers');
    }, 1000);
  };
  
  const handleCustomerSelect = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  const handleBack = () => {
    if (step === 'customers') {
      setStep('type');
    } else if (step === 'confirm') {
      setStep('customers');
    } else if (step === 'type') {
      navigate('/business/dashboard'); // Go back to dashboard from the first screen
    }
  };

  const handleNext = () => {
    if (step === 'customers') {
      setStep('confirm');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get the current user's business ID
      // In a real app, this would come from auth context
      const businessId = 'default-business-id';
      
      // Create the coupon in Firestore
      const couponData = {
        businessId,
        type: selectedType,
        title: `${selectedType} Offer`,
        active: true,
        createdAt: new Date(),
        recipients: selectedCustomers,
        status: 'active',
        // Add other coupon fields as needed
      };
      
      // Add to Firestore
      const couponRef = await addDoc(collection(db, 'coupons'), couponData);
      
      // Create distributions for each customer
      const distributionPromises = selectedCustomers.map(customerId => {
        return addDoc(collection(db, 'couponDistributions'), {
          couponId: couponRef.id,
          customerId,
          businessId,
          status: 'sent',
          sentAt: new Date()
        });
      });
      
      await Promise.all(distributionPromises);
      
      setIsSubmitting(false);
      
      // Navigate back to dashboard after success
      setTimeout(() => {
        navigate('/business/dashboard');
      }, 6000);
    } catch (error) {
      console.error('Error creating coupon:', error);
      setIsSubmitting(false);
    }
  };

  return {
    step,
    selectedType,
    selectedCustomers,
    isSubmitting,
    handleSelectType,
    handleCustomerSelect,
    handleBack,
    handleNext,
    handleSubmit,
    setStep,
    setSelectedCustomers
  };
};