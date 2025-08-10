import React from 'react';

interface QRCodeDisplayProps {
  qrCodeDataUrl: string;
  isLoading: boolean;
  selectedCoupon: string;
  generatedDate: string;
  coupons: Array<{ id: string, name: string, code: string }>;
  handleDownload: () => void;
  handleShare: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeDataUrl,
  isLoading,
  selectedCoupon,
  generatedDate,
  coupons,
  handleDownload,
  handleShare
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your QR Code</h2>

      <div className="flex flex-col items-center">
        <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-6 border">
          {isLoading ? (
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          ) : qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="w-48 h-48 bg-white p-2">
              <div className="w-full h-full border-2 border-gray-800 p-4 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="mt-2 text-xs text-gray-500">QR Code Preview</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            {selectedCoupon === 'all' ? 'All Coupons' : coupons.find(c => c.id === selectedCoupon)?.name}
          </p>
          <p className="text-xs text-gray-500">
            Generated on {generatedDate}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            onClick={handleDownload}
            disabled={!qrCodeDataUrl || isLoading}
          >
            Download
          </button>
          <button
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            onClick={handleShare}
            disabled={!qrCodeDataUrl || isLoading || !navigator.share}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;