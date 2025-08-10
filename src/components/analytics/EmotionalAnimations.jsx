import React, { useEffect, useState, useRef, forwardRef, ForwardRefRenderFunction, ReactNode } from 'react';
import { getTimeBasedGreeting, prefersReducedMotion } from './animationUtils';
import { celebrateWithConfetti } from './confettiLoader';

/**
 * EmotionalDashboardContainer - Main container with entry animations
 * Creates a smooth, welcoming entry experience (visceral design)
 */
export const EmotionalDashboardContainer = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Short delay to ensure smooth animation after DOM is ready
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`
        ${isVisible ? 'emotional-dashboard-enter-active' : 'emotional-dashboard-enter'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * EmotionalCard - Enhanced card with animations and hover effects
 * Improves visceral appeal with subtle interactive feedback
 */
interface EmotionalCardProps {
  children: ReactNode;
  index?: number;
  interactive?: boolean;
  achievement?: boolean;
  className?: string;
}

const EmotionalCardComponent: ForwardRefRenderFunction<HTMLDivElement, EmotionalCardProps> = ({ 
  children, 
  index = 0, 
  interactive = true,
  achievement = false,
  className = '' 
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`
        emotional-card 
        ${interactive ? 'emotional-card-hover' : ''}
        ${className}
      `}
      style={{ 
        animationDelay: prefersReducedMotion() ? '0ms' : `${100 + (index * 50)}ms` 
      }}
    >
      {achievement && (
        <div className="emotional-achievement-indicator">
          <span>✓</span>
        </div>
      )}
      {children}
    </div>
  );
};

export const EmotionalCard = forwardRef<HTMLDivElement, EmotionalCardProps>(EmotionalCardComponent);

/**
 * EmotionalChartContainer - Enhanced chart container with animations
 * Creates a sense of data importance through visual hierarchy
 */
interface EmotionalChartContainerProps {
  children: ReactNode;
  title: string;
  index?: number;
  className?: string;
}

export const EmotionalChartContainer = ({ 
  children, 
  title,
  index = 0,
  className = '' 
}: EmotionalChartContainerProps) => {
  return (
    <div 
      className={`
        emotional-chart-container
        bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300
        ${className}
      `}
      style={{ 
        animationDelay: prefersReducedMotion() ? '0ms' : `${300 + (index * 100)}ms` 
      }}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
};

/**
 * EmotionalGreeting - Time-based personalized greeting
 * Enhances reflective design by creating a personal connection
 */
interface EmotionalGreetingProps {
  userName?: string;
  className?: string;
}

export const EmotionalGreeting = ({ 
  userName, 
  className = '' 
}: EmotionalGreetingProps) => {
  const greeting = getTimeBasedGreeting();
  return (
    <div className={`emotional-greeting ${className}`}>
      <h2 className="text-lg text-gray-600">{greeting}</h2>
      <h1 className="text-2xl font-bold">
        Welcome back, {userName || 'there'} 👋
      </h1>
    </div>
  );
};

/**
 * EmotionalEmptyState - Enhanced empty state with personality
 * Improves behavioral design by making empty states helpful
 */
interface EmotionalEmptyStateProps {
  icon: ReactNode;
  message: string;
  subMessage?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}
export const EmotionalEmptyState = ({ 
  icon, 
  message, 
  subMessage,
  actionText,
  onAction,
  className = '' 
}: EmotionalEmptyStateProps) => {
  return (
    <div className={`emotional-empty-state text-center p-6 ${className}`}>
      <div className="mx-auto h-16 w-16 text-gray-400 mb-4 emotional-icon-pulse">
        {icon}
        </div>
      <p className="mt-2 text-base font-medium text-gray-600">{message}</p>
      {subMessage && <p className="text-sm text-gray-500 mt-1">{subMessage}</p>}
      
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

/**
 * MilestoneConfetti - Celebration effect for achievements
 * Enhances reflective design by celebrating milestones
 */
interface MilestoneConfettiProps {
  trigger: boolean;
  duration?: number;
  options?: Record<string, any>;
}

export const MilestoneConfetti = ({ 
  trigger, 
  duration = 3000,
  options = {} 
}: MilestoneConfettiProps) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  
  useEffect(() => {
    if (prefersReducedMotion() || hasPlayed || !trigger) return;
    
    // Celebrate with confetti
    celebrateWithConfetti(options, duration);
    setHasPlayed(true);
    
    // Reset after duration to allow re-triggering
    const timer = setTimeout(() => setHasPlayed(false), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration, hasPlayed, options]);
  
  return null; // No DOM element needed as confetti creates its own canvas
};

/**
 * EmotionalButton - Enhanced button with animations
 * Improves behavioral design with responsive feedback
 */
interface EmotionalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'attention';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}

export const EmotionalButton = ({ 
  children, 
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: EmotionalButtonProps) => {
  // Define variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700',
    attention: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
  };
  
  // Define size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        emotional-button
        rounded-md font-medium
        transition-all duration-300
        transform hover:scale-105 active:scale-95
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * EmotionalSelect - Enhanced select dropdown
 * Improves behavioral design with better feedback
 */</div>
interface EmotionalSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{value: string, label: string}>;
  label?: string;
  className?: string;
  [key: string]: any;
}

export const EmotionalSelect = ({ 
  value, 
  onChange,
  options = [],
  label,
  className = '',
  ...props
}: EmotionalSelectProps) => {
  return (
    <div className={className}></div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="emotional-select w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * EmotionalInsightCard - Card that highlights key insights
 * Enhances reflective design by emphasizing meaningful data
 */
interface EmotionalInsightCardProps {
  title: string;
  insight: string;
  icon?: ReactNode;
  color?: 'indigo' | 'green' | 'amber' | 'purple' | 'blue';
  className?: string;
}

export const EmotionalInsightCard = ({ 
  title, 
  insight,
  icon,
  color = 'indigo',
  className = '' 
}: EmotionalInsightCardProps) => {
  const colorStyles = {
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return (
    <div className={`
      p-4 rounded-lg border ${colorStyles[color] || colorStyles.indigo}
      transform transition-all duration-300 hover:scale-102
      ${className}
    `}>
      <div className="flex items-start">
        {icon && <div className="mr-3 mt-0.5">{icon}</div>}
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1">{insight}</p>
        </div>
      </div>
    </div>
  );
};