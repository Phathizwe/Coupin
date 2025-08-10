import React, { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

interface ViewToggleProps {
  onChange: (view: 'default' | 'simple') => void;
  initialView?: 'default' | 'simple';
}

const ViewToggle: React.FC<ViewToggleProps> = ({ onChange, initialView = 'default' }) => {
  const [view, setView] = useState<'default' | 'simple'>(initialView);

  // Update local state when prop changes
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleToggle = (newView: 'default' | 'simple') => {
    setView(newView);
    onChange(newView);

    // Also update localStorage directly to ensure consistency
    localStorage.setItem('dashboardView', newView);

    console.log('ViewToggle: toggled to', newView); // For debugging
  };

  return (
    <div className="flex items-center">
      <Tooltip text="Switch between detailed and simplified dashboard views">
        <div className="bg-gray-200 rounded-full p-1 flex items-center border border-gray-300">
          <button
            onClick={() => handleToggle('default')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${view === 'default'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-300'
                : 'text-gray-900 hover:bg-gray-100'
              }`}
            aria-pressed={view === 'default'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-gray-900 font-medium">Detailed</span>
          </button>
          <button
            onClick={() => handleToggle('simple')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${view === 'simple'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-300'
                : 'text-gray-900 hover:bg-gray-100'
              }`}
            aria-pressed={view === 'simple'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-gray-900 font-medium">Simple</span>
          </button>
        </div>
      </Tooltip>
    </div>
  );
};

export default ViewToggle;