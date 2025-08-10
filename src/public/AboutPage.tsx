import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AboutContent from '@/components/about/AboutContent';
import Timeline from '@/components/about/Timeline';
import TimelineAdmin from '@/components/about/TimelineAdmin';
import { timelineService } from '@/services/timelineService';

const AboutPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin'; // Changed from 'business' to 'admin'
  const [refreshTimeline, setRefreshTimeline] = useState(false);

  // Initialize timeline with first entry if empty
  useEffect(() => {
    const initializeTimeline = async () => {
      const entries = await timelineService.getTimelineEntries();
      
      if (entries.length === 0) {
        await timelineService.addTimelineEntry({
          year: '2025',
          title: 'Built and Launched TYCA',
          description: 'TYCA was officially launched as a modern digital platform for small businesses.'
        });
      }
    };

    initializeTimeline();
  }, []);

  const handleEntryAdded = () => {
    setRefreshTimeline(prev => !prev);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* About Content */}
      <AboutContent />
      
      {/* Timeline Section */}
      <div className="bg-gray-50 py-12">
        {isAdmin && (
          <div className="container mx-auto px-4">
            <TimelineAdmin onEntryAdded={handleEntryAdded} />
          </div>
        )}
        
        <Timeline key={refreshTimeline ? 'refresh' : 'initial'} />
      </div>
    </div>
  );
};

export default AboutPage;