import { useSpring, useTrail } from '@react-spring/web';
import { useState, useCallback } from 'react';
import { useAnimations } from './useAnimations';

/**
 * useBillingAnimations - Orchestrates all billing page animations
 * 
 * Implements emotional design principles:
 * - Visceral: Smooth, delightful micro-animations
 * - Behavioral: Clear feedback and progressive disclosure
 * - Reflective: Celebration moments and trust-building animations
 */
const useBillingAnimations = () => {
  const [animationPreference, setAnimationPreference] = useState(true);
  const { triggerCelebration } = useAnimations();

  // Header animation
  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 100,
    config: { tension: 280, friction: 20 }
  });

  // Current plan card animation
  const currentPlanAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: { tension: 280, friction: 20 }
  });

  // Pricing grid animation
  const pricingGridAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 300,
    config: { tension: 280, friction: 20 }
  });

  // Trust badges animation
  const trustBadgesAnimation = useTrail(3, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 400,
    config: { tension: 280, friction: 20 }
  });

  // Comparison table animation
  const comparisonAnimation = useSpring({
    from: { opacity: 0, height: 0 },
    to: { opacity: 1, height: 'auto' },
    config: { tension: 280, friction: 20 }
  });

  // History animation
  const historyAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 500,
    config: { tension: 280, friction: 20 }
  });

  // Celebration animation
  const playCelebrationAnimation = useCallback(() => {
    triggerCelebration();
  }, [triggerCelebration]);
  return {
    headerAnimation,
    currentPlanAnimation,
    pricingGridAnimation,
    trustBadgesAnimation,
    comparisonAnimation,
    historyAnimation,
    playCelebrationAnimation,
    animationPreference,
    setAnimationPreference
  };
};

export default useBillingAnimations;