import React from 'react';
import { ANIMATIONS } from './animations/DashboardAnimations';
import { BRAND_MESSAGES } from '../../constants/brandConstants';
import ErrorBoundary from '../common/ErrorBoundary';
import DashboardStatsComponent from './DashboardStatsComponent';
import RecentActivityComponent from './RecentActivityComponent';
import GettingStartedComponent from './GettingStartedComponent';
import { DashboardStats } from '../../services/dashboardStatsService';

interface StatsGridComponentProps {
  businessId: string;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  onboardingStatus: {
    hasCreatedCoupons: boolean;
    hasCompletedProfile: boolean;
    hasSharedCoupons: boolean;
  };
}

const StatsGridComponent: React.FC<StatsGridComponentProps> = ({
  businessId,
  stats,
  loading,
  error,
  onboardingStatus
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Stats Component - 1/3 width on large screens */}
      <div className={`lg:w-1/3 ${ANIMATIONS.transition.medium} transform hover:-translate-y-1`}>
        <ErrorBoundary>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-800">Business Performance</h3>
              <p className="text-sm text-primary-600">{BRAND_MESSAGES.value.growth}</p>
            </div>
            <div className="p-4">
              <DashboardStatsComponent businessId={businessId} />
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Recent Activity Component - 1/3 width on large screens */}
      <div className={`lg:w-1/3 ${ANIMATIONS.transition.medium} transform hover:-translate-y-1`}>
        <ErrorBoundary>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full">
            <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 px-6 py-4 border-b border-secondary-100">
              <h3 className="text-lg font-semibold text-secondary-800">Recent Activity</h3>
              <p className="text-sm text-secondary-600">{BRAND_MESSAGES.value.standard}</p>
            </div>
            <div className="p-4">
              <RecentActivityComponent stats={stats} loading={loading} error={error} />
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Getting Started Component - 1/3 width on large screens */}
      <div className={`lg:w-1/3 ${ANIMATIONS.transition.medium} transform hover:-translate-y-1`}>
        <ErrorBoundary>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full">
            <div className="bg-gradient-to-r from-accent-light/30 to-accent-light/50 px-6 py-4 border-b border-accent-light/30">
              <h3 className="text-lg font-semibold text-primary-800">Getting Started</h3>
              <p className="text-sm text-primary-600">{BRAND_MESSAGES.value.retention}</p>
            </div>
            <div className="p-4">
              <GettingStartedComponent
                businessId={businessId}
                hasCreatedCoupons={onboardingStatus.hasCreatedCoupons}
                hasCompletedProfile={onboardingStatus.hasCompletedProfile}
                hasSharedCoupons={onboardingStatus.hasSharedCoupons}
              />
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default StatsGridComponent;