import React, { useState, useEffect } from 'react';
import styles from '../../styles/settings-dashboard/layout.module.css';
import SectionCard from './SectionCard';
import { useAuth } from '../../hooks/useAuth';
import useProgressTracker from './hooks/useProgressTracker';

interface SettingsLayoutProps {
  children?: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const { businessProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const { completionPercentage, sectionStatus } = useProgressTracker(businessProfile);
  const [showCelebration, setShowCelebration] = useState(false);

  // Sections configuration
  const sections = [
    { id: 'profile', title: 'Business Profile', icon: '🏢' },
    { id: 'branding', title: 'Branding', icon: '🎨' },
    { id: 'team', title: 'Team Members', icon: '👥' },
    { id: 'notifications', title: 'Notifications', icon: '🔔' },
    { id: 'security', title: 'Security', icon: '🔒' }
  ];

  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);

    // Scroll to section
    const sectionElement = document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show celebration when reaching milestones
  useEffect(() => {
    if (completionPercentage === 100 ||
      (completionPercentage >= 75 && completionPercentage < 80) ||
      (completionPercentage >= 50 && completionPercentage < 55) ||
      (completionPercentage >= 25 && completionPercentage < 30)) {
      setShowCelebration(true);

      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [completionPercentage]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Your Brand Studio</h1>
          <p className={styles.subtitle}>Shape how customers see your business</p>
        </div>
      </header>

      <main className={styles.content}>
        {sections.map(section => (
          <SectionCard
            key={section.id}
            id={`section-${section.id}`}
            title={section.title}
            icon={section.icon}
            isActive={activeSection === section.id}
            isCompleted={sectionStatus[section.id]?.completed || false}
            completionPercentage={sectionStatus[section.id]?.percentage || 0}
            onClick={() => handleSectionChange(section.id)}
          >
            {activeSection === section.id && children}
          </SectionCard>
        ))}
      </main>
    </div>
  );
};

export default SettingsLayout;