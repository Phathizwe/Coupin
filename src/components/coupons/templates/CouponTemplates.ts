import { Coupon } from '../../../types';

// Template definitions for different coupon types
export const couponTemplates = {
  firstTime: {
    type: 'First-Time Customer Discount',
    data: {
      title: 'First-Time Customer Discount',
      description: 'Special offer for new customers only',
      type: 'percentage' as const,
      value: 15, // 15% off
      firstTimeOnly: true,
      minPurchase: 0,
      termsAndConditions: 'Valid for first-time customers only. Cannot be combined with other offers.',
      branding: {
        backgroundColor: '#f3f4f6',
        textColor: '#1f2937'
      }
    }
  },
  buyOneGetOne: {
    type: 'Buy One Get One Free',
    data: {
      title: 'Buy One Get One Free',
      description: 'Purchase one item and get another one free',
      type: 'buyXgetY' as const,
      buyQuantity: 1,
      getQuantity: 1,
      value: 100, // 100% off the second item
      firstTimeOnly: false,
      termsAndConditions: 'Second item must be of equal or lesser value. Cannot be combined with other offers.',
      branding: {
        backgroundColor: '#fee2e2',
        textColor: '#7f1d1d'
      }
    }
  },
  loyalty: {
    type: 'Loyalty Reward',
    data: {
      title: 'Loyalty Reward',
      description: 'Special discount for our loyal customers',
      type: 'percentage' as const,
      value: 20, // 20% off
      firstTimeOnly: false,
      minPurchase: 0,
      termsAndConditions: 'For returning customers only. Cannot be combined with other offers.',
      branding: {
        backgroundColor: '#e0f2fe',
        textColor: '#0c4a6e'
      }
    }
  }
};

export type CouponTemplateKey = keyof typeof couponTemplates;

export interface SelectedTemplate {
  type: string;
  data: Partial<Coupon>;
}