import React, { useState } from 'react';
import styles from '../../styles/settings-dashboard/simple-settings.module.css';
import SectionCard from '../../components/settings-dashboard/SectionCard';
import BusinessProfileForm from '../../components/settings-dashboard/BusinessProfileForm';
import { useAuth } from '../../hooks/useAuth';

// Import components as any type to bypass TypeScript's type checking
const ProgressTracker = require('../../components/settings-dashboard/ProgressTracker.jsx').default as any;
const StickyNavBar = require('../../components/settings-dashboard/StickyNavBar.jsx').default as any;

// Define section type
interface Section {
  id: string;
  title: string;
  icon: string;
}

// Define section status type
interface SectionStatusMap {
  [key: string]: {
    completed: boolean;
    percentage: number;
  };
}

const SimpleSettings: React.FC = () => {
  const { businessProfile } = useAuth();
  // State for active section and completion data
  const [activeSection, setActiveSection] = useState('profile');
  const [completionData] = useState({
    percentage: 70,
    completedSections: ['Basic Info', 'Branding', 'Team Members'],
    incompleteSections: ['Notifications', 'Security', 'Regional Settings']
  });

  // Sections configuration
  const sections: Section[] = [
    { id: 'profile', title: 'Business Profile', icon: '🏢' },
    { id: 'branding', title: 'Branding', icon: '🎨' },
    { id: 'team', title: 'Team Members', icon: '👥' },
    { id: 'notifications', title: 'Notifications', icon: '🔔' },
    { id: 'security', title: 'Security', icon: '🔒' }
  ];

  // Section status mapping
  const sectionStatus: SectionStatusMap = {
    profile: { completed: true, percentage: 100 },
    branding: { completed: true, percentage: 100 },
    team: { completed: true, percentage: 100 },
    notifications: { completed: false, percentage: 50 },
    security: { completed: false, percentage: 0 }
  };

  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);

    // Scroll to section
    const sectionElement = document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render content based on active section
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'profile':
        return <BusinessProfileForm />;
      case 'branding':
        return <div className={styles.placeholderContent}>Branding content will go here</div>;
      case 'team':
        return <div className={styles.placeholderContent}>Team Members content will go here</div>;
      case 'notifications':
        return <div className={styles.placeholderContent}>Notifications content will go here</div>;
      case 'security':
        return <div className={styles.placeholderContent}>Security content will go here</div>;
      default:
        return <BusinessProfileForm />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header with back button */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => window.history.back()}>
          ← Back
        </button>

        {/* Toggle between Detailed and Simple view */}
        <div className={styles.viewToggle}>
          <button className={styles.detailedButton}>Detailed</button>
          <button className={`${styles.simpleButton} ${styles.active}`}>Simple</button>
        </div>

        {/* Logout button */}
        <button className={styles.logoutButton}>Logout</button>
      </div>

      {/* Main title */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Your Brand Studio</h1>
        <p className={styles.subtitle}>Shape how customers see your business</p>
      </div>

      {/* Progress tracker */}
      <ProgressTracker
        percentage={completionData.percentage}
        completedSections={completionData.completedSections}
        incompleteSections={completionData.incompleteSections}
        showCelebration={false}
      />

      {/* Main content with cards */}
      <div className={styles.cardsContainer}>
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
            {activeSection === section.id && renderSectionContent(section.id)}
          </SectionCard>
        ))}
      </div>

      {/* Sticky navigation for mobile */}
      <StickyNavBar
        sections={sections}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sectionStatus={sectionStatus}
      />
    </div>
  );
};

export default SimpleSettings;