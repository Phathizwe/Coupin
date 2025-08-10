import React from 'react';
import { formatToRand, formatToRandNoDecimals } from '../../utils/currencyUtils';

interface CurrencyDisplayProps {
  amount: number;
  showDecimals?: boolean;
  className?: string;
  large?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  showDecimals = true,
  className = '',
  large = false
}) => {
  const formattedAmount = showDecimals ? formatToRand(amount) : formatToRandNoDecimals(amount);
  
  return (
    <span className={`${large ? 'font-bold text-lg' : ''} ${className}`}>
      {formattedAmount}
    </span>
  );
};

export default CurrencyDisplay;