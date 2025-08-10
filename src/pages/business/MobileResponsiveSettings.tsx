import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ResponsiveSettingsLayout from '../../components/business-settings/ResponsiveSettingsLayout';
import BusinessProfileForm from '../../components/settings/BusinessProfileForm';
import BusinessBranding from '../../components/settings/BusinessBranding';
import BusinessUsers from '../../components/settings/BusinessUsers';
import NotificationSettings from '../../components/settings/NotificationSettings';
import AccountSecurity from '../../components/settings/AccountSecurity';
import RegionalSettings from '../../components/settings/RegionalSettings';

const MobileResponsiveSettings: React.FC = () => {
  const { businessProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [completionPercentage, setCompletionPercentage] = useState(70); // Default value for demo

  // Calculate completion percentage based on profile data
  React.useEffect(() => {
    if (businessProfile) {
      let completed = 0;
      let total = 0;

      // Basic profile fields
      const profileFields = [
        'businessName', 'email', 'phone', 'address', 'website', 'description', 'industry'
      ];

      profileFields.forEach(field => {
        total++;
        if (businessProfile[field as keyof typeof businessProfile]) {
          completed++;
        }
      });

      // Branding
      total += 2; // Logo and colors
      if (businessProfile.logo) completed++;
      if (businessProfile.colors?.primary) completed++;

      // Calculate percentage
      const percentage = Math.floor((completed / total) * 100);
      setCompletionPercentage(percentage);
    }
  }, [businessProfile]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <BusinessProfileForm />;
      case 'branding':
        return <BusinessBranding />;
      case 'team':
        return <BusinessUsers />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <AccountSecurity />;
      case 'regional':
        return <RegionalSettings />;
      default:
        return <BusinessProfileForm />;
    }
  };

  return (
    <ResponsiveSettingsLayout
      activeTab={activeTab}
      completionPercentage={completionPercentage}
      onTabChange={handleTabChange}
      isSimpleView={true}
    >
      {renderContent()}
    </ResponsiveSettingsLayout>
  );
};

export default MobileResponsiveSettings;