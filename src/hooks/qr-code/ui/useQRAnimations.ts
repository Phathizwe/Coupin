import { useCallback } from 'react';

/**
 * Hook for QR code animation effects
 * These are purely UI enhancements and don't affect core functionality
 */
export const useQRAnimations = () => {
  /**
   * Animate the QR code generation process
   * @param onComplete Callback to run when animation completes
   */
  const animateGeneration = useCallback((onComplete?: () => void) => {
    // Add subtle loading animation
    const qrElement = document.querySelector('.qr-code-container');
    
    if (qrElement) {
      qrElement.classList.add('animate-pulse');
      
      // Remove animation after completion
      setTimeout(() => {
        qrElement.classList.remove('animate-pulse');
        if (onComplete) onComplete();
      }, 800);
    } else {
      // If element not found, still call onComplete to ensure functionality
      if (onComplete) onComplete();
    }
  }, []);

  /**
   * Animate success when QR code is ready
   */
  const animateSuccess = useCallback(() => {
    const qrElement = document.querySelector('.qr-code-container');
    
    if (qrElement) {
      // Add subtle scale animation
      qrElement.classList.add('transition-transform', 'duration-500');
      qrElement.classList.add('scale-105');
      
      // Return to normal size
      setTimeout(() => {
        qrElement.classList.remove('scale-105');
      }, 500);
    }
    
    // Add subtle highlight to buttons
    const buttons = document.querySelectorAll('.qr-action-button');
    buttons.forEach(button => {
      button.classList.add('animate-pulse');
      setTimeout(() => {
        button.classList.remove('animate-pulse');
      }, 1000);
    });
  }, []);

  /**
   * Add progress feedback during QR code operations
   */
  const animateProgress = useCallback((progress: number) => {
    // This could be used for more complex progress animations
    // For now it's a simple placeholder
    console.log(`QR generation progress: ${progress}%`);
  }, []);

  return {
    animateGeneration,
    animateSuccess,
    animateProgress
  };
};

export default useQRAnimations;