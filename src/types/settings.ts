import { ComponentType } from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  component: ComponentType;
}