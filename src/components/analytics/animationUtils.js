/**
 * animationUtils.js - Utility functions for emotional design animations
 * Provides reusable animation helpers for the analytics dashboard
 */

// Standard easing curves
export const easings = {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
};

// Animation durations in ms
export const durations = {
  micro: 200,
  standard: 300,
  elaborate: 500,
};

/**
 * Creates a staggered animation delay for multiple elements
 * @param {number} index - The element's index in the array
 * @param {number} baseDelay - Base delay in ms
 * @param {number} staggerAmount - Time between each element in ms
 * @returns {number} - The calculated delay in ms
 */
export const getStaggeredDelay = (index, baseDelay = 100, staggerAmount = 50) => {
  return baseDelay + (index * staggerAmount);
};

/**
 * Determines if reduced motion is preferred by the user
 * @returns {boolean} - True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Creates a confetti celebration effect
 * @param {HTMLElement} container - The container element for the confetti
 * @param {Object} options - Configuration options for the confetti
 */
export const celebrateWithConfetti = (container, options = {}) => {
  if (prefersReducedMotion()) return;
  
  // Default confetti options
  const defaultOptions = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
    disableForReducedMotion: true,
  };
  
  // Merge default options with provided options
  const confettiOptions = { ...defaultOptions, ...options };
  
  // Check if confetti.js is loaded
  if (typeof window.confetti === 'function') {
    window.confetti(confettiOptions);
  } else {
    console.warn('Confetti.js is not loaded. Celebration effect not available.');
  }
};

/**
 * Creates a pulsing animation effect
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in ms
 * @returns {function} - Function to stop the animation
 */
export const createPulseAnimation = (element, duration = 2000) => {
  if (prefersReducedMotion() || !element) return () => {};
  
  let animationFrame;
  let startTime;
  
  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = (elapsed % duration) / duration;
    
    // Calculate scale based on sine wave (smooth pulsing)
    const scale = 1 + 0.05 * Math.sin(progress * Math.PI * 2);
    
    // Apply the scale transform
    element.style.transform = `scale(${scale})`;
    
    // Continue animation
    animationFrame = requestAnimationFrame(animate);
  };
  
  // Start animation
  animationFrame = requestAnimationFrame(animate);
  
  // Return function to stop animation
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      element.style.transform = '';
    }
  };
};

/**
 * Adds a shimmer effect to an element (like a progress bar)
 * @param {HTMLElement} element - The element to add the shimmer to
 */
export const addShimmerEffect = (element) => {
  if (!element) return;
  
  // Create and append the shimmer element
  const shimmer = document.createElement('div');
  shimmer.classList.add('emotional-shimmer-effect');
  shimmer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.3) 50%,
      rgba(255,255,255,0) 100%
    );
    transform: translateX(-100%);
    animation: shimmer 2s infinite;
  `;
  
  // Add the keyframes if they don't exist
  if (!document.querySelector('#shimmer-keyframes')) {
    const style = document.createElement('style');
    style.id = 'shimmer-keyframes';
    style.textContent = `
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Make sure the parent has position relative
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  
  element.appendChild(shimmer);
};

/**
 * Creates a time-based greeting message
 * @returns {string} - Appropriate greeting based on time of day
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Determines the emotional color for a metric based on its value
 * @param {number} value - The metric value
 * @param {number} threshold - The threshold for positive/negative
 * @param {boolean} inverseEmotion - Whether higher values are negative
 * @returns {string} - CSS variable for the appropriate emotion color
 */
export const getEmotionalColor = (value, threshold = 0, inverseEmotion = false) => {
  const isPositive = inverseEmotion ? value < threshold : value >= threshold;
  
  return isPositive ? 'var(--success-emotion)' : 'var(--attention-emotion)';
};

/**
 * Smoothly counts up to a target number
 * @param {HTMLElement} element - The element to update
 * @param {number} target - The target number
 * @param {Object} options - Configuration options
 */
export const animateCounter = (element, target, options = {}) => {
  if (prefersReducedMotion() || !element) {
    element.textContent = target.toString();
    return;
  }
  
  const defaultOptions = {
    duration: 1000,
    easing: 'decelerate',
    formatter: (value) => Math.round(value).toString(),
    prefix: '',
    suffix: '',
  };
  
  const config = { ...defaultOptions, ...options };
  const startTime = performance.now();
  const startValue = 0;
  
  const updateValue = (timestamp) => {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / config.duration, 1);
    
    // Apply easing
    let easedProgress;
    switch (config.easing) {
      case 'decelerate':
        easedProgress = 1 - Math.pow(1 - progress, 2);
        break;
      case 'accelerate':
        easedProgress = progress * progress;
        break;
      default:
        easedProgress = progress;
    }
    
    const currentValue = startValue + (target - startValue) * easedProgress;
    element.textContent = `${config.prefix}${config.formatter(currentValue)}${config.suffix}`;
    
    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  };
  
  requestAnimationFrame(updateValue);
};