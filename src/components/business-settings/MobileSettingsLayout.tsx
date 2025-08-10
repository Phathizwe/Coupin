import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import styles from './styles/mobile-layout.module.css';

interface MobileSettingsLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  completionPercentage?: number;
  onTabChange?: (tab: string) => void;
}

const MobileSettingsLayout: React.FC<MobileSettingsLayoutProps> = ({
  children,
  activeTab = 'profile',
  completionPercentage = 0,
  onTabChange
}) => {
  const [showTabMenu, setShowTabMenu] = useState(false);

  // Map tabs to sections for completion tracking
  const tabToSection = {
    profile: { name: 'Basic Info', icon: '📋' },
    branding: { name: 'Branding', icon: '🎨' },
    team: { name: 'Team Members', icon: '👥' },
    notifications: { name: 'Notifications', icon: '🔔' },
    security: { name: 'Security', icon: '🔒' },
    regional: { name: 'Regional Settings', icon: '🌍' }
  };

  // Determine which sections are complete based on percentage
  const completedSections = [
    completionPercentage >= 20, // Basic Info
    completionPercentage >= 40, // Branding
    completionPercentage >= 60, // Team Members
    completionPercentage >= 80, // Notifications
    completionPercentage >= 100 // Security
  ];

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setShowTabMenu(false);
};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Your Brand Studio</h1>
          <p className={styles.subtitle}>Shape how customers see your business</p>
        </div>
      </header>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${completionPercentage}%` }}
        />
        <span className={styles.progressText}>{completionPercentage}% Complete</span>
      </div>

      <div className={styles.tabSelector}>
        <button 
          className={styles.tabSelectorButton}
          onClick={() => setShowTabMenu(!showTabMenu)}
        >
          {tabToSection[activeTab as keyof typeof tabToSection]?.icon || '📋'} 
          {tabToSection[activeTab as keyof typeof tabToSection]?.name || 'Basic Info'}
          <span className={styles.dropdownIcon}>{showTabMenu ? '▲' : '▼'}</span>
        </button>
        
        {showTabMenu && (
          <div className={styles.tabMenu}>
            {Object.entries(tabToSection).map(([tab, { name, icon }], index) => (
              <button
                key={tab}
                className={cn(
                  styles.tabMenuItem,
                  activeTab === tab ? styles.activeTab : '',
                  completedSections[index] ? styles.completedTab : ''
                )}
                onClick={() => handleTabClick(tab)}
              >
                <span className={styles.tabIcon}>
                  {icon}
                </span>
                <span className={styles.tabName}>
                  {name}
                </span>
                <span className={styles.tabStatus}>
                  {completedSections[index] ? '✅' : index === completedSections.findIndex(s => !s) ? '⏳' : '❌'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default MobileSettingsLayout;