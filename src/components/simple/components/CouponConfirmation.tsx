import React from 'react';
import { motion } from 'framer-motion';
import { CouponTypeOption } from './EmotionalCouponTypeSelector';

interface CouponConfirmationProps {
  couponType: CouponTypeOption;
  recipientCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const CouponConfirmation: React.FC<CouponConfirmationProps> = ({
  couponType,
  recipientCount,
  isSubmitting,
  onSubmit,
  onBack
}) => {
  // Animation variants for the coupon card
  const cardVariants = {
    initial: {
      rotateY: 90,
      opacity: 0,
      scale: 0.8
    },
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8
      }
    }
  };
  
  // Animation for the shine effect - using proper TypeScript types for repeatType
  const shineVariants = {
    initial: {
      x: "-100%",
      opacity: 0
    },
    animate: {
      x: "100%",
      opacity: 0.5,
      transition: {
        repeat: Infinity,
        repeatType: "mirror" as const, // Using 'as const' to specify the literal type
        duration: 2,
        ease: "easeInOut" as any, // Temporarily cast to any to resolve type issue
        repeatDelay: 3
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Coupon icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`w-24 h-24 rounded-full ${couponType.color} flex items-center justify-center mb-6 shadow-lg`}
      >
        <span className="text-4xl">{couponType.icon}</span>
      </motion.div>
      
      {/* Confirmation heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-amber-900 mb-2">Ready to share your offer!</h2>
        <p className="text-amber-700">
          Your {couponType.title} offer will be sent to {recipientCount} valued customer{recipientCount !== 1 ? 's' : ''}.
        </p>
      </motion.div>
      
      {/* Coupon card with 3D effect */}
      <motion.div
        className="w-full max-w-sm relative perspective-1000 mb-8"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <div className={`relative rounded-xl p-6 shadow-lg border border-gray-100 overflow-hidden ${couponType.color}`}>
          {/* Shine effect */}
          <motion.div 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-20 pointer-events-none"
            variants={shineVariants}
            initial="initial"
            animate="animate"
          />
          
          {/* Card content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${couponType.textColor}`}>
                {couponType.title}
              </h3>
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-2">
                <span className="text-xl">{couponType.icon}</span>
              </div>
            </div>
            
            <p className={`text-lg font-medium ${couponType.textColor.replace('800', '700')} mb-4`}>
              {couponType.description}
            </p>
            
            <div className="flex justify-between text-sm text-gray-700">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Valid: 30 days</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2"></div>
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2"></div>
          </div>
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <div className="w-full">
        <motion.button
          onClick={onSubmit}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-lg font-bold rounded-xl shadow-md relative overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          {/* Button shine effect */}
          <motion.div 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-20 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              repeat: Infinity,
              repeatType: "mirror" as const,
              duration: 1.5,
              ease: "easeInOut",
              repeatDelay: 1
            }}
          />
          
          {isSubmitting ? (
            <span className="flex items-center justify-center relative z-10">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              SENDING OFFER...
            </span>
          ) : (
            <span className="relative z-10">SEND OFFER</span>
          )}
        </motion.button>
        
        {!isSubmitting && (
          <button
            onClick={onBack}
            className="w-full mt-3 py-2 text-amber-700 font-medium"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default CouponConfirmation;