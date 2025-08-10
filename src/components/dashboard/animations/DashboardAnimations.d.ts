export type MascotState = 'welcoming' | 'celebrating' | 'encouraging' | 'grateful';

export interface MascotProps {
  state: MascotState;
  interactionCount: number;
}

export interface CelebrationOverlayProps {
  show: boolean;
  colors: string[];
}

export interface AchievementNotificationProps {
  show: boolean;
  title: string;
  message: string;
}