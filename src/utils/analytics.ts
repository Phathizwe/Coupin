import { logAnalyticsEvent } from '../config/firebase';

// User events
export const logUserSignIn = (method: string) => {
  logAnalyticsEvent('login', { method });
};

export const logUserSignUp = (method: string) => {
  logAnalyticsEvent('sign_up', { method });
};

// Coupon events
export const logCouponCreated = (couponId: string, couponType: string) => {
  logAnalyticsEvent('coupon_created', { coupon_id: couponId, coupon_type: couponType });
};

export const logCouponRedeemed = (couponId: string, customerId: string) => {
  logAnalyticsEvent('coupon_redeemed', { coupon_id: couponId, customer_id: customerId });
};

// Page view events
export const logPageView = (pageName: string, pageClass?: string) => {
  logAnalyticsEvent('page_view', { page_name: pageName, page_class: pageClass });
};

// Feature usage events
export const logFeatureUsed = (featureName: string, additionalParams?: Record<string, any>) => {
  logAnalyticsEvent('feature_used', { feature_name: featureName, ...additionalParams });
};