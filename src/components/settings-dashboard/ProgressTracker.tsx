import React, { useEffect, useRef } from 'react';
import styles from '../styles/settings-dashboard/progress-tracker.module.css';

interface ProgressTrackerProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className={styles.progressTracker}>
      {steps.map((step, index) => (
        <div 
          key={index}
          className={`
            ${styles.step}
            ${index < currentStep ? styles.completed : ''}
            ${index === currentStep ? styles.current : ''}
          `}
          onClick={() => onStepClick && onStepClick(index)}
        >
          <div className={styles.stepNumber}>
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div className={styles.stepLabel}>{step}</div>
          {index < steps.length - 1 && <div className={styles.connector} />}
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;