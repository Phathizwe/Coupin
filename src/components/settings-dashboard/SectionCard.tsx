import React, { useState } from 'react';
import styles from '../styles/settings-dashboard/card.module.css';
import SaveButton from './SaveButton';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
  icon: string;
  isActive: boolean;
  isCompleted: boolean;
  completionPercentage: number;
  onClick: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  id,
  icon,
  isActive,
  isCompleted,
  completionPercentage,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onClick();
    }
  };
  
  // Handle save
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };
  
  return (
    <section 
      id={id}
      className={`${styles.sectionCard} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
    >
      <div className={styles.cardHeader} onClick={toggleExpand}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>{icon}</span>
          <h2 className={styles.cardTitle}>{title}</h2>
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
        <div className={styles.cardContent}>
          {description && <p className={styles.cardDescription}>{description}</p>}
            {children}
          
          <div className={styles.cardFooter}>
            <SaveButton 
              onClick={handleSave} 
              isLoading={isSaving}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default SectionCard;