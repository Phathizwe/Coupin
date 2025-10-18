import React from 'react';

interface CelebrationStationProps {
  onInviteMember: () => void;
  onScanQR: () => void;
  onReward: () => void;
}

const CelebrationStation: React.FC<CelebrationStationProps> = ({ 
  onInviteMember, 
  onScanQR, 
  onReward 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span>Celebration Station</span>
        <span className="ml-2 text-yellow-500">✨</span>
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={onScanQR}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mb-3 transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">Welcome Back a Friend</span>
        </button>

        <button
          onClick={onInviteMember}
          className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:from-orange-100 hover:to-orange-200 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-full flex items-center justify-center mb-3 transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-orange-700 group-hover:text-orange-800">Grow Your Community</span>
        </button>
        
        <button
          onClick={onReward}
          className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center mb-3 transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-green-700 group-hover:text-green-800">Celebrate Loyalty</span>
        </button>
      </div>
    </div>
  );
};

export default CelebrationStation;