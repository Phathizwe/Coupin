import { toast } from 'react-hot-toast';
import { BRAND_COLORS } from '../../../constants/brandConstants';

// Emotional design feedback system
export const EmotionalFeedback = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      className: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium',
      iconTheme: {
        primary: 'white',
        secondary: BRAND_COLORS.primary[700],
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      className: 'bg-gradient-to-r from-red-500 to-red-600 text-white font-medium',
      iconTheme: {
        primary: 'white',
        secondary: BRAND_COLORS.error,
      },
    });
  },
  
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium',
      icon: 'ℹ️',
    });
  },
  
  celebrate: (message: string) => {
    toast(message, {
      duration: 5000,
      className: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium',
      icon: '🎉',
    });
  }
};