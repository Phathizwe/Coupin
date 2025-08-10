import React, { useState } from 'react';
import { useEmotionalCelebration } from '../../hooks/qr-code/ui/useEmotionalCelebration';

interface QRGeneratorCardProps {
  coupons: Array<{ id: string; name: string; code: string }>;
  selectedCoupon: string;
  downloadFormat: string;
  onCouponSelect: (id: string) => void;
  onFormatSelect: (format: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const QRGeneratorCard: React.FC<QRGeneratorCardProps> = ({
  coupons,
  selectedCoupon,
  downloadFormat,
  onCouponSelect,
  onFormatSelect,
  onGenerate,
  isLoading
}) => {
  // Optional emotional celebration hook - will not affect core functionality
  const { celebrateGeneration } = useEmotionalCelebration?.() || { celebrateGeneration: undefined };
  const [animating, setAnimating] = useState(false);

  // Preserve existing generate logic with optional celebration
  const handleGenerate = () => {
    setAnimating(true);
    onGenerate(); // EXISTING logic unchanged
    
    // Optional celebration effect
    if (celebrateGeneration) {
      celebrateGeneration('QR Code created! 🎉');
    }
    
    setTimeout(() => setAnimating(false), 1000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-start mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              🎨 Create Your Digital Bridge
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Transform your coupons into scannable magic ✨
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <label htmlFor="coupon-select" className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Coupon
            </label>
            <div className="relative">
              <select
                id="coupon-select"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={selectedCoupon}
                onChange={(e) => {
                  onCouponSelect(e.target.value);
                  // Auto-generate QR code when coupon changes
                  setTimeout(() => onGenerate(), 100);
                }}
                disabled={isLoading}
              >
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="download-format" className="block text-sm font-medium text-gray-700 mb-1.5">
              Download Format
            </label>
            <div className="relative">
              <select
                id="download-format"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={downloadFormat}
                onChange={(e) => {
                  onFormatSelect(e.target.value);
                  // Auto-generate QR code when format changes
                  setTimeout(() => onGenerate(), 100);
                }}
                disabled={isLoading}
              >
                <option value="png">PNG Image</option>
                <option value="svg">SVG Vector</option>
                <option value="pdf">PDF Document</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed ${
              animating ? 'animate-pulse' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Magic...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-1">✨</span> Generate Magic
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGeneratorCard;