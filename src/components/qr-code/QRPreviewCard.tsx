import React, { useState, useEffect } from 'react';
import { useQRAnimations } from '../../hooks/qr-code/ui/useQRAnimations';

interface QRPreviewCardProps {
  qrCodeDataUrl: string;
  isLoading: boolean;
  selectedCouponName: string;
  generatedDate: string;
  onDownload: () => void;
  onShare: () => void;
  analytics: {
    totalScans: number;
    uniqueCustomers: number;
    conversionRate: number;
    isLoading: boolean;
  };
}

const QRPreviewCard: React.FC<QRPreviewCardProps> = ({
  qrCodeDataUrl,
  isLoading,
  selectedCouponName,
  generatedDate,
  onDownload,
  onShare,
  analytics
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const { animateSuccess } = useQRAnimations?.() || { animateSuccess: undefined };
  
  // Show celebration when QR code is generated
  useEffect(() => {
    if (qrCodeDataUrl && !isLoading) {
      setShowCelebration(true);
      if (animateSuccess) {
        animateSuccess();
      }
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [qrCodeDataUrl, isLoading, animateSuccess]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-xl relative">
      {/* Optional celebration overlay - non-intrusive */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce-slow">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <div className="absolute top-0 right-1/4 transform -translate-x-1/2">
            <div className="animate-bounce-slow" style={{ animationDelay: '0.3s' }}>
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <div className="absolute top-0 left-1/4 transform -translate-x-1/2">
            <div className="animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
              <span className="text-3xl">🌟</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start mb-5">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ✨ Your Digital Creation
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Ready to connect with your customers
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-64 h-64 bg-white rounded-xl flex items-center justify-center mb-6 border-2 border-purple-100 shadow-inner relative overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500">Creating your magic...</p>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="relative w-full h-full p-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-lg"></div>
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-full h-full object-contain z-10 drop-shadow-sm transition-all duration-500 transform hover:scale-105" 
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-white p-2">
                <div className="w-full h-full border-2 border-gray-300 border-dashed p-4 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">QR Code Preview</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-700 font-medium mb-1">
              {selectedCouponName}
            </p>
            <p className="text-xs text-gray-500">
              Generated on {generatedDate}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              onClick={onDownload}
              disabled={!qrCodeDataUrl || isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              className="border border-purple-300 bg-white text-purple-700 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-purple-50 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              onClick={onShare}
              disabled={!qrCodeDataUrl || isLoading || !navigator.share}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Success celebration for existing analytics */}
        {analytics.totalScans > 0 && !analytics.isLoading && (
          <div className="mt-5 pt-4 border-t border-purple-100">
            <div className="bg-gradient-to-r from-purple-100/50 to-indigo-100/50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-purple-800">
                🎉 {analytics.totalScans} magical connections made!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPreviewCard;