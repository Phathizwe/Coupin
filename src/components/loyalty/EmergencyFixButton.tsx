import React, { useState, useEffect } from 'react';
import EmergencyProgramCreator from './EmergencyProgramCreator';

const EmergencyFixButton: React.FC = () => {
  const [showTool, setShowTool] = useState(false);
  
  useEffect(() => {
    const handleCloseEvent = () => setShowTool(false);
    document.addEventListener('closeEmergencyTool', handleCloseEvent);
    return () => {
      document.removeEventListener('closeEmergencyTool', handleCloseEvent);
    };
  }, []);
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowTool(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 flex items-center"
        >
          <span className="mr-2">🚨</span>
          Emergency Fix
        </button>
      </div>
      
      {showTool && (
        <EmergencyProgramCreator />
      )}
    </>
  );
};

export default EmergencyFixButton;