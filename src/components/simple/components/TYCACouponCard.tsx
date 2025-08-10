import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../../constants/brandConstants';

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

// TYCA brand color schemes for different coupon types - updated to match dashboard
const tycaColorSchemes = {
  percentage: {
    primary: 'bg-indigo-100',
    secondary: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    text: 'text-indigo-800',
    icon: '💰'
  },
  fixed: {
    primary: 'bg-blue-100',
    secondary: 'bg-gradient-to-br from-blue-50 to-blue-100',
    text: 'text-blue-800',
    icon: '💵'
  },
  buyXgetY: {
    primary: 'bg-green-100',
    secondary: 'bg-gradient-to-br from-green-50 to-green-100',
    text: 'text-green-800',
    icon: '🎁'
  },
  freeItem: {
    primary: 'bg-amber-100',
    secondary: 'bg-gradient-to-br from-amber-50 to-amber-100',
    text: 'text-amber-800',
    icon: '🍽️'
  }
};

interface TYCACouponCardProps {
  coupon: CouponData;
  onSelect: (id: string) => void;
  onCopy?: (code: string) => void;
  selected?: boolean;
}

const TYCACouponCard: React.FC<TYCACouponCardProps> = ({
  coupon,
  onSelect,
  onCopy,
  selected = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState<string | null>(null);

  // Get color scheme based on coupon type or use custom if provided
  const colorScheme = coupon.colorScheme || tycaColorSchemes[coupon.type];

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
        selected ? 'border-indigo-400' : 'border-gray-200'
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
      {/* Status indicator with TYCA styling */}
      {coupon.active ? (
        <motion.div
          className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full z-10 font-medium"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Active
        </motion.div>
      ) : (
        <motion.div
          className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full z-10 font-medium"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Inactive
        </motion.div>
      )}

      {/* Main card content with TYCA gradients */}
      <div className={`${colorScheme.secondary} p-4`}>
        <div className="flex items-start">
          {/* Coupon icon with subtle animation */}
          <motion.div
            className={`${colorScheme.primary} w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-sm`}
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl">{colorScheme.icon}</span>
          </motion.div>

          {/* Coupon details */}
          <div className="flex-1">
            <h3 className={`font-bold ${colorScheme.text} text-lg`}>{coupon.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>

            {/* Coupon code with enhanced interaction */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer border border-gray-100"
              onClick={handleCopyCode}
              whileHover={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
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
            </motion.div>
          </div>
        </div>

        {/* Usage stats and expiry with TYCA styling */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Usage: {coupon.usageCount}/{coupon.maxUses > 0 ? coupon.maxUses : '∞'}</span>
            <span>Valid until: {coupon.validUntil}</span>
          </div>

          {/* Usage progress bar with TYCA brand colors */}
          {coupon.maxUses > 0 && (
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
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
          className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium"
          whileHover={{ scale: 1.05, backgroundColor: "#c7d2fe" }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsButtonHovered('edit')}
          onHoverEnd={() => setIsButtonHovered(null)}
        >
          {isButtonHovered === 'edit' ? '✏️ Edit' : 'Edit'}
        </motion.button>
        <motion.button
          className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium"
          whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsButtonHovered('toggle')}
          onHoverEnd={() => setIsButtonHovered(null)}
        >
          {isButtonHovered === 'toggle' ?
            (coupon.active ? '⏸️ Deactivate' : '▶️ Activate') :
            (coupon.active ? 'Deactivate' : 'Activate')
          }
        </motion.button>
        <motion.button
          className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium"
          whileHover={{ scale: 1.05, backgroundColor: "#fecaca" }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsButtonHovered('delete')}
          onHoverEnd={() => setIsButtonHovered(null)}
        >
          {isButtonHovered === 'delete' ? '🗑️ Delete' : 'Delete'}
        </motion.button>
      </motion.div>

      {/* Selection indicator with TYCA brand colors */}
      {selected && (
        <motion.div
          className="absolute inset-0 border-2 border-indigo-400 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TYCACouponCard;