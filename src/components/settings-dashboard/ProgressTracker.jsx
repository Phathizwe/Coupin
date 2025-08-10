import React, { useEffect, useRef } from 'react';
import styles from '../../styles/settings-dashboard/progress-tracker.module.css';

const ProgressTracker = ({ 
  percentage, 
  showCelebration = false,
  completedSections = [],
  incompleteSections = []
}) => {
  const circleRef = useRef(null);
  
  // Update progress circle
  useEffect(() => {
    if (circleRef.current) {
      const circumference = 2 * Math.PI * 40; // Circle radius is 40
      const offset = circumference - (percentage / 100) * circumference;
      
      // Animate the progress
      circleRef.current.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
      circleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [percentage]);

  // Get encouraging message based on completion percentage
  const getEncouragingMessage = () => {
    if (percentage === 100) {
      return "Perfect! Your profile is complete! 🎉";
    } else if (percentage >= 75) {
      return "Almost there! Just a few more steps to go! 🚀";
    } else if (percentage >= 50) {
      return "You're making great progress! Keep it up! ✨";
    } else if (percentage >= 25) {
      return "Good start! Keep building your profile! 💪";
    } else {
      return "Let's start building your brand profile! 🏗️";
    }
  };

  return (
    <div className={styles.progressContainer}>
      <div className={`${styles.progressRing} ${showCelebration ? styles.celebrate : ''}`}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            className={styles.progressBackground}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
          />
          <circle
            ref={circleRef}
            className={styles.progressForeground}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className={styles.progressPercentage}>
          {percentage}%
        </div>
        
        {showCelebration && (
          <div className={styles.confetti}>
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={styles.confettiPiece} 
                style={{ 
                  '--delay': `${i * 0.1}s`,
                  '--angle': `${Math.random() * 360}deg`,
                  '--distance': `${Math.random() * 50 + 50}px`
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.sectionsList}>
        {completedSections.map((section, index) => (
          <div key={index} className={styles.sectionItem}>
            <span className={styles.checkIcon}>✓</span>
            <span className={styles.sectionName}>{section}</span>
          </div>
        ))}
        
        {incompleteSections.map((section, index) => (
          <div key={index} className={styles.sectionItem}>
            <span className={styles.crossIcon}>✗</span>
            <span className={styles.sectionName}>{section}</span>
          </div>
        ))}
      </div>
      
      <p className={styles.encouragingMessage}>
        {getEncouragingMessage()}
      </p>
    </div>
  );
};

export default ProgressTracker;