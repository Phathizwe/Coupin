import { PricingPlan } from '@/types/billing.types';
import { Currency } from '@/services/currencyService';

export interface NotificationState {
  error: string | null;
  success: string | null;
}

export interface PricingManagerState {
  plans: PricingPlan[];
  currencies: Currency[];
  loading: boolean;
  editingPlan: PricingPlan | null;
  notification: NotificationState;
  isManagingOrder: boolean;
}