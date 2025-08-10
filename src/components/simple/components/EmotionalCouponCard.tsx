import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface CouponData {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  validUntil: string;
  usageCount: number;
  maxUses: number;
  active: boolean;
  type: 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem';
  colorScheme?: {
    primary: string;
    secondary: string;
    text: string;
    icon: string;
  };
}

// Default color schemes for different coupon types
const defaultColorSchemes = {
  percentage: {
    primary: 'bg-amber-100',
    secondary: 'bg-amber-50',
    text: 'text-amber-800',
    icon: '💰'
  },
  fixed: {
    primary: 'bg-emerald-100',
    secondary: 'bg-emerald-50',
    text: 'text-emerald-800',
    icon: '💵'
  },
  buyXgetY: {
    primary: 'bg-purple-100',
    secondary: 'bg-purple-50',
    text: 'text-purple-800',
    icon: '🎁'
  },
  freeItem: {
    primary: 'bg-rose-100',
    secondary: 'bg-rose-50',
    text: 'text-rose-800',
    icon: '🍽️'
  }
};

interface EmotionalCouponCardProps {
  coupon: CouponData;
  onSelect: (id: string) => void;
  onCopy?: (code: string) => void;
  selected?: boolean;
}

const EmotionalCouponCard: React.FC<EmotionalCouponCardProps> = ({
  coupon,
  onSelect,
  onCopy,
  selected = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Get color scheme based on coupon type or use custom if provided
  const colorScheme = coupon.colorScheme || defaultColorSchemes[coupon.type];
  
  // Calculate usage percentage
  const usagePercentage = coupon.maxUses > 0 
    ? Math.min(100, (coupon.usageCount / coupon.maxUses) * 100) 
    : 0;
  
  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(coupon.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden shadow-sm border ${
        selected ? 'border-amber-400' : 'border-gray-200'
      } transition-all duration-200`}
      onClick={() => onSelect(coupon.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Status indicator */}
      {coupon.active ? (
        <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full z-10">
          Active
        </div>
      ) : (
        <div className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full z-10">
          Inactive
        </div>
      )}
      
      {/* Main card content */}
      <div className={`${colorScheme.secondary} p-4`}>
        <div className="flex items-start">
          {/* Coupon icon */}
          <div className={`${colorScheme.primary} w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-sm`}>
            <span className="text-2xl">{colorScheme.icon}</span>
          </div>
          
          {/* Coupon details */}
          <div className="flex-1">
            <h3 className={`font-bold ${colorScheme.text}`}>{coupon.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
            
            {/* Coupon code */}
            <div 
              className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer"
              onClick={handleCopyCode}
            >
              <span className="font-mono text-sm font-medium text-gray-700">{coupon.code}</span>
              <motion.button
                className="text-gray-500 hover:text-gray-700 text-xs flex items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isCopied ? (
                  <span className="text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Usage stats and expiry */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Usage: {coupon.usageCount}/{coupon.maxUses > 0 ? coupon.maxUses : '∞'}</span>
            <span>Valid until: {coupon.validUntil}</span>
          </div>
          
          {/* Usage progress bar */}
          {coupon.maxUses > 0 && (
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Quick actions - visible on hover or when selected */}
      <motion.div 
        className="bg-white border-t border-gray-100 p-2 flex justify-end space-x-2"
        initial={{ opacity: 0, height: 0, padding: 0 }}
        animate={{ 
          opacity: isHovered || selected ? 1 : 0,
          height: isHovered || selected ? 'auto' : 0,
          padding: isHovered || selected ? 8 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700"
          whileHover={{ scale: 1.05, backgroundColor: "#fcd34d" }}
          whileTap={{ scale: 0.95 }}
        >
          Edit
        </motion.button>
        <motion.button
          className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700"
          whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
          whileTap={{ scale: 0.95 }}
        >
          {coupon.active ? 'Deactivate' : 'Activate'}
        </motion.button>
      </motion.div>
      
      {/* Selection indicator */}
      {selected && (
        <motion.div 
          className="absolute inset-0 border-2 border-amber-400 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default EmotionalCouponCard;