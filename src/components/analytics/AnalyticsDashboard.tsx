import React, { useState, useEffect } from 'react';
import AnalyticsCard from './AnalyticsCard';
import ChartContainer from './ChartContainer';
import CustomerGrowthChart from './CustomerGrowthChart';
import EmptyChartState from './EmptyChartState';
import { EmotionalDashboardContainer, MilestoneConfetti } from './EmotionalAnimations';
import { 
  CustomerIcon, 
  CouponIcon, 
  RevenueIcon, 
  LoyaltyIcon,
  ChartIcon,
  CalendarIcon,
  DemographicsIcon,
  ListIcon
} from './AnalyticsIcons';
import { AnalyticsData } from './analyticsService';
import './emotionalDesign.css';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  loading: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics, loading }) => {
  const [prevAnalytics, setPrevAnalytics] = useState<AnalyticsData | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  
  // Check for milestones to celebrate
  useEffect(() => {
    if (loading || !analytics) return;
    
    // If we have previous analytics to compare
    if (prevAnalytics) {
      // Celebrate significant growth in customers or revenue
      if (
        (analytics.totalCustomers > prevAnalytics.totalCustomers + 10) ||
        (analytics.revenueGenerated > prevAnalytics.revenueGenerated * 1.2)
      ) {
        setShowMilestone(true);
      }
    } else {
      // First load - celebrate if we have good numbers
      if (analytics.totalCustomers > 50 || analytics.revenueGenerated > 5000) {
        setShowMilestone(true);
      }
    }
    
    setPrevAnalytics(analytics);
  }, [analytics, loading, prevAnalytics]);
  
  // Determine if a metric deserves achievement highlighting
  const isAchievement = (metricName: keyof AnalyticsData): boolean => {
    if (!analytics || !prevAnalytics) return false;
    
    switch (metricName) {
      case 'totalCustomers':
        return analytics.totalCustomers > 100 || analytics.customerGrowth > 15;
      case 'couponsRedeemed':
        return analytics.couponsRedeemed > 50;
      case 'revenueGenerated':
        return analytics.revenueGenerated > 10000;
      case 'loyaltyMembers':
        return analytics.loyaltyMembers > 25;
      default:
        return false;
    }
  };

  return (
    <EmotionalDashboardContainer>
      {/* Celebration confetti for milestones */}
      <MilestoneConfetti 
        trigger={showMilestone} 
        options={{
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        }}
      />
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Customers"
          value={analytics.totalCustomers}
          icon={<CustomerIcon />}
          changePercentage={analytics.customerGrowth}
          loading={loading}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          index={0}
          achievement={isAchievement('totalCustomers')}
        />
        
        <AnalyticsCard
          title="Coupons Redeemed"
          value={analytics.couponsRedeemed}
          icon={<CouponIcon />}
          loading={loading}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          index={1}
          achievement={isAchievement('couponsRedeemed')}
        />
        
        <AnalyticsCard
          title="Revenue Generated"
          value={`R${analytics.revenueGenerated.toFixed(2)}`}
          icon={<RevenueIcon />}
          loading={loading}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          index={2}
          achievement={isAchievement('revenueGenerated')}
        />
        
        <AnalyticsCard
          title="Loyalty Members"
          value={analytics.loyaltyMembers}
          icon={<LoyaltyIcon />}
          loading={loading}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          index={3}
          achievement={isAchievement('loyaltyMembers')}
        />
      </div>
      
      {/* Chart Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Coupon Performance" index={0}>
          <EmptyChartState
            icon={<ChartIcon className="mx-auto h-12 w-12" />}
            message="No coupon data available yet"
            subMessage="Create and distribute coupons to see performance data"
            actionText="Create Coupon"
            onAction={() => window.location.href = '/business/coupons/create'}
          />
        </ChartContainer>
        
        <ChartContainer title="Customer Growth" index={1}>
          <CustomerGrowthChart
            loading={loading}
            totalCustomers={analytics.totalCustomers}
            customerRetention={analytics.customerRetention}
            averageSpend={analytics.averageSpend}
            customerGrowth={analytics.customerGrowth}
          />
        </ChartContainer>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ChartContainer title="Coupon Redemption by Day" index={2}>
          <EmptyChartState
            icon={<CalendarIcon className="mx-auto h-12 w-12" />}
            message="No redemption data available yet"
            subMessage="Customers need to redeem coupons to see this data"
          />
        </ChartContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Customer Demographics" index={3}>
          <EmptyChartState
            icon={<DemographicsIcon className="mx-auto h-12 w-12" />}
            message="No demographic data available yet"
            subMessage="Collect customer data to see demographics"
            actionText="Add Customers"
            onAction={() => window.location.href = '/business/customers'}
          />
        </ChartContainer>
        
        <ChartContainer title="Top Performing Coupons" index={4}>
          <EmptyChartState
            icon={<ListIcon className="mx-auto h-12 w-12" />}
            message="No coupon performance data available yet"
            subMessage="Create multiple coupons to compare performance"
          />
        </ChartContainer>
      </div>
    </EmotionalDashboardContainer>
  );
};

export default AnalyticsDashboard;