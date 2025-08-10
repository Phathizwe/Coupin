import { useState, useEffect } from 'react';

interface BusinessProfile {
  businessName?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  [key: string]: any;
}

interface SectionStatus {
  [key: string]: {
    completed: boolean;
    percentage: number;
  };
}

const useProgressTracker = (businessProfile: BusinessProfile | null) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({
    profile: { completed: false, percentage: 0 },
    branding: { completed: false, percentage: 0 },
    team: { completed: false, percentage: 0 },
    notifications: { completed: false, percentage: 0 },
    security: { completed: false, percentage: 0 }
  });
  
  useEffect(() => {
    if (!businessProfile) return;
    
    // Calculate profile section completion
    const profileFields = [
      'businessName', 'description', 'email', 'phone', 'address', 'website', 'industry'
    ];
    let profileCompleted = 0;
    profileFields.forEach(field => {
      if (businessProfile[field]) profileCompleted++;
    });
    const profilePercentage = Math.round((profileCompleted / profileFields.length) * 100);
    
    // Calculate branding section completion
    let brandingCompleted = 0;
    const brandingFields = 2; // Logo and colors
    if (businessProfile.logo) brandingCompleted++;
    if (businessProfile.colors?.primary) brandingCompleted++;
    const brandingPercentage = Math.round((brandingCompleted / brandingFields) * 100);
    
    // For demo purposes, set other sections with mock data
    // In a real app, you would calculate these based on actual data
    const teamPercentage: number = 66;
    const notificationsPercentage: number = 50;
    const securityPercentage: number = 100;
    
    // Update section status
    const updatedSectionStatus = {
      profile: { 
        completed: profilePercentage === 100, 
        percentage: profilePercentage 
      },
      branding: { 
        completed: brandingPercentage === 100, 
        percentage: brandingPercentage 
      },
      team: { 
        completed: teamPercentage >= 100, // Fixed comparison
        percentage: teamPercentage 
      },
      notifications: { 
        completed: notificationsPercentage >= 100, // Fixed comparison
        percentage: notificationsPercentage 
      },
      security: { 
        completed: securityPercentage >= 100, 
        percentage: securityPercentage 
      }
    };
    
    setSectionStatus(updatedSectionStatus);
    
    // Calculate overall completion percentage
    const totalPercentage = (
      profilePercentage + 
      brandingPercentage + 
      teamPercentage + 
      notificationsPercentage + 
      securityPercentage
    ) / 5;
    
    setCompletionPercentage(Math.round(totalPercentage));
  }, [businessProfile]);
  
  return { completionPercentage, sectionStatus };
};

export default useProgressTracker;