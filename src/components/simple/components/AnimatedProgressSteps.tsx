import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const AnimatedProgressSteps: React.FC<AnimatedProgressStepsProps> = ({
  currentStep,
  totalSteps,
  stepTitles
}) => {
  return (
    <div className="mb-6">
      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-white/30">
          <motion.div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white"
            initial={{ width: `${(1 / totalSteps) * 100}%` }}
            animate={{ width: `${((currentStep) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                index < currentStep 
                  ? 'bg-white text-rose-500' 
                  : index === currentStep - 1
                    ? 'bg-white text-rose-500 ring-4 ring-white/30' 
                    : 'bg-white/40 text-white'
              }`}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ 
                scale: index === currentStep - 1 ? 1.1 : 1,
                opacity: index <= currentStep - 1 ? 1 : 0.8
              }}
              transition={{ duration: 0.3 }}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Step titles */}
      <div className="flex justify-between px-2 text-xs text-white/80">
        {stepTitles.map((title, index) => (
          <motion.div 
            key={index}
            className={`text-center ${index === currentStep - 1 ? 'text-white font-medium' : ''}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: index <= currentStep ? 1 : 0.6 
            }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.3 
            }}
          >
            {title}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedProgressSteps;