import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import BusinessSettingsLayout from '../../components/business-settings/BusinessSettingsLayout';
import BusinessProfileForm from '../../components/business-settings/BusinessProfileForm';
import BusinessBranding from '../../components/settings/BusinessBranding';
import NotificationSettings from '../../components/settings/NotificationSettings';
import AccountSecurity from '../../components/settings/AccountSecurity';
import BusinessUsers from '../../components/settings/BusinessUsers';
import RegionalSettings from '../../components/settings/RegionalSettings';
import CustomerPreviewPanel from '../../components/business-settings/CustomerPreviewPanel';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [refreshPreview, setRefreshPreview] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(20);

  // Get view mode from dashboard context
  const dashboardContext = useDashboardContext();
  const isSimpleView = dashboardContext?.viewMode === 'simple';

  // Check if we're on the simple settings route
  const isSimpleRoute = location.pathname.includes('/simple');

  // Function to trigger a refresh of the preview
  const handleSettingsUpdate = () => {
    setRefreshPreview(prev => prev + 1);
  };

  // Update completion percentage based on active tab
  const handleProfileCompletion = (percentage: number) => {
    setCompletionPercentage(prev => {
      // Store the highest completion percentage for each tab
      const profilePercentage = activeTab === 'profile' ? percentage : prev;
      return profilePercentage;
    });
  };

  // Handle back button navigation
  const handleBackClick = () => {
    if (isSimpleRoute || isSimpleView) {
      navigate('/business/dashboard/simple');
    } else {
      navigate('/business/dashboard');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BusinessProfileForm
                onUpdate={handleSettingsUpdate}
                onProfileCompletion={handleProfileCompletion}
              />
            </div>
            {!isSimpleView && (
              <div className="lg:col-span-1">
                <CustomerPreviewPanel
                  refreshTrigger={refreshPreview}
                  previewType="mobile"
                />
              </div>
            )}
          </div>
        );
      case 'branding':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BusinessBranding onUpdate={handleSettingsUpdate} />
            </div>
            {!isSimpleView && (
              <div className="lg:col-span-1">
                <CustomerPreviewPanel
                  refreshTrigger={refreshPreview}
                  previewType="coupon"
                />
              </div>
            )}
          </div>
        );
      case 'team':
        return (
          <div className="mb-8">
            <BusinessUsers />
          </div>
        );
      case 'notifications':
        return (
          <div className="mb-8">
            <NotificationSettings />
          </div>
        );
      case 'security':
        return (
          <div className="mb-8">
            <AccountSecurity />
          </div>
        );
      case 'regional':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RegionalSettings onUpdate={handleSettingsUpdate} />
            </div>
            {!isSimpleView && (
              <div className="lg:col-span-1">
                <CustomerPreviewPanel
                  refreshTrigger={refreshPreview}
                  previewType="mobile"
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Back button for simple view */}
      {(isSimpleRoute || isSimpleView) && (
        <div className="mb-6 px-6 pt-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      )}

      <BusinessSettingsLayout
        isSimpleView={isSimpleView}
        activeTab={activeTab}
        completionPercentage={completionPercentage}
      >
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px min-w-max">
            <button
              onClick={() => setActiveTab('profile')}
              className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📋 Business Profile
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'branding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              🎨 Branding
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'team'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              👥 Team Members
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              🔔 Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              🔒 Account Security
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'regional'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              🌍 Regional Settings
            </button>
          </nav>
        </div>

        {renderTabContent()}

        {isSimpleView && refreshPreview > 0 && (
          <div className="mt-8">
            <CustomerPreviewPanel
              refreshTrigger={refreshPreview}
              previewType={activeTab === 'branding' ? 'coupon' : 'mobile'}
            />
          </div>
        )}
      </BusinessSettingsLayout>
    </div>
  );
};

export default Settings;