import React, { useEffect, useState } from 'react';
import { TimelineEntry, timelineService } from '@/services/timelineService';
import { useAuth } from '@/hooks/useAuth';

const Timeline: React.FC = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin'; // Changed from 'business' to 'admin'

  useEffect(() => {
    const fetchTimelineEntries = async () => {
      setLoading(true);
      const timelineEntries = await timelineService.getTimelineEntries();
      setEntries(timelineEntries);
      setLoading(false);
    };

    fetchTimelineEntries();
  }, []);

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-secondary"></div>
            
            {/* Timeline entries */}
            <div className="space-y-12">
              {entries.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className="w-5/12">
                    <div className={`p-6 rounded-lg shadow-lg bg-white ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                      <h3 className="text-2xl font-bold text-gray-800">{entry.title}</h3>
                      {entry.description && (
                        <p className="mt-2 text-gray-600">{entry.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Year bubble */}
                  <div className="w-2/12 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10">
                      {entry.year}
                    </div>
                  </div>
                  
                  {/* Empty space for alternating layout */}
                  <div className="w-5/12"></div>
                </div>
              ))}

              {entries.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No timeline entries yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;