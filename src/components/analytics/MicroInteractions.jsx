import React, { useEffect, useRef } from 'react';
import { createPulseAnimation, animateCounter, prefersReducedMotion } from './animationUtils';

/**
 * PulseIcon - Creates a subtle pulsing animation for icons
 * Enhances visceral appeal by drawing attention to important elements
 */
export const PulseIcon = ({ children, duration = 2000, className = '' }) => {
  const iconRef = useRef(null);
  
  useEffect(() => {
    if (prefersReducedMotion() || !iconRef.current) return;
    
    const stopPulse = createPulseAnimation(iconRef.current, duration);
    return () => stopPulse();
  }, [duration]);
  
  return (
    <div ref={iconRef} className={`emotional-icon-pulse ${className}`}>
      {children}
    </div>
  );
};

/**
 * CountUpValue - Animates a value counting up to its target
 * Creates a sense of progress and achievement (reflective design)
 */
export const CountUpValue = ({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  className = '',
  formatter = (val) => Math.round(val).toString()
}) => {
  const valueRef = useRef(null);
  
  useEffect(() => {
    if (!valueRef.current) return;
    
    animateCounter(valueRef.current, value, {
      duration,
      formatter,
      prefix,
      suffix
    });
  }, [value, duration, prefix, suffix, formatter]);
  
  return (
    <span ref={valueRef} className={className}>
      {prefix}{formatter(0)}{suffix}
    </span>
  );
};

/**
 * ProgressIndicator - Enhanced progress bar with shimmer effect
 * Improves behavioral design by providing visual feedback
 */
export const ProgressIndicator = ({ 
  value, 
  maxValue = 100,
  height = 'h-2.5',
  className = '',
  positiveColor = 'bg-green-500',
  negativeColor = 'bg-amber-500'
}) => {
  const progressRef = useRef(null);
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const isPositive = value >= 0;
  const barColor = isPositive ? positiveColor : negativeColor;
  
  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} ${className}`}>
      <div 
        ref={progressRef}
        className={`${height} rounded-full emotional-progress-bar ${barColor}`}
        style={{ width: `${Math.abs(percentage)}%` }}
      ></div>
    </div>
  );
};

/**
 * FadeIn - Simple fade-in animation for elements
 * Enhances visceral design by creating a smooth appearance
 */
export const FadeIn = ({ 
  children, 
  delay = 0,
  duration = 300,
  className = '' 
}) => {
  const style = {
    opacity: 0,
    animation: `fadeInUp ${duration}ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards`,
    animationDelay: `${delay}ms`
  };
  
  return (
    <div className={className} style={prefersReducedMotion() ? { opacity: 1 } : style}>
      {children}
    </div>
  );
};

/**
 * EmotionalTooltip - Enhanced tooltip with smooth animations
 * Improves behavioral design by providing contextual information
 */
export const EmotionalTooltip = ({ 
  children, 
  tooltip, 
  position = 'top',
  className = '' 
}) => {
  return (
    <div className={`emotional-tooltip ${className}`} data-tooltip={tooltip} data-position={position}>
      {children}
    </div>
  );
};

/**
 * GrowthIndicator - Animated indicator for positive/negative growth
 * Enhances reflective design by celebrating achievements
 */
export const GrowthIndicator = ({ 
  value, 
  showIcon = true,
  className = '' 
}) => {
  const isPositive = value >= 0;
  const displayValue = typeof value === 'number' ? `${value.toFixed(1)}%` : value;
  
  return (
    <span className={`
      ${isPositive ? 'emotional-growth-positive' : 'emotional-growth-negative'}
      ${className}
    `}>
      {showIcon && isPositive && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
        </svg>
      )}
      {showIcon && !isPositive && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd"></path>
        </svg>
      )}
      {displayValue}
    </span>
  );
};

/**
 * EmotionalLoadingState - Enhanced loading state with personality
 * Improves visceral design during wait times
 */
export const EmotionalLoadingState = ({ 
  message = 'Loading insights...',
  className = '' 
}) => {
  const loadingMessages = [
    'Analyzing your data...',
    'Discovering insights...',
    'Preparing your dashboard...',
    'Crunching the numbers...',
    'Finding patterns in your data...'
  ];
  
  const [currentMessage, setCurrentMessage] = React.useState(message || loadingMessages[0]);
  
  useEffect(() => {
    if (message) return;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setCurrentMessage(loadingMessages[randomIndex]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [message]);
  
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-premium-emotion border-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium emotional-loading-pulse">{currentMessage}</p>
    </div>
  );
};

/**
 * AchievementBadge - Visual indicator for achievements
 * Enhances reflective design by recognizing accomplishments
 */
export const AchievementBadge = ({ 
  show = true,
  icon = '✓',
  className = '' 
}) => {
  if (!show) return null;
  
  return (
    <div className={`emotional-achievement ${className}`}>
      <div className="emotional-achievement-indicator">
        {icon}
      </div>
    </div>
  );
};