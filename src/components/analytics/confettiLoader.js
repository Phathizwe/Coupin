/**
 * Confetti loader - Handles loading and initializing the confetti library
 */

// Import confetti library
import ConfettiGenerator from 'confetti-js';

/**
 * Creates a confetti effect in the specified container
 * @param {Object} options - Configuration options for the confetti
 * @returns {Object} - The confetti instance
 */
export const createConfetti = (options = {}) => {
  // Default options for a celebratory feel
  const defaultOptions = {
    target: 'confetti-canvas',
    max: 100,
    size: 1.2,
    animate: true,
    respawn: false,
    props: ['circle', 'square', 'triangle', 'line'],
    colors: [
      [63, 130, 246], // Blue
      [16, 185, 129], // Green
      [139, 92, 246], // Purple
      [245, 158, 11], // Amber
      [249, 115, 22], // Orange
    ],
    clock: 25,
    rotate: true,
    start_from_edge: true,
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // Merge default options with provided options
  const confettiOptions = { ...defaultOptions, ...options };
  
  // Create and return the confetti instance
  return ConfettiGenerator(confettiOptions);
};

/**
 * Creates a one-time confetti celebration
 * @param {Object} options - Configuration options for the confetti
 * @param {number} duration - Duration in milliseconds for the confetti to display
 */
export const celebrateWithConfetti = (options = {}, duration = 3000) => {
  // Create a canvas element for the confetti
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  
  // Append the canvas to the body
  document.body.appendChild(canvas);
  
  // Create and render the confetti
  const confetti = createConfetti(options);
  confetti.render();
  
  // Remove the canvas after the specified duration
  setTimeout(() => {
    confetti.clear();
    document.body.removeChild(canvas);
  }, duration);
  
  return confetti;
};

export default {
  createConfetti,
  celebrateWithConfetti
};