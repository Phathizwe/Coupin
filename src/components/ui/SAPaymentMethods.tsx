import React from 'react';
import { SOUTH_AFRICAN } from '../../constants/brandConstants';

interface SAPaymentMethodsProps {
  className?: string;
  compact?: boolean;
}

const SAPaymentMethods: React.FC<SAPaymentMethodsProps> = ({ 
  className = '',
  compact = false
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {SOUTH_AFRICAN.paymentMethods.map((method) => (
        <div 
          key={method}
          className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} 
            bg-white border border-gray-200 rounded-md text-gray-700 font-medium
            flex items-center justify-center shadow-sm hover:bg-gray-50`}
        >
          {method}
        </div>
      ))}
    </div>
  );
};

export default SAPaymentMethods;