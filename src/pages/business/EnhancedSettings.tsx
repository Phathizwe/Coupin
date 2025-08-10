import React, { useState } from 'react';
import BusinessSettingsLayout from '../../components/business-settings/BusinessSettingsLayout';
import BusinessProfileForm from '../../components/business-settings/BusinessProfileForm';
import BusinessBranding from '../../components/settings/BusinessBranding';
import NotificationSettings from '../../components/settings/NotificationSettings';
import AccountSecurity from '../../components/settings/AccountSecurity';
import BusinessUsers from '../../components/settings/BusinessUsers';

const EnhancedSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');

  const handleViewModeChange = (mode: 'simple' | 'detailed') => {
    setViewMode(mode);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <BusinessProfileForm
          isSimpleView={viewMode === 'simple'}
          onUpdate={() => { }}
        />;
      case 'branding':
        return <BusinessBranding />;
      case 'team':
        return <BusinessUsers />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <AccountSecurity />;
      default:
        return null;
    }
  };

  return (
    <BusinessSettingsLayout>
      {renderContent()}
    </BusinessSettingsLayout>
  );
};

export default EnhancedSettings;