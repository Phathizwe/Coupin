import { useState, useEffect } from 'react';

export const useMascotBehavior = (
  step: 'type' | 'customers' | 'confirm',
  selectedCustomers: string[]
) => {
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'thinking' | 'celebrating' | 'helping'>('happy');
  const [mascotMessage, setMascotMessage] = useState<string>('');
  const [showMascotMessage, setShowMascotMessage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'confetti' | 'sparkle' | 'bounce' | 'pulse' | 'none'>('none');
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');

  // Update mascot mood and message based on current step
  useEffect(() => {
    switch(step) {
      case 'type':
        setMascotMood('happy');
        setMascotMessage("Let's create something special for your customers today!");
        break;
      case 'customers':
        if (selectedCustomers.length === 0) {
          setMascotMood('thinking');
          setMascotMessage("Who would you like to surprise with this offer?");
        } else if (selectedCustomers.length >= 5) {
          setMascotMood('excited');
          setMascotMessage("Wow! That's a great selection of customers!");
          // Show a celebration for selecting many customers
          setCelebrationType('sparkle');
          setCelebrationMessage('Great selection!');
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        } else {
          setMascotMood('happy');
          setMascotMessage(`You've selected ${selectedCustomers.length} customer${selectedCustomers.length !== 1 ? 's' : ''}!`);
        }
        break;
      case 'confirm':
        setMascotMood('excited');
        setMascotMessage("Your offer looks amazing! Ready to brighten someone's day?");
        break;
    }
    
    setShowMascotMessage(true);
    
    // Auto-hide mascot message after 5 seconds
    const timer = setTimeout(() => {
      setShowMascotMessage(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [step, selectedCustomers.length]);

  return {
    mascotMood,
    mascotMessage,
    showMascotMessage,
    showCelebration,
    celebrationType,
    celebrationMessage,
    setMascotMood,
    setMascotMessage,
    setShowMascotMessage,
    setShowCelebration,
    setCelebrationType,
    setCelebrationMessage
  };
};