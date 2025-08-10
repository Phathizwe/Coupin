import React from 'react';
import { animated } from '@react-spring/web';
import { useAnimations } from '../../hooks/useAnimations';
import { addRippleEffect } from '../../utils/animation.utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
  color?: string;
}

// Add global styles for ripple effect
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 600ms linear;
      background-color: rgba(255, 255, 255, 0.7);
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
  loading = false,
  loadingText = 'Loading...',
  color
}) => {
  const { useButtonAnimation, animationPreference } = useAnimations();
  const { props, bind } = useButtonAnimation();
  
  // Base styles
  const baseStyles = 'relative overflow-hidden rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Variant styles
  const variantStyles = {
    primary: `bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    secondary: `bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    outline: `bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    ghost: `bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  };
  
  // Custom color override
  let customStyles = '';
  if (color && variant === 'primary') {
    customStyles = `bg-${color}-600 text-white hover:bg-${color}-700 active:bg-${color}-800`;
  }
  
  // Loading spinner
  const loadingSpinner = (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Add ripple effect if animations are enabled
    if (animationPreference) {
      addRippleEffect(e);
    }
    
    onClick?.();
  };
  
  return (
    <animated.button
      type={type}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${customStyles || variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled || loading}
      {...(animationPreference ? bind : {})}
      style={animationPreference ? props : undefined}
    >
      {loading ? (
        <>
          {loadingSpinner}
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </animated.button>
  );
};

export default AnimatedButton;