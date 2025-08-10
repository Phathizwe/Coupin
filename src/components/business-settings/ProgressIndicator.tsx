import React, { useEffect, useRef } from 'react';
import styles from './styles/layout.module.css';

interface ProgressIndicatorProps {
  percentage: number;
  activeTab: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ percentage, activeTab }) => {
  const ringRef = useRef<SVGCircleElement>(null);
  const prevPercentageRef = useRef<number>(0);

  useEffect(() => {
    if (ringRef.current) {
      const circumference = 2 * Math.PI * 45; // radius is 45
      const offset = circumference - (percentage / 100) * circumference;

      // Add a slight delay to make the animation noticeable
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.strokeDashoffset = `${offset}`;

          // Add bounce effect at milestones
          if (
            (percentage >= 25 && prevPercentageRef.current < 25) ||
            (percentage >= 50 && prevPercentageRef.current < 50) ||
            (percentage >= 75 && prevPercentageRef.current < 75) ||
            (percentage === 100 && prevPercentageRef.current < 100)
          ) {
            ringRef.current.classList.add(styles.milestone);
            setTimeout(() => {
              if (ringRef.current) {
                ringRef.current.classList.remove(styles.milestone);
              }
            }, 1000);
          }
        }
      }, 200);

      prevPercentageRef.current = percentage;
    }
  }, [percentage]);

  // Map tabs to sections for completion tracking
  const tabToSection = {
    profile: 'Basic Info',
    branding: 'Branding',
    team: 'Team Members',
    notifications: 'Notifications',
    security: 'Security',
    regional: 'Regional Settings'
  };

  // Determine which sections are complete based on percentage
  const completedSections = [
    percentage >= 20, // Basic Info
    percentage >= 40, // Branding
    percentage >= 60, // Team Members
    percentage >= 80, // Notifications
    percentage >= 100 // Security
  ];

  return (
    <div className={styles.progressIndicator}>
      <div className={styles.progressRing}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            className={styles.progressBackground}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
          />
          <circle
            ref={ringRef}
            className={styles.progressForeground}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className={styles.progressPercentage}>
          {percentage}%
        </div>
      </div>

      <div className={styles.progressSections}>
        {Object.entries(tabToSection).map(([tab, label], index) => (
          <div
            key={tab}
            className={`${styles.progressSection} ${completedSections[index] ? styles.completed : ''
              } ${activeTab === tab ? styles.active : ''}`}
          >
            <span className={styles.sectionIcon}>
              {completedSections[index] ? '✅' : index === completedSections.findIndex(s => !s) ? '⏳' : '❌'}
            </span>
            <span className={styles.sectionLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;