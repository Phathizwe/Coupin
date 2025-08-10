import React from 'react';
import styles from '../../styles/settings-dashboard/navbar.module.css';

const StickyNavBar = ({
  sections,
  activeSection,
  onSectionChange,
  sectionStatus
}) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {sections.map(section => (
          <button
            key={section.id}
            className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
            onClick={() => onSectionChange(section.id)}
            aria-label={section.title}
          >
            <div className={styles.navIcon}>
              {section.icon}
              {sectionStatus[section.id]?.completed && (
                <span className={styles.completedIndicator}>✓</span>
              )}
            </div>
            <span className={styles.navLabel}>{section.title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default StickyNavBar;