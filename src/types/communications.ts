import { Timestamp } from 'firebase/firestore';

export interface Channel {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  isConfigured: boolean;
  settings: Record<string, any>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LoadingState {
  campaigns: boolean;
  templates: boolean;
  channels: boolean;
}