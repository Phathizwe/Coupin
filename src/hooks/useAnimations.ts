import { useState, useEffect, useRef } from 'react';
import { useSpring, useTrail, useChain, SpringRef } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';

export const useAnimations = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPreference, setAnimationPreference] = useState(true);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAnimationPreference(!mediaQuery.matches);
    
    const handleChange = () => {
      setAnimationPreference(!mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Staggered animation for elements
  const useStaggeredAnimation = (items: any[], delay = 100) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });
    
    const trail = useTrail(items.length, {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: inView ? 1 : 0, transform: inView ? 'translateY(0px)' : 'translateY(20px)' },
      config: { mass: 1, tension: 280, friction: 20 },
      delay: delay
    });
    
    return { ref, trail };
  };
  
  // Fade in animation
  const useFadeIn = (delay = 0) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });
    
    const props = useSpring({
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: inView ? { opacity: 1, transform: 'translateY(0px)' } : { opacity: 0, transform: 'translateY(20px)' },
      config: { tension: 280, friction: 20 },
      delay,
    });
    
    return { ref, props };
  };
  
  // Scale animation for buttons
  const useButtonAnimation = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    
    const props = useSpring({
      transform: isPressed 
        ? 'scale(0.95)' 
        : isHovered 
          ? 'scale(1.05)' 
          : 'scale(1)',
      boxShadow: isHovered 
        ? '0 10px 25px rgba(0, 0, 0, 0.15)' 
        : '0 5px 15px rgba(0, 0, 0, 0.1)',
      config: { tension: 300, friction: 10 },
    });
    
  return {
      props,
      bind: {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => {
          setIsHovered(false);
          setIsPressed(false);
        },
        onMouseDown: () => setIsPressed(true),
        onMouseUp: () => setIsPressed(false),
        onTouchStart: () => setIsPressed(true),
        onTouchEnd: () => setIsPressed(false),
      },
  };
};
  
  // Celebration animation
  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };
  
  // Card flip animation
  const useCardFlip = () => {
    const [flipped, setFlipped] = useState(false);
    
    const { transform, opacity } = useSpring({
      opacity: flipped ? 1 : 0,
      transform: `perspective(1200px) rotateY(${flipped ? 180 : 0}deg)`,
      config: { mass: 5, tension: 500, friction: 80 },
    });
    
    return {
      flipped,
      setFlipped,
      frontProps: {
        style: { opacity: opacity.to((o: number) => 1 - o), transform },
      },
      backProps: {
        style: {
          opacity,
          transform: transform.to((t: string) => `${t} rotateY(180deg)`),
        },
      },
    };
  };
  
  // Sequenced animations
  const useSequencedAnimation = (numItems: number, delay = 200) => {
    const springRef = useRef<SpringRef>();
    const trailRef = useRef<SpringRef>();
    
    // Create spring with ref
    const spring = useSpring({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { duration: 300 },
      ref: springRef as unknown as SpringRef,
    });
    
    // Create trail with ref
    const trail = useTrail(numItems, {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      config: { mass: 1, tension: 280, friction: 20 },
      ref: trailRef as unknown as SpringRef,
    });
    
    // Always call useChain, but use empty refs if they're not defined yet
    // This ensures the hook is always called in the same order
    useChain(
      [springRef.current || (null as unknown as SpringRef), trailRef.current || (null as unknown as SpringRef)],
      [0, 0.3]
    );
    
    return { spring, trail };
  };
  
  return {
    useStaggeredAnimation,
    useFadeIn,
    useButtonAnimation,
    useCardFlip,
    useSequencedAnimation,
    triggerCelebration,
    showConfetti,
    animationPreference,
  };
};