import React, { useState, useEffect } from 'react';
import styles from './styles/form.module.css';

interface SaveButtonProps {
  isLoading: boolean;
  isSuccess: boolean;
  completionPercentage: number;
}

const SaveButton: React.FC<SaveButtonProps> = ({ 
  isLoading, 
  isSuccess,
  completionPercentage 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (isSuccess) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, [isSuccess]);
  
  // Determine button text based on completion and state
  const getButtonText = () => {
    if (isLoading) return 'Saving...';
    if (isSuccess) return 'Saved Successfully!';
    
    if (completionPercentage < 50) {
      return 'Save Progress';
    } else if (completionPercentage < 100) {
      return 'Save Your Brand Identity';
    } else {
      return 'Save Your Complete Brand';
    }
  };

  return (
    <div className={styles.saveButtonContainer}>
      <button 
        type="submit" 
        className={`
          ${styles.saveButton}
          ${isLoading ? styles.loading : ''}
          ${isSuccess ? styles.success : ''}
          ${completionPercentage >= 100 ? styles.complete : ''}
        `}
        disabled={isLoading}
      >
        {isLoading && (
          <span className={styles.spinner}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="3"
              />
            </svg>
          </span>
        )}
        
        {isSuccess && (
          <span className={styles.checkmark}>✓</span>
        )}
        
        <span className={styles.buttonText}>{getButtonText()}</span>
      </button>
      
      {showConfetti && (
        <div className={styles.confetti}>
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className={styles.confettiPiece}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: [
                  '#2563EB', // Blue
                  '#10B981', // Green
                  '#F59E0B', // Yellow
                  '#EF4444', // Red
                  '#8B5CF6'  // Purple
                ][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}
      
      {completionPercentage >= 100 && !isLoading && !isSuccess && (
        <div className={styles.completeBadge}>
          100% Complete
        </div>
      )}
    </div>
  );
};

export default SaveButton;