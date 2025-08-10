import React from 'react';
import { cn } from '../../lib/utils';
import ProgressIndicator from './ProgressIndicator';
import styles from './styles/layout.module.css';

interface BusinessSettingsLayoutProps {
  isSimpleView?: boolean;
  children: React.ReactNode;
  activeTab?: string;
  completionPercentage?: number;
}

const BusinessSettingsLayout: React.FC<BusinessSettingsLayoutProps> = ({
  isSimpleView = false,
  children,
  activeTab,
  completionPercentage = 0
}) => {
  return (
    <div className={cn(styles.container, isSimpleView ? styles.simpleView : styles.detailedView)}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Your Brand Studio</h1>
          <p className={styles.subtitle}>Shape how customers see your business</p>
        </div>
      </header>

      <div className={styles.progressContainer}>
        <ProgressIndicator
          percentage={completionPercentage}
          activeTab={activeTab || 'profile'}
        />

        {completionPercentage < 100 && (
          <p className={styles.progressMessage}>
            {completionPercentage >= 80
              ? "Almost there! Complete your profile to unlock full features"
              : "Keep going! Your brand profile is taking shape"}
          </p>
        )}

        {completionPercentage === 100 && (
          <p className={styles.completedMessage}>
            Perfect! Your brand profile is complete and looking great
          </p>
        )}
      </div>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default BusinessSettingsLayout;