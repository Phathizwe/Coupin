import React, { useState, useEffect } from 'react';

interface EmotionalFeedbackProps {
  totalScans: number;
  uniqueCustomers: number;
  isGenerating: boolean;
}

const EmotionalFeedback: React.FC<EmotionalFeedbackProps> = ({
  totalScans,
  uniqueCustomers,
  isGenerating
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState('');
  const [celebrationType, setCelebrationType] = useState<'confetti' | 'sparkle' | 'none'>('none');
  
  // Track previous values to detect changes
  const [prevScans, setPrevScans] = useState(totalScans);
  const [prevCustomers, setPrevCustomers] = useState(uniqueCustomers);
  
  // Check for milestones when analytics data changes
  useEffect(() => {
    // Only celebrate when data changes, not on first load
    if (prevScans !== totalScans || prevCustomers !== uniqueCustomers) {
      // Don't celebrate if values decreased (data refresh)
      if (totalScans > prevScans || uniqueCustomers > prevCustomers) {
        checkForMilestones();
      }
      
      // Update previous values
      setPrevScans(totalScans);
      setPrevCustomers(uniqueCustomers);
    }
  }, [totalScans, uniqueCustomers]);
  
  // Check for generation completion
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isGenerating && prevScans > 0) {
      timeout = setTimeout(() => {
        setMessage('Your QR code is ready to share! ✨');
        setShowCelebration(true);
        setCelebrationType('sparkle');
        
        // Hide after a few seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      }, 500);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isGenerating]);

  const checkForMilestones = () => {
    // Milestone celebrations based on analytics
    if (totalScans === 100) {
      celebrate('🎉 Century milestone! 100 scans reached!', 'confetti');
    } else if (totalScans === 50) {
      celebrate('🌟 50 scans milestone reached!', 'sparkle');
    } else if (uniqueCustomers === 50) {
      celebrate('👥 50 unique customers milestone!', 'confetti');
    } else if (uniqueCustomers === 25) {
      celebrate('🌱 Growing community! 25 unique customers!', 'sparkle');
    }
  };

  const celebrate = (msg: string, type: 'confetti' | 'sparkle') => {
    setMessage(msg);
    setCelebrationType(type);
    setShowCelebration(true);
    
    // Hide celebration after a few seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  // Don't render anything if no celebration is active
  if (!showCelebration) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className={`transform transition-all duration-500 ${showCelebration ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-4 rounded-xl shadow-lg max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {celebrationType === 'confetti' && <span className="text-2xl">🎉</span>}
              {celebrationType === 'sparkle' && <span className="text-2xl">✨</span>}
            </div>
            <div>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalFeedback;