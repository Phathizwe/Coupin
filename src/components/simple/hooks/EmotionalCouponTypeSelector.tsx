import React from 'react';
import { motion } from 'framer-motion';

export interface CouponTypeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
  borderColor: string;
  discount?: string;
  details?: string[];
  recommended?: boolean;
}

interface EmotionalCouponTypeSelectorProps {
  types: CouponTypeOption[];
  selected: string | null;
  onSelect: (typeId: string) => void;
}

const EmotionalCouponTypeSelector: React.FC<EmotionalCouponTypeSelectorProps> = ({
  types,
  selected,
  onSelect
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Select coupon type</h2>
      <p className="text-gray-600">Choose the type of discount you want to offer</p>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        {types.map((option) => (
          <motion.div
            key={option.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selected === option.id
                ? option.borderColor
                : 'border-gray-200 hover:border-gray-300'
            } ${option.color}`}
            onClick={() => onSelect(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${option.textColor}`}>
                {option.icon}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium text-lg ${option.textColor}`}>{option.title}</h3>
                  {option.recommended && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{option.description}</p>
                
                {selected === option.id && option.details && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 text-sm text-gray-600"
                  >
                    <ul className="space-y-1">
                      {option.details.map((detail, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                
                {option.discount && (
                  <div className="mt-3 text-sm font-medium text-gray-900">
                    Discount: <span className={`${option.textColor}`}>{option.discount}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EmotionalCouponTypeSelector;