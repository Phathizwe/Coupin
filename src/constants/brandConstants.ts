/**
 * TYCA Brand Constants
 * 
 * This file contains all brand-related constants and messaging for TYCA
 * (Thank You, Come Again) customer retention platform.
 */

// Core brand colors
export const BRAND_COLORS = {
  primary: {
    50: '#E9F0E9',
    100: '#D3E1D3',
    200: '#BDD2BD',
    300: '#A8C69F', // Accent: Light sage green
    400: '#8FB78F',
    500: '#6FA86F',
    600: '#4C8E4C',
    700: '#2C5530', // Primary: Deep teal/forest green
    800: '#1F3E23',
    900: '#132716',
  },
  secondary: {
    50: '#FFF5EC',
    100: '#FFE9D3',
    200: '#FFD9B3',
    300: '#FFC993',
    400: '#FFB973',
    500: '#FFA84D',
    600: '#FF8C42', // Secondary: Warm orange/amber
    700: '#E67A2E',
    800: '#CC691A',
    900: '#B35806',
  },
  accent: {
    50: '#F0F7ED',
    100: '#E1EFDB',
    200: '#C3DFB7',
    300: '#A8C69F', // Accent: Light sage green
    400: '#8FB88C',
    500: '#76AA78',
    600: '#5D9C65',
    700: '#447D4E',
    800: '#2B5E37',
    900: '#123F20',
    DEFAULT: '#A8C69F',
    light: '#E1EFDB',
    dark: '#447D4E',
  },
  success: '#2C5530',
  warning: '#FF8C42',
  error: '#E74C3C',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

// Core brand messaging
export const BRAND = {
  name: "TYCA",
  fullName: "Thank You Come Again",
  tagline: "Value Coming Back",
  shortTagline: "Value Coming Back",
};

// Brand messaging variations for different contexts
export const BRAND_MESSAGES = {
  // Welcome messages
  welcome: {
    standard: "Thank you for choosing us - We value you coming back",
    dashboard: "Thank you for growing with TYCA - value coming back to your business",
    login: "Thank you for returning - We value you coming back",
    register: "Thank you for joining - value coming back to your business",
  },
  // Success notifications
  success: {
    standard: "Thank you! Your customers will value coming back",
    couponCreated: "Thank you! May your coupon bring value back",
    customerAdded: "Thank you! New customers mean value is coming back",
    settingsUpdated: "Thank you! Your changes bring value",
  },
  // Email templates
  email: {
    standard: "Thank you for your business, we value you coming back",
    welcome: "Thank you for choosing TYCA, we value you coming back",
    couponSent: "Thank you for sharing value, may your customers come again",
    reminder: "Thank you for being with us, we value you coming back",
  },
  // Dashboard greetings
  dashboard: {
    morning: "Good morning! Thank you for starting your day with TYCA - We value you coming back",
    afternoon: "Good afternoon! Thank you for choosing TYCA - We value you coming back",
    evening: "Good evening! Thank you for your hard work - We value you coming back tomorrow",
    standard: "Thank you for growing with TYCA - value coming back to your business",
  },
  // Customer-facing messages
  customer: {
    standard: "Thank you, come again!",
    coupon: "Thank you for your business, come again for more value!",
    loyalty: "Thank you for your loyalty, we value you coming back",
    welcome: "Thank you for joining, come again for more value!",
  },
  // Value propositions
  value: {
    standard: "When customers value coming back, your business grows",
    retention: "Turn every 'Thank You' into 'Thank You, Come Again'",
    loyalty: "Create experiences where customers thank you, and value coming back",
    growth: "When customers value coming back, your revenue grows consistently",
  },
  // South African localization
  southAfrican: {
    standard: "Thank you, come again!",
    friendly: "Thank you, come again, friend!",
    local: "Thank you for supporting local, come again!",
  },
  // Call-to-actions
  cta: {
    standard: "Thank you for your interest - discover the value of coming back",
    register: "Thank you for considering us - start creating value today",
    upgrade: "Thank you for your loyalty - unlock more value by upgrading",
    contact: "Thank you for reaching out - we value your inquiry",
  },
};

// South African specific constants
export const SOUTH_AFRICAN = {
  currency: "R", // Rand symbol
  phoneFormat: "+27", // South African phone format
  paymentMethods: ["Yoco", "SnapScan", "Zapper", "EFT", "Credit Card"],
  greetings: ["Thank you, come again!", "Thank you, come again, friend!"],
};

// Export ANIMATIONS object
export const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  hover: {
    scale: 'hover:scale-105',
    glow: 'hover:shadow-lg',
    pulse: 'hover:animate-pulse',
  },
  celebrate: {
    confetti: 'animate-confetti',
    bounce: 'animate-bounce',
    tada: 'animate-tada',
  }
};

export const EMOTIONAL_MESSAGES = {
  welcome: {
    returning: "Welcome back, savings superstar! 🌟",
    new: "Ready to start saving? Let's make it happen! 💪",
    achievement: "Look at you go! Your wallet is thanking you! 💰"
  },
  encouragement: {
    browsing: "So many ways to save! Pick your favorite 🎯",
    copying: "Smart choice! This code is ready to work for you 📋",
    redeeming: "Boom! Another successful save! You're amazing! 🎉"
  },
  celebration: {
    firstSave: "Your first save! This is just the beginning! 🚀",
    milestone: "Incredible! You've saved [amount] this month! 🏆",
    streak: "On fire! [X] days of smart saving! 🔥"
  }
};

export const MASCOT_STATES = {
  welcoming: '👋',
  encouraging: '👍',
  celebrating: '🎉',
  grateful: '🙏',
};