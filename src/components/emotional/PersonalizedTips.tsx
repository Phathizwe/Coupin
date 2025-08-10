import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalizedTipsProps {
  couponsCount: number;
  activeCouponsCount: number;
}

const PersonalizedTips: React.FC<PersonalizedTipsProps> = ({ couponsCount, activeCouponsCount }) => {
  const [currentTip, setCurrentTip] = useState<string>('');
  const [showTip, setShowTip] = useState<boolean>(true);
  const [tipIcon, setTipIcon] = useState<string>('💡');

  // Array of personalized tips based on user's coupon data
  const getTips = () => {
    const tips = [
      {
        condition: couponsCount === 0,
        text: "Create your first coupon to start delighting your customers!",
        icon: "🚀"
      },
      {
        condition: couponsCount > 0 && activeCouponsCount === 0,
        text: "You have coupons, but none are active. Activate one to start attracting customers!",
        icon: "🔥"
      },
      {
        condition: activeCouponsCount === 1,
        text: "Great start with your active coupon! Try creating a special offer for returning customers.",
        icon: "👏"
      },
      {
        condition: activeCouponsCount > 1 && activeCouponsCount < 5,
        text: "Your active coupons are ready to drive sales! Try sharing them on social media.",
        icon: "📱"
      },
      {
        condition: activeCouponsCount >= 5,
        text: "Pro tip: Analyze which coupons perform best and create similar ones for even more success!",
        icon: "📊"
      },
      {
        condition: true, // Default tip
        text: "Try targeting specific customer segments with personalized offers for better results.",
        icon: "🎯"
      }
    ];

    // Return the first tip where the condition is true
    return tips.find(tip => tip.condition) || tips[tips.length - 1];
  };

  // Update the tip when coupon data changes
  useEffect(() => {
    const selectedTip = getTips();
    setCurrentTip(selectedTip.text);
    setTipIcon(selectedTip.icon);
  }, [couponsCount, activeCouponsCount]);

  // Auto-hide tip after 10 seconds, but keep it visible if it's important
  useEffect(() => {
    if (couponsCount === 0 || (couponsCount > 0 && activeCouponsCount === 0)) {
      // Keep important tips visible
      setShowTip(true);
    } else {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [currentTip, couponsCount, activeCouponsCount]);

  return (
    <AnimatePresence>
      {showTip && currentTip && (
        <motion.div 
          className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start">
            <motion.div 
              className="mr-3 text-2xl"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 5
              }}
            >
              {tipIcon}
            </motion.div>
            
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 mb-1">Personalized Tip</h3>
              <p className="text-gray-700">{currentTip}</p>
            </div>
            
            <button 
              className="text-gray-400 hover:text-gray-600 ml-2"
              onClick={() => setShowTip(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Animated background element */}
          <motion.div 
            className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-blue-100 opacity-20 z-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalizedTips;