import React from 'react';
import { BRAND, BRAND_MESSAGES } from '../../constants/brandConstants';

type MessageType = 
  | 'welcome' 
  | 'success' 
  | 'email' 
  | 'dashboard' 
  | 'customer' 
  | 'value' 
  | 'southAfrican' 
  | 'cta';

type MessageVariant = 
  | 'standard' 
  | 'couponCreated' 
  | 'customerAdded' 
  | 'settingsUpdated'
  | 'welcome'
  | 'couponSent'
  | 'reminder'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'coupon'
  | 'loyalty'
  | 'retention'
  | 'growth'
  | 'friendly'
  | 'local'
  | 'register'
  | 'upgrade'
  | 'contact';

interface TYCAMessageProps {
  type: MessageType;
  variant?: MessageVariant;
  className?: string;
}

const TYCAMessage: React.FC<TYCAMessageProps> = ({ 
  type, 
  variant = 'standard',
  className = ''
}) => {
  const getMessage = () => {
    // @ts-ignore - We know these properties exist
    const message = BRAND_MESSAGES[type][variant] || BRAND_MESSAGES[type].standard;
    return message;
  };

  return (
    <span className={className}>
      {getMessage()}
    </span>
  );
};

export default TYCAMessage;