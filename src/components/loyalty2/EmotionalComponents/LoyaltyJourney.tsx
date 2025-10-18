import React from 'react';
import { LoyaltyProgram } from '../../../types';
import LoyaltyMascot from '../LoyaltyMascot';

interface LoyaltyJourneyProps {
  program: LoyaltyProgram;
  onEditClick: (programId: string) => void;
}

const LoyaltyJourney: React.FC<LoyaltyJourneyProps> = ({ program, onEditClick }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
        <span>Your Legacy</span>
        <LoyaltyMascot mood="happy" size="small" />
      </h2>
      
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">{program.name}</h3>
          <span className="text-sm text-green-600 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            Active
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{program.description || 'Building customer happiness one visit at a time'}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-indigo-500 font-medium">Making an impact</span>
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center group"
            onClick={() => onEditClick(program.id)}
          >
            <span>Enhance Your Program</span>
            <svg className="w-4 h-4 ml-1 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Journey to Rewards</h3>
            <p className="text-sm text-gray-600">
              {program.visitsRequired || 10} visits lead to a celebration
            </p>
          </div>
        </div>
        
        <div className="pl-13 ml-5">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  Visit Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  0/{program.visitsRequired || 10}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <div style={{ width: "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000 ease-in-out"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyJourney;