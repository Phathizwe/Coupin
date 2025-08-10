import React from 'react';
import { motion } from 'framer-motion';

interface CouponType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
  borderColor: string;
  value?: any; // Made value optional
}

interface CouponTypeSelectorProps {
  types: CouponType[];
  onSelect: (typeId: string) => void;
  selected: string | null;
}

const CouponTypeSelector: React.FC<CouponTypeSelectorProps> = ({ types, onSelect, selected }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {types.map((type, index) => (
        <motion.div
          key={type.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type.id)}
          className={`p-5 rounded-xl cursor-pointer border-2 ${
            selected === type.id ? `${type.borderColor} shadow-md` : 'border-transparent'
          } ${type.color}`}
        >
          <div className="flex items-center">
            <div className="text-4xl mr-4">{type.icon}</div>
            <div>
              <h3 className={`font-bold ${type.textColor}`}>{type.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{type.description}</p>
            </div>
          </div>
          
          {selected === type.id && (
            <motion.div 
              className="mt-3 flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${type.textColor} bg-white/50 rounded-full p-1`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CouponTypeSelector;