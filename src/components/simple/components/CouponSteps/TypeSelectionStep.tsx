import React from 'react';
import { motion } from 'framer-motion';
import CouponTypeSelector from '../CouponTypeSelector';

interface TypeSelectionStepProps {
  couponTypes: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    textColor: string;
    borderColor: string;
  }>;
  selectedType: string | null;
  onSelectType: (typeId: string) => void;
}

const TypeSelectionStep: React.FC<TypeSelectionStepProps> = ({
  couponTypes,
  selectedType,
  onSelectType,
}) => {
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
      
      <CouponTypeSelector 
        types={couponTypes} 
        onSelect={onSelectType} 
        selected={selectedType}
      />
    </motion.div>
  );
};

export default TypeSelectionStep;