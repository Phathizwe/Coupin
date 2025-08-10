import React, { useEffect, useRef, useState } from 'react';
import { CountUpValue, ProgressIndicator, EmotionalLoadingState } from './MicroInteractions';
import { EmotionalInsightCard } from './EmotionalAnimations';
import './emotionalDesign.css';

interface CustomerGrowthChartProps {
  loading: boolean;
  totalCustomers: number;
  customerRetention: number;
  averageSpend: number;
  customerGrowth: number;
}

const CustomerGrowthChart: React.FC<CustomerGrowthChartProps> = ({
  loading,
  totalCustomers,
  customerRetention,
  averageSpend,
  customerGrowth
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Track when chart comes into view to trigger animations
  useEffect(() => {
    if (!chartRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(chartRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  if (loading) {
    return <EmotionalLoadingState message="Analyzing customer data..." />;
  }

  if (totalCustomers === 0) {
    return (
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 emotional-icon-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
        <p className="mt-2 text-sm text-gray-500">No customer growth data available yet</p>
        <p className="text-xs text-gray-400">Acquire customers to see growth trends</p>
      </div>
    );
  }
  
  // Generate an insight message based on the data
  const getInsightMessage = () => {
    if (customerGrowth > 10) {
      return "Your customer base is growing rapidly! Consider launching a referral program to capitalize on this momentum.";
    } else if (customerGrowth > 0) {
      return "Your customer base is growing steadily. Focus on retention strategies to maintain this positive trend.";
    } else if (customerGrowth === 0) {
      return "Your customer base is stable. Consider new acquisition strategies to drive growth.";
    } else {
      return "Your customer base has decreased slightly. Focus on re-engagement campaigns to bring customers back.";
    }
  };

  return (
    <div className="p-4 w-full" ref={chartRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0 p-4 bg-blue-50 rounded-lg transition-all duration-300 hover:bg-blue-100">
          <p className="text-sm text-gray-500">Customer Retention</p>
          <div className="flex items-end">
            <CountUpValue 
              value={customerRetention} 
              suffix="%" 
              className="text-2xl font-semibold text-blue-700"
              duration={isVisible ? 1500 : 0}
            />
            <span className="text-blue-500 text-sm ml-2 mb-1">loyal customers</span>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg transition-all duration-300 hover:bg-green-100">
          <p className="text-sm text-gray-500">Average Spend</p>
          <div className="flex items-end">
            <CountUpValue 
              value={averageSpend} 
              prefix="R" 
              formatter={(val) => val.toFixed(2)}
              className="text-2xl font-semibold text-green-700"
              duration={isVisible ? 1500 : 0}
            />
            <span className="text-green-500 text-sm ml-2 mb-1">per customer</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500">Growth Rate</p>
          <p className={`text-sm font-medium ${customerGrowth >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {customerGrowth}%
          </p>
        </div>
        
        <ProgressIndicator 
          value={customerGrowth} 
          maxValue={Math.max(20, Math.abs(customerGrowth) * 1.2)} 
          height="h-3"
          positiveColor="bg-gradient-to-r from-green-400 to-green-600"
          negativeColor="bg-gradient-to-r from-amber-400 to-amber-600"
        />
      </div>
      
      <div className="mt-8">
        <EmotionalInsightCard
          title="Customer Growth Insight"
          insight={getInsightMessage()}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
          color={customerGrowth >= 0 ? "green" : "amber"}
        />
      </div>
    </div>
  );
};

export default CustomerGrowthChart;