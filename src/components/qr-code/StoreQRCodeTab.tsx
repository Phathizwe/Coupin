import React from 'react';
import StoreQRCodeGenerator from '../../business/components/StoreQRCodeGenerator';
import { useAuth } from '../../hooks/useAuth';

/**
 * A tab component for the Store QR Code Generator
 * This will be integrated into the existing QR Code page
 */
const StoreQRCodeTab: React.FC = () => {
  const { user } = useAuth();
  const businessId = user?.uid;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 shadow-sm border border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-800 mb-2">
          🏪 In-Store Experience
        </h2>
        <p className="text-gray-700 mb-4">
          Generate a QR code for your physical store that customers can scan to quickly access their coupons and loyalty cards.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-sm border border-indigo-100">
            <span className="text-indigo-600 mr-2">✨</span>
            <span>Simplified customer interface</span>
          </div>
          <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-sm border border-indigo-100">
            <span className="text-indigo-600 mr-2">🔄</span>
            <span>Quick access to coupons</span>
          </div>
          <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-sm border border-indigo-100">
            <span className="text-indigo-600 mr-2">🏆</span>
            <span>Easy loyalty card display</span>
          </div>
        </div>
      </div>

      <StoreQRCodeGenerator businessId={businessId} />
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="font-medium">Pro Tip</h3>
            <p className="mt-1">
              Place this QR code near your checkout counter or entrance for maximum visibility. 
              Encourage customers to scan it for quick access to their coupons and loyalty cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreQRCodeTab;