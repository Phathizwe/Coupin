import React, { useState, useEffect } from 'react';
import BusinessSettingsLayout from './BusinessSettingsLayout';
import MobileSettingsLayout from './MobileSettingsLayout';
import CustomerPreviewPanel from './CustomerPreviewPanel';
import MobileCustomerPreviewPanel from './MobileCustomerPreviewPanel';

interface ResponsiveSettingsLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  completionPercentage?: number;
  onTabChange?: (tab: string) => void;
  isSimpleView?: boolean;
}

const ResponsiveSettingsLayout: React.FC<ResponsiveSettingsLayoutProps> = ({
  children,
  activeTab = 'profile',
  completionPercentage = 0,
  onTabChange,
  isSimpleView = false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Refresh preview when form data changes
  useEffect(() => {
    // This would normally be triggered by form changes
    // For demo purposes, we'll refresh every 5 seconds
    const timer = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (isMobile) {
    return (
      <MobileSettingsLayout 
        activeTab={activeTab} 
        completionPercentage={completionPercentage}
        onTabChange={onTabChange}
      >
        {children}
        
        <MobileCustomerPreviewPanel 
          refreshTrigger={refreshTrigger} 
          previewType="mobile" 
        />
      </MobileSettingsLayout>
    );
  }
  
  return (
    <BusinessSettingsLayout 
      isSimpleView={isSimpleView} 
      activeTab={activeTab}
      completionPercentage={completionPercentage}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 350px', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        <div>{children}</div>
        
        <CustomerPreviewPanel 
          refreshTrigger={refreshTrigger} 
          previewType="mobile" 
        />
      </div>
    </BusinessSettingsLayout>
  );
};

export default ResponsiveSettingsLayout;