import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_MESSAGES } from '../../../constants/brandConstants';

type MascotMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'helping' | 'resting';

interface Tip {
  id: string;
  message: string;
  mood: MascotMood;
}

interface TYCAMascotGuideProps {
  couponsCount: number;
  activeFilter: string;
  isSearching: boolean;
  customTip?: Tip;
}

const TYCAMascotGuide: React.FC<TYCAMascotGuideProps> = ({
  couponsCount,
  activeFilter,
  isSearching,
  customTip
}) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [mascotInteractive, setMascotInteractive] = useState(false);
  const [mascotPose, setMascotPose] = useState<'idle' | 'waving' | 'jumping'>('idle');

  // Collection of tips based on different states with TYCA brand messaging
  const tips: Tip[] = [
    {
      id: 'welcome',
      message: BRAND_MESSAGES.welcome.dashboard,
      mood: 'happy'
    },
    {
      id: 'create-first',
      message: BRAND_MESSAGES.value.retention,
      mood: 'excited'
    },
    {
      id: 'active-filter',
      message: "You're viewing your active coupons. " + BRAND_MESSAGES.value.standard,
      mood: 'helping'
    },
    {
      id: 'inactive-filter',
      message: "These are your inactive coupons. " + BRAND_MESSAGES.customer.standard,
      mood: 'thinking'
    },
    {
      id: 'many-coupons',
      message: BRAND_MESSAGES.success.standard,
      mood: 'celebrating'
    },
    {
      id: 'search-tip',
      message: "Looking for something specific? " + BRAND_MESSAGES.value.loyalty,
      mood: 'helping'
    },
    {
      id: 'no-results',
      message: "No coupons found. " + BRAND_MESSAGES.cta.standard,
      mood: 'thinking'
    }
  ];

  // Select appropriate tip based on current state
  useEffect(() => {
    if (customTip) {
      setCurrentTip(customTip);
      setShowTip(true);
      return;
    }

    let selectedTip: Tip | null = null;

    if (couponsCount === 0) {
      selectedTip = tips.find(t => t.id === 'create-first') || null;
    } else if (isSearching && couponsCount === 0) {
      selectedTip = tips.find(t => t.id === 'no-results') || null;
    } else if (isSearching) {
      selectedTip = tips.find(t => t.id === 'search-tip') || null;
    } else if (activeFilter === 'active') {
      selectedTip = tips.find(t => t.id === 'active-filter') || null;
    } else if (activeFilter === 'inactive') {
      selectedTip = tips.find(t => t.id === 'inactive-filter') || null;
    } else if (couponsCount > 5) {
      selectedTip = tips.find(t => t.id === 'many-coupons') || null;
    } else {
      selectedTip = tips.find(t => t.id === 'welcome') || null;
    }

    setCurrentTip(selectedTip);
    setShowTip(true);

    // Auto-hide tip after 5 seconds
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [couponsCount, activeFilter, isSearching, customTip]);

  // Get mascot emoji based on mood
  const getMascotEmoji = (mood: MascotMood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'thinking': return '🤔';
      case 'celebrating': return '🎉';
      case 'helping': return '💡';
      case 'resting': return '😌';
      default: return '😊';
    }
  };

  // Handle mascot click - show a random tip
  const handleMascotClick = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Animate mascot
    setMascotInteractive(true);
    setMascotPose('jumping');
    setTimeout(() => {
      setMascotInteractive(false);
      setMascotPose('idle');
    }, 1000);
  };

  // Occasionally wave to get attention
  useEffect(() => {
    const waveInterval = setInterval(() => {
      if (!showTip && Math.random() > 0.7) {
        setMascotPose('waving');
        setTimeout(() => setMascotPose('idle'), 2000);
      }
    }, 10000);

    return () => clearInterval(waveInterval);
  }, [showTip]);

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div className="relative">
        {/* Enhanced speech bubble with tip using TYCA brand colors */}
        <AnimatePresence>
          {showTip && currentTip && (
            <motion.div
              className="absolute bottom-16 right-0 bg-white rounded-xl p-4 shadow-lg max-w-xs border border-indigo-200"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
              <p className="text-sm text-gray-700">{currentTip.message}</p>
              <button
                onClick={() => setShowTip(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot button with TYCA brand colors */}
        <motion.button
          className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-2xl"
          onClick={handleMascotClick}
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, -5, 0],
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
          }}
          whileTap={{ scale: 0.9 }}
          animate={
            mascotPose === 'jumping' ? {
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              transition: { duration: 0.5 }
            } : mascotPose === 'waving' ? {
              rotate: [0, -10, 10, -10, 10, -5, 0],
              transition: { duration: 1.5 }
            } : {}
          }
        >
          {currentTip ? getMascotEmoji(currentTip.mood) : getMascotEmoji('happy')}
        </motion.button>
      </div>
    </div>
  );
};

export default TYCAMascotGuide;