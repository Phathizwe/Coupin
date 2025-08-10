import React from 'react';

const QRCodeUsageTips: React.FC = () => {
  const tips = [
    'Print your QR code and display it at your business location',
    'Include the QR code in your print advertisements and flyers',
    'Share the QR code on your social media accounts',
    'Add the QR code to your email signature and newsletters'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">QR Code Usage Tips</h2>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-700">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QRCodeUsageTips;