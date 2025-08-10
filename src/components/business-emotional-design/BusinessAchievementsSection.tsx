import React from 'react';
import { CustomerWithCouponStats } from '../../types/customer';

interface BusinessAchievementsSectionProps {
  customers: CustomerWithCouponStats[];
  totalRedemptions: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  isCompleted: boolean;
  progress: number;
  target: number;
  currentValue: number;
}

const BusinessAchievementsSection: React.FC<BusinessAchievementsSectionProps> = ({
  customers,
  totalRedemptions
}) => {
  // Skip if no customers
  if (customers.length === 0) {
    return null;
  }

  // Calculate achievements
  const achievements: Achievement[] = [
    {
      id: 'first-10-customers',
      title: 'Growing Community',
      description: 'Add 10 customers to your community',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      isCompleted: customers.length >= 10,
      progress: Math.min(customers.length / 10, 1) * 100,
      target: 10,
      currentValue: customers.length
    },
    {
      id: 'first-50-customers',
      title: 'Thriving Community',
      description: 'Grow your community to 50 customers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      isCompleted: customers.length >= 50,
      progress: Math.min(customers.length / 50, 1) * 100,
      target: 50,
      currentValue: customers.length
    },
    {
      id: 'first-10-redemptions',
      title: 'Coupon Success',
      description: 'Achieve 10 coupon redemptions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      isCompleted: totalRedemptions >= 10,
      progress: Math.min(totalRedemptions / 10, 1) * 100,
      target: 10,
      currentValue: totalRedemptions
    },
    {
      id: 'first-50-redemptions',
      title: 'Redemption Champion',
      description: 'Achieve 50 coupon redemptions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      isCompleted: totalRedemptions >= 50,
      progress: Math.min(totalRedemptions / 50, 1) * 100,
      target: 50,
      currentValue: totalRedemptions
    }
  ];

  // Filter to show only relevant achievements
  const visibleAchievements = achievements.filter(a => 
    !a.isCompleted || // Show incomplete achievements
    (a.isCompleted && a.id === 'first-10-customers') || // Always show first customer milestone if completed
    (a.isCompleted && a.id === 'first-10-redemptions') // Always show first redemption milestone if completed
  );

  // If no achievements are relevant, don't show the section
  if (visibleAchievements.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Business Journey</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start">
              <div className={`p-3 rounded-full ${
                achievement.isCompleted 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {achievement.icon}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                  {achievement.isCompleted && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${achievement.isCompleted ? 'bg-green-500' : 'bg-primary-500'}`} 
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {achievement.currentValue}/{achievement.target}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Achievement tips */}
        {customers.length > 0 && customers.length < 10 && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Tip:</span> Import your contacts or add customers manually to grow your community faster.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAchievementsSection;