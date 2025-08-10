import React, { useState } from 'react';
import styles from '../../styles/settings-dashboard/card.module.css';

const SectionCard = ({
  id,
  title,
  icon,
  isActive,
  isCompleted,
  completionPercentage,
  onClick,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  
  // Handle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onClick();
    }
  };
  
  return (
    <div 
      id={id}
      className={`${styles.card} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
    >
      <div className={styles.cardHeader} onClick={toggleExpand}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>{icon}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.headerRight}>
          {isCompleted ? (
            <span className={styles.completedBadge}>✓ Completed</span>
          ) : (
            <div className={styles.miniProgress}>
              <div 
                className={styles.miniProgressFill} 
                style={{ width: `${completionPercentage}%` }}
              />
              <span className={styles.miniProgressText}>{completionPercentage}%</span>
            </div>
          )}
          
          <button className={styles.expandButton}>
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.cardBody}>
          <div className={styles.cardContent}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCard;