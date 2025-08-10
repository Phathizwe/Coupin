import React, { useState } from 'react';
import styles from '../../styles/settings-dashboard/forms.module.css';

interface CollapsibleFormProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleForm: React.FC<CollapsibleFormProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className={styles.collapsibleForm}>
      <button 
        className={styles.collapsibleHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {icon && <span className={styles.formIcon}>{icon}</span>}
        <span className={styles.formTitle}>{title}</span>
        <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      {isExpanded && (
        <div className={styles.collapsibleContent}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleForm;