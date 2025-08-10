import React from 'react';
import { motion } from 'framer-motion';
import CouponMascot from '../../simple/components/CouponMascot';
import AnimatedProgressSteps from '../components/AnimatedProgressSteps';

interface CouponHeaderProps {
  step: 'type' | 'customers' | 'confirm';
  handleBack: () => void;
  mascotMood: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'helping';
  mascotMessage: string;
  showMascotMessage: boolean;
  onMessageClose: () => void;
}

const CouponHeader: React.FC<CouponHeaderProps> = ({
  step,
  handleBack,
  mascotMood,
  mascotMessage,
  showMascotMessage,
  onMessageClose
}) => {
  return (
    <header className="bg-gradient-to-r from-amber-500 to-rose-500 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Back button - now shown on all screens */}
          <motion.button
            onClick={handleBack}
            className="mr-3 p-2 rounded-full hover:bg-white/20"
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <h1 className="text-xl font-bold">Create a Special Offer</h1>
        </div>

        {/* Mascot */}
        <div className="relative">
          <CouponMascot
            mood={mascotMood}
            message={mascotMessage}
            showMessage={showMascotMessage}
            onMessageClose={onMessageClose}
          />
        </div>
      </div>

      {/* Progress steps */}
      <div className="mt-6">
        <AnimatedProgressSteps
          currentStep={step === 'type' ? 1 : step === 'customers' ? 2 : 3}
          totalSteps={3}
          stepTitles={['Choose Type', 'Select Recipients', 'Confirm & Send']}
        />
      </div>
    </header>
  );
};

export default CouponHeader;