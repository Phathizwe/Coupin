import React from 'react';

interface QRAnalyticsCardProps {
  totalScans: number;
  uniqueCustomers: number;
  conversionRate: number;
  isLoading: boolean;
}

interface AnimatedMetricProps {
  label: string;
  value: number | string;
  icon: string;
  isLoading: boolean;
  celebration?: string | null;
  color?: string;
}

const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  label,
  value,
  icon,
  isLoading,
  celebration = null,
  color = 'purple'
}) => {
  return (
    <div className="relative">
      <div className={`p-4 bg-white rounded-lg border border-${color}-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]`}>
        <div className="flex items-center">
          <div className={`bg-gradient-to-br from-${color}-100 to-${color}-200 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mr-3`}>
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            )}
          </div>
        </div>
        
        {celebration && !isLoading && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-purple-700 flex items-center">
              <span className="mr-1">🎉</span> {celebration}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const QRAnalyticsCard: React.FC<QRAnalyticsCardProps> = ({
  totalScans,
  uniqueCustomers,
  conversionRate,
  isLoading
}) => {
  // Calculate engagement rate from existing data
  const engagementRate = uniqueCustomers > 0 && totalScans > 0 
    ? Math.round((uniqueCustomers / totalScans) * 100) 
    : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-start mb-5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              📊 Your Impact Story
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              See how your QR codes are performing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatedMetric
            label="Total Scans"
            value={totalScans}
            icon="🎯"
            isLoading={isLoading}
            celebration={totalScans > 100 ? "Century milestone!" : null}
          />
          
          <AnimatedMetric
            label="Unique Customers"
            value={uniqueCustomers}
            icon="👥"
            isLoading={isLoading}
            celebration={uniqueCustomers > 50 ? "Growing community!" : null}
          />
          
          <AnimatedMetric
            label="Conversion Rate"
            value={`${conversionRate}%`}
            icon="✅"
            isLoading={isLoading}
            color="indigo"
          />
          
          <AnimatedMetric
            label="Engagement Rate"
            value={`${engagementRate}%`}
            icon="💫"
            isLoading={isLoading}
            color="indigo"
          />
        </div>

        <div className="mt-5 pt-4 border-t border-purple-100">
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center transition-colors duration-200">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRAnalyticsCard;