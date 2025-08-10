import React from 'react';

interface QRCodeAnalyticsProps {
  totalScans: number;
  uniqueCustomers: number;
  conversionRate: number;
  isLoading: boolean;
}

const QRCodeAnalytics: React.FC<QRCodeAnalyticsProps> = ({
  totalScans,
  uniqueCustomers,
  conversionRate,
  isLoading
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">QR Code Analytics</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Total Scans</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-bold">{totalScans}</p>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500">Unique Customers</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-bold">{uniqueCustomers}</p>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500">Conversion Rate</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-bold">{conversionRate}%</p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View Detailed Analytics
        </button>
      </div>
    </div>
  );
};

export default QRCodeAnalytics;