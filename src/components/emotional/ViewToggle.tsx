import React from 'react';
import { motion } from 'framer-motion';

interface ViewToggleProps {
  currentView: 'detailed' | 'simple';
  onViewChange: (view: 'detailed' | 'simple') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-sm">
      <motion.button
        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
          currentView === 'detailed' 
            ? 'bg-white text-purple-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
        onClick={() => onViewChange('detailed')}
        whileHover={{ scale: currentView !== 'detailed' ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>Detailed</span>
        </div>
      </motion.button>
      
      <motion.button
        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
          currentView === 'simple' 
            ? 'bg-white text-purple-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
        onClick={() => onViewChange('simple')}
        whileHover={{ scale: currentView !== 'simple' ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
          <span>Simple</span>
        </div>
      </motion.button>
    </div>
  );
};

export default ViewToggle;