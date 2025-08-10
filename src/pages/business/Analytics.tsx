import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import { fetchAnalyticsData, AnalyticsData } from '../../components/analytics/analyticsService';
import { EmotionalLoadingState } from '../../components/analytics/MicroInteractions';
import '../../components/analytics/emotionalDesign.css';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('last7days');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCustomers: 0,
    couponsRedeemed: 0,
    revenueGenerated: 0,
    loyaltyMembers: 0,
    customerGrowth: 0,
    customerRetention: 0,
    averageSpend: 0
  });

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        const data = await fetchAnalyticsData(user.businessId, timeframe);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        // Add a slight delay to make loading feel more natural
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };
    
    loadAnalyticsData();
  }, [user, timeframe]);

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value);
  };

  return (
    <div className="pb-12">
      <AnalyticsHeader 
        title="Business Analytics" 
        timeframe={timeframe} 
        onTimeframeChange={handleTimeframeChange} 
      />
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 mt-6">
          <EmotionalLoadingState message="Analyzing your business data..." />
        </div>
      ) : (
        <AnalyticsDashboard 
          analytics={analytics} 
          loading={loading} 
        />
      )}
    </div>
  );
};

export default Analytics;