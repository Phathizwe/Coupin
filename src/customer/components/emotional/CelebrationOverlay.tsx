import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

const CelebrationOverlay: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  
  useEffect(() => {
    // Create confetti effect
    if (showConfetti) {
      const duration = 3000;
      const end = Date.now() + duration;
      
      // Create confetti canvas
      const confettiCanvas = document.createElement('canvas');
      confettiCanvas.style.position = 'fixed';
      confettiCanvas.style.top = '0';
      confettiCanvas.style.left = '0';
      confettiCanvas.style.width = '100%';
      confettiCanvas.style.height = '100%';
      confettiCanvas.style.pointerEvents = 'none';
      confettiCanvas.style.zIndex = '9999';
      document.body.appendChild(confettiCanvas);
      
      const myConfetti = confetti.create(confettiCanvas, {
        resize: true,
        useWorker: true
      });
      
      // Run the animation
      const frame = () => {
        const timeLeft = end - Date.now();
        
        if (timeLeft <= 0) {
          document.body.removeChild(confettiCanvas);
          setShowConfetti(false);
          return;
        }
        
        // Confetti options
        const particleRatio = 0.5;
        const opts = {
          particleCount: 1,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        };
        
        myConfetti({
          ...opts,
          particleCount: Math.floor(200 * particleRatio * (timeLeft / duration)),
          origin: { x: 0.2, y: 0.5 }
        });
        
        myConfetti({
          ...opts,
          particleCount: Math.floor(200 * particleRatio * (timeLeft / duration)),
          angle: 120,
          origin: { x: 0.8, y: 0.5 }
        });
        
        requestAnimationFrame(frame);
      };
      
      frame();
    }
  }, [showConfetti]);
  
  return null; // This component doesn't render anything visible directly
};

export default CelebrationOverlay;