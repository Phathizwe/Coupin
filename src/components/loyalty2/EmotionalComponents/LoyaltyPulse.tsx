import React from 'react';
import { LoyaltyProgram } from '../../../types';
import LoyaltyMascot from '../LoyaltyMascot';

interface LoyaltyPulseProps {
  program: LoyaltyProgram;
}

const LoyaltyPulse: React.FC<LoyaltyPulseProps> = ({ program }) => {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-indigo-50 rounded-xl p-6 mb-6 relative overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="absolute right-0 top-0">
        <LoyaltyMascot mood="happy" size="medium" />
      </div>
      
      <h2 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
        Community Pulse
        <span className="ml-2 text-purple-500">💖</span>
      </h2>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">{program.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            program.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {program.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className="text-sm text-purple-700 mb-2">Community Growth</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full animate-pulse" 
            style={{ width: '1%' }}
          ></div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-purple-700 animate-pulse">1</span> 
            <span className="text-xs text-purple-600">Happy Member</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-purple-700">0</span>
            <span className="text-xs text-purple-600">Celebrations</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-purple-600 italic">
        Your community is just starting! Invite more members to grow your tribe.
      </p>
    </div>
  );
};

export default LoyaltyPulse;