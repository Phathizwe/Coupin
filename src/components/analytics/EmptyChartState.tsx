import React from 'react';
import { EmotionalEmptyState } from './EmotionalAnimations';
import { PulseIcon } from './MicroInteractions';
import './emotionalDesign.css';

interface EmptyChartStateProps {
  icon: React.ReactNode;
  message: string;
  subMessage?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ 
  icon, 
  message, 
  subMessage,
  actionText,
  onAction
}) => {
  return (
    <EmotionalEmptyState
      icon={<PulseIcon>{icon}</PulseIcon>}
      message={message}
      subMessage={subMessage}
      actionText={actionText}
      onAction={onAction}
      className="py-8"
    />
  );
};

export default EmptyChartState;