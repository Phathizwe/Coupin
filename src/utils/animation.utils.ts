import confetti from 'canvas-confetti';

/**
 * Utility functions for animations and visual effects
 */

/**
 * Triggers a confetti celebration effect
 */
export const triggerConfetti = (options?: confetti.Options) => {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF5757', '#47B4FF', '#FFD029', '#41E097']
  };

  confetti({
    ...defaults,
    ...options
  });
};

/**
 * Triggers a realistic confetti cannon effect
 */
export const triggerConfettiCannon = () => {
  const end = Date.now() + 2000;
  
  const colors = ['#FF5757', '#47B4FF', '#FFD029', '#41E097', '#8A6FFF'];
  
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

/**
 * Triggers a star-shaped confetti burst
 */
export const triggerStarBurst = () => {
  const defaults = { 
    spread: 360, 
    ticks: 100, 
    gravity: 0, 
    decay: 0.94, 
    startVelocity: 30, 
    shapes: ['star'], 
    colors: ['#FFD029', '#FF5757', '#47B4FF', '#41E097'] 
  };
  
  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star']
  });
  
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      shapes: ['circle']
    });
  }, 150);
};

/**
 * Creates a smooth scroll animation to an element
 */
export const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};

/**
 * Adds a ripple effect to a button click
 */
export const addRippleEffect = (event: React.MouseEvent<HTMLButtonElement>) => {
  const button = event.currentTarget;
  
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');
  
  const ripple = button.getElementsByClassName('ripple')[0];
  
  if (ripple) {
    ripple.remove();
  }
  
  button.appendChild(circle);
};

/**
 * Calculates a dynamic spring animation based on element size
 */
export const calculateDynamicSpring = (elementSize: number) => {
  // Adjust spring tension and friction based on element size
  const baseTension = 200;
  const baseFriction = 20;
  
  const sizeFactor = Math.min(Math.max(elementSize / 100, 0.5), 2);
  
  return {
    tension: baseTension * sizeFactor,
    friction: baseFriction * Math.sqrt(sizeFactor)
  };
};

/**
 * Creates a typing animation effect for text
 */
export const createTypingAnimation = (
  text: string,
  setDisplayText: (text: string) => void,
  speed = 50
) => {
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      setDisplayText(text.substring(0, i + 1));
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
  
  return () => clearInterval(timer);
};