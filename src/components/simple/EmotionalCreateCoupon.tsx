import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleLayout from '../../layouts/SimpleLayout';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AnimatePresence } from 'framer-motion';

// Import custom hooks
import { useCouponCreation } from './hooks/useCouponCreation';
import { useMascotBehavior } from './hooks/useMascotBehavior';

// Import components
import CouponHeader from './components/CouponHeader';
import CouponContent from './components/CouponContent';
import CelebrationEffects from './components/CelebrationEffects';
import SuccessCelebration from './components/SuccessCelebration';
import AddCustomerModal from './components/AddCustomerModal';
import { getCouponTypesFromFirestore } from './services/couponTypeService';
import { CouponTypeOption } from './components/EmotionalCouponTypeSelector';

const EmotionalCreateCoupon: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [couponTypes, setCouponTypes] = useState<CouponTypeOption[]>([]);
  
  // Use custom hooks
  const {
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
  } = useCouponCreation(navigate);
  
  const {
    mascotMood,
    mascotMessage,
    showMascotMessage,
    showCelebration,
    celebrationType,
    celebrationMessage,
    setShowMascotMessage,
    setCelebrationType,
    setCelebrationMessage,
    setShowCelebration
  } = useMascotBehavior(step, selectedCustomers);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Fetch the business ID from auth context or localStorage
  useEffect(() => {
    // In a real app, this would come from auth context
    // For now, we'll use a placeholder or check localStorage
    const storedBusinessId = localStorage.getItem('businessId') || 'default-business-id';
    setBusinessId(storedBusinessId);
  }, []);
  
  // Fetch customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!businessId) return;
      
      try {
        const customersRef = collection(db, 'businesses', businessId, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        
        const customersList = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCustomers(customersList);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    fetchCustomers();
  }, [businessId]);
  
  // Fetch coupon types from Firestore
  useEffect(() => {
    const fetchCouponTypes = async () => {
      try {
        const types = await getCouponTypesFromFirestore();
        setCouponTypes(types);
      } catch (error) {
        console.error('Error fetching coupon types:', error);
      }
    };
    
    fetchCouponTypes();
  }, []);
  
  const selectedTypeDetails = selectedType 
    ? couponTypes.find(type => type.id === selectedType) || null
    : null;

  const content = (
    <div className="flex flex-col h-screen bg-gray-50">
      <CouponHeader 
        step={step}
        handleBack={handleBack}
        mascotMood={mascotMood}
        mascotMessage={mascotMessage}
        showMascotMessage={showMascotMessage}
        onMessageClose={() => setShowMascotMessage(false)}
      />
      
      <CouponContent 
        step={step}
        selectedType={selectedType}
        selectedCustomers={selectedCustomers}
        selectedTypeDetails={selectedTypeDetails}
        customers={customers}
        isSubmitting={isSubmitting}
        onSelectType={handleSelectType}
        onCustomerSelect={handleCustomerSelect}
        onAddCustomer={() => setShowAddCustomer(true)}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
      
      {/* Celebration effects */}
      <CelebrationEffects 
        type={celebrationType}
        show={showCelebration}
        message={celebrationMessage}
      />
      
      {/* Success celebration */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessCelebration 
            recipientCount={selectedCustomers.length}
            onClose={() => {
              setShowSuccess(false);
              navigate('/business/dashboard');
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Add customer modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <AddCustomerModal 
            businessId={businessId}
            onClose={() => setShowAddCustomer(false)}
            onAdd={(customerId) => {
              setSelectedCustomers([...selectedCustomers, customerId]);
              setShowAddCustomer(false);
              
              setCelebrationType('confetti');
              setCelebrationMessage('New customer added!');
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 2000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );

  // On mobile, render directly; on desktop, wrap with SimpleLayout
  return isMobile ? content : <SimpleLayout>{content}</SimpleLayout>;
};

export default EmotionalCreateCoupon;