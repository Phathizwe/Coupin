import { Coupon } from '../../types';

// Form data type definition
export type CouponFormData = {
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buyXgetY' | 'freeItem';
  value: number;
  buyQuantity: number;
  getQuantity: number;
  freeItem: string;
  minPurchase: number;
  maxDiscount: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number | undefined;
  customerLimit: number;
  firstTimeOnly: boolean;
  birthdayOnly: boolean;
  active: boolean;
  code: string;
  termsAndConditions: string;
  branding: {
    backgroundColor: string | undefined;
    textColor: string | undefined;
    logo: string | undefined;
  };
};

// Get initial form state
export const getInitialFormState = (): CouponFormData => ({
  title: '',
  description: '',
  type: 'percentage',
  value: 10,
  buyQuantity: 1,
  getQuantity: 1,
  freeItem: '',
  minPurchase: 0,
  maxDiscount: 0,
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  usageLimit: undefined,
  customerLimit: 1,
  firstTimeOnly: false,
  birthdayOnly: false,
  active: true,
  code: '',
  termsAndConditions: '',
  branding: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    logo: undefined
  }
});

// Helper function to safely merge template data with form state
export const mergeTemplateData = (initialState: CouponFormData, templateData: Partial<Coupon>): CouponFormData => {
  return {
    ...initialState,
    ...templateData,
    // Ensure branding is properly merged
    branding: {
      backgroundColor: templateData.branding?.backgroundColor ?? initialState.branding.backgroundColor,
      textColor: templateData.branding?.textColor ?? initialState.branding.textColor,
      logo: templateData.branding?.logo ?? initialState.branding.logo,
    },
    // Ensure dates are Date objects
    startDate: templateData.startDate ? new Date(templateData.startDate) : initialState.startDate,
    endDate: templateData.endDate ? new Date(templateData.endDate) : initialState.endDate,
  };
};

// Validate form data
export const validateCouponForm = (formData: CouponFormData): { isValid: boolean; errorMessage: string } => {
  if (!formData.title.trim()) {
    return { isValid: false, errorMessage: 'Coupon title is required' };
  }
  if (!formData.code.trim()) {
    return { isValid: false, errorMessage: 'Coupon code is required' };
  }
  if (formData.startDate >= formData.endDate) {
    return { isValid: false, errorMessage: 'End date must be after start date' };
  }
  if (formData.type === 'freeItem' && !formData.freeItem.trim()) {
    return { isValid: false, errorMessage: 'Free item description is required' };
  }
  return { isValid: true, errorMessage: '' };
};