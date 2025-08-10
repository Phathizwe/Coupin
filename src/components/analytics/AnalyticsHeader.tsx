import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './AnalyticsIcons';
import { EmotionalGreeting, EmotionalButton, EmotionalSelect } from './EmotionalAnimations';
import { useAuth } from '../../hooks/useAuth';
import './emotionalDesign.css';

interface AnalyticsHeaderProps {
  title: string;
  timeframe: string;
  onTimeframeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  title,
  timeframe,
  onTimeframeChange
}) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');

  // Get user's first name for personalized greeting
  useEffect(() => {
    if (user?.displayName) {
      const firstName = user.displayName.split(' ')[0];
      setUserName(firstName);
    } else if (user?.email) {
      const emailName = user.email.split('@')[0];
      setUserName(emailName);
    }
  }, [user]);

  // Define timeframe options for the select dropdown
  const timeframeOptions = [
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 90 days' },
    { value: 'thisyear', label: 'This year' },
    { value: 'alltime', label: 'All time' }
  ];
  
  // Handle download button click
  const handleDownload = () => {
    // Placeholder for download functionality
    console.log('Download analytics data');
    // In a real implementation, this would trigger a CSV or PDF download
    alert('Analytics data download started');
  };

  return (
    <div className="mb-8">
      {/* Personal greeting based on time of day */}
      <EmotionalGreeting userName={userName} className="mb-6" />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        
        <div className="flex space-x-3">
          {/* Enhanced select dropdown */}
          <EmotionalSelect
            value={timeframe}
            onChange={onTimeframeChange}
            options={timeframeOptions}
            className="w-40"
          />
          
          {/* Enhanced download button with onClick handler */}
          <EmotionalButton
            variant="secondary"
            size="md"
            className="flex items-center justify-center"
            aria-label="Download analytics data"
            data-tooltip="Download analytics report"
            onClick={handleDownload}
          >
            <DownloadIcon className="w-5 h-5" />
          </EmotionalButton>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;