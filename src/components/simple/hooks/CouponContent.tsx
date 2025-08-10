import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionalCouponTypeSelector, { CouponTypeOption } from './EmotionalCouponTypeSelector';
import EmotionalCustomerList from './EmotionalCustomerList';
import CouponConfirmation from '../components/CouponConfirmation';

interface CouponContentProps {
  step: 'type' | 'customers' | 'confirm';
  selectedType: string | null;
  selectedCustomers: string[];
  selectedTypeDetails: CouponTypeOption;
  customers: any[];
  isSubmitting: boolean;
  onSelectType: (typeId: string) => void;
  onCustomerSelect: (customerId: string) => void;
  onAddCustomer: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const CouponContent: React.FC<CouponContentProps> = ({
  step,
  selectedType,
  selectedCustomers,
  selectedTypeDetails,
  customers,
  isSubmitting,
  onSelectType,
  onCustomerSelect,
  onAddCustomer,
  onBack,
  onNext,
  onSubmit
}) => {
  return (
    <div className="flex-1 -mt-6">
      <div className="bg-white rounded-t-3xl shadow-lg h-full flex flex-col">
        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'type' && (
              <TypeSelectionStep
                selectedType={selectedType}
                onSelectType={onSelectType}
              />
            )}

            {step === 'customers' && (
              <CustomerSelectionStep
                selectedCustomers={selectedCustomers}
                selectedTypeDetails={selectedTypeDetails}
                customers={customers}
                onCustomerSelect={onCustomerSelect}
                onAddCustomer={onAddCustomer}
                onBack={onBack}
                onNext={onNext}
              />
            )}

            {step === 'confirm' && selectedTypeDetails && (
              <ConfirmationStep
                selectedTypeDetails={selectedTypeDetails}
                recipientCount={selectedCustomers.length}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                onBack={onBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Sub-components for each step
const TypeSelectionStep: React.FC<{
  selectedType: string | null;
  onSelectType: (typeId: string) => void;
}> = ({ selectedType, onSelectType }) => {
  return (
    <motion.div
      key="type-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold text-amber-900 mb-2">What kind of offer would you like to create?</h2>
      <p className="text-amber-700 mb-6">Choose an offer that will delight your customers and bring them back.</p>

      <EmotionalCouponTypeSelector
        types={couponTypes}
        onSelect={onSelectType}
        selected={selectedType}
      />
    </motion.div>
  );
};

const CustomerSelectionStep: React.FC<{
  selectedCustomers: string[];
  selectedTypeDetails: CouponTypeOption;
  customers: any[];
  onCustomerSelect: (customerId: string) => void;
  onAddCustomer: () => void;
  onBack: () => void;
  onNext: () => void;
}> = ({
  selectedCustomers,
  selectedTypeDetails,
  customers,
  onCustomerSelect,
  onAddCustomer,
  onBack,
  onNext
}) => {
    return (
      <motion.div
        key="customers-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-amber-900 mb-2">Choose your valued customers</h2>
        <p className="text-amber-700 mb-6">
          Select who will receive your {selectedTypeDetails?.title} offer.
        </p>

        <EmotionalCustomerList
          customers={customers}
          onSelect={onCustomerSelect}
          selectedCustomers={selectedCustomers}
          onAddCustomer={onAddCustomer}
        />

        <div className="mt-8 flex justify-between">
          <motion.button
            onClick={onBack}
            className="px-6 py-2 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back
          </motion.button>

          <motion.button
            onClick={onNext}
            className={`px-6 py-2 rounded-lg text-white shadow-lg ${selectedCustomers.length > 0
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:shadow-amber-200/50'
              : 'bg-gray-400'
              }`}
            whileHover={selectedCustomers.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedCustomers.length > 0 ? { scale: 0.95 } : {}}
            disabled={selectedCustomers.length === 0}
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    );
  };

const ConfirmationStep: React.FC<{
  selectedTypeDetails: CouponTypeOption;
  recipientCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}> = ({
  selectedTypeDetails,
  recipientCount,
  isSubmitting,
  onSubmit,
  onBack
}) => {
    return (
      <motion.div
        key="confirm-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <CouponConfirmation
          couponType={selectedTypeDetails}
          recipientCount={recipientCount}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      </motion.div>
    );
  };

// Import coupon types data
import { couponTypes } from '../data/couponTypes';

export default CouponContent;