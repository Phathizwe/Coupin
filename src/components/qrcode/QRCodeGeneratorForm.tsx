import React from 'react';

interface QRCodeGeneratorFormProps {
  selectedCoupon: string;
  setSelectedCoupon: (value: string) => void;
  downloadFormat: string;
  setDownloadFormat: (value: string) => void;
  coupons: Array<{ id: string, name: string, code: string }>;
  isLoading: boolean;
}

const QRCodeGeneratorForm: React.FC<QRCodeGeneratorFormProps> = ({
  selectedCoupon,
  setSelectedCoupon,
  downloadFormat,
  setDownloadFormat,
  coupons,
  isLoading
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Generate QR Code</h2>
      <p className="text-sm text-gray-600 mb-4">
        Create a QR code for your business or specific coupons. Customers can scan this code to access your coupons directly.
      </p>

      <div className="mb-4">
        <label htmlFor="coupon-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Coupon
        </label>
        <select
          id="coupon-select"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          value={selectedCoupon}
          onChange={(e) => setSelectedCoupon(e.target.value)}
          disabled={isLoading}
        >
          {coupons.map((coupon) => (
            <option key={coupon.id} value={coupon.id}>
              {coupon.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="download-format" className="block text-sm font-medium text-gray-700 mb-1">
          Download Format
        </label>
        <select
          id="download-format"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          value={downloadFormat}
          onChange={(e) => setDownloadFormat(e.target.value)}
          disabled={isLoading}
        >
          <option value="png">PNG Image</option>
          <option value="svg">SVG Vector</option>
          <option value="pdf">PDF Document</option>
        </select>
      </div>
    </div>
  );
};

export default QRCodeGeneratorForm;