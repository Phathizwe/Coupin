import { Timestamp } from 'firebase/firestore';
import { PricingPlan, UserSubscription, PlanTier } from '../types/billing.types';

/**
 * Format price with currency symbol
 * @param price - The price to format
 * @param currency - The currency code (e.g., USD, ZAR)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

/**
 * Format date from Firestore timestamp or Date object
 * @param date - The date to format (Timestamp or Date)
 * @returns Formatted date string
 */
export const formatDate = (date: Timestamp | Date | any): string => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date 
    ? date 
    : date.toDate 
      ? date.toDate() 
      : new Date(date);
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate days remaining until a date
 * @param date - The target date
 * @returns Number of days remaining
 */
export const getDaysRemaining = (date: Timestamp | Date | any): number => {
  if (!date) return 0;
  
  const targetDate = date instanceof Date 
    ? date 
    : date.toDate 
      ? date.toDate() 
      : new Date(date);
  
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate percentage of usage
 * @param used - Amount used
 * @param limit - Total limit
 * @returns Percentage as a number (capped at 100)
 */
export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (!limit) return 0;
  const percentage = (used / limit) * 100;
  return Math.min(percentage, 100);
};

/**
 * Get appropriate color class based on usage percentage
 * @param percentage - Usage percentage
 * @returns Tailwind CSS color class
 */
export const getUsageColorClass = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * Get appropriate color for usage visualization
 * @param percentage - Usage percentage
 * @returns CSS color string
 */
export const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return '#ef4444'; // red-500
  if (percentage >= 75) return '#eab308'; // yellow-500
  return '#22c55e'; // green-500
};

/**
 * Get color scheme for a pricing plan
 * @param planId - The plan ID or tier
 * @returns Object with color classes
 */
export const getPlanColorScheme = (planId: string): {
  background: string;
  border: string;
  text: string;
  buttonBg: string;
  buttonHover: string;
  badgeBg: string;
  badgeText: string;
} => {
  switch (planId.toLowerCase()) {
    case 'starter':
      return {
        background: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800'
      };
    case 'growth':
      return {
        background: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        buttonBg: 'bg-purple-600',
        buttonHover: 'hover:bg-purple-700',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800'
      };
    case 'professional':
      return {
        background: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        buttonBg: 'bg-indigo-600',
        buttonHover: 'hover:bg-indigo-700',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-800'
      };
    default:
      return {
        background: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        buttonBg: 'bg-gray-600',
        buttonHover: 'hover:bg-gray-700',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-800'
      };
  }
};

/**
 * Get badge text for a plan tier
 * @param planId - The plan ID or tier
 * @returns Badge text string
 */
export const getPlanBadgeText = (planId: string): string => {
  switch (planId.toLowerCase()) {
    case 'starter':
      return 'Basic';
    case 'growth':
      return 'Popular';
    case 'professional':
      return 'Best Value';
    default:
      return '';
  }
};

/**
 * Check if a subscription is in trial period
 * @param subscription - The user subscription object
 * @returns Boolean indicating trial status
 */
export const isInTrialPeriod = (subscription: UserSubscription | undefined): boolean => {
  if (!subscription || !subscription.trialEndDate) return false;
  
  let trialEndDate: Date;
  
  if (subscription.trialEndDate instanceof Timestamp) {
    trialEndDate = subscription.trialEndDate.toDate();
  } else if (typeof subscription.trialEndDate === 'object' && 
             subscription.trialEndDate !== null) {
    // Use type assertion to access toDate safely
    const trialDate = subscription.trialEndDate as any;
    if (trialDate.toDate && typeof trialDate.toDate === 'function') {
      trialEndDate = trialDate.toDate();
    } else {
      trialEndDate = new Date(trialDate);
    }
  } else {
    trialEndDate = new Date(subscription.trialEndDate as any);
  }
  
  return new Date() < trialEndDate;
};

/**
 * Calculates the savings amount when paying yearly vs monthly
 */
export const calculateYearlySavings = (monthlyPrice: number): number => {
  const yearlyPrice = monthlyPrice * 10; // 2 months free
  const monthlyCostForYear = monthlyPrice * 12;
  return monthlyCostForYear - yearlyPrice;
};