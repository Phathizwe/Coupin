import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import RedemptionItem from './components/RedemptionItem';
import LoadingState from './components/LoadingState';
import EmptyResultsState from './components/EmptyResultsState';
import MoreOptionsButton from './components/MoreOptionsButton';
import { getRecentCouponActivities } from '../../services/simpleCouponService';
import SimpleLayout from '../../layouts/SimpleLayout';

interface CouponActivityData {
  id: string;
  customerName: string;
  couponTitle: string;
  date: Date;
  status: 'sent' | 'redeemed';
}

interface CreatedCouponInfo {
  id: string;
  code: string;
  title: string;
  customerCount: number;
}

const SimpleResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<CouponActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Get newly created coupon info from location state if available
  const createdCoupon = location.state?.createdCoupon as CreatedCouponInfo | undefined;

  useEffect(() => {
    const fetchCouponActivities = async () => {
      if (!user?.businessId) return;
      
      try {
        setIsLoading(true);
        
        // Use the service function to get recent activities
        const activities = await getRecentCouponActivities(user.businessId, 20);
        
        // Sort by date (most recent first)
        const sortedActivities = activities.sort((a, b) => 
          b.date.getTime() - a.date.getTime()
        );
        
        setRecentActivities(sortedActivities);
      } catch (error) {
        console.error('Error fetching coupon activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCouponActivities();
  }, [user?.businessId]);
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Handle back button to always go to simple dashboard
  const handleBackClick = () => {
    navigate('/business/dashboard');
  };

  // Handle create new coupon button
  const handleCreateNewCoupon = () => {
    navigate('/create-coupon');
  };
  
  const content = (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with gradient background */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={handleBackClick}
            className="text-white mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Results</h1>
        </div>
        
        {/* Summary stats in header */}
        <div className="mt-4 flex justify-between">
          <div className="bg-white/20 rounded-xl p-3 flex-1 mr-3">
            <div className="text-xs text-white/80">Sent Today</div>
            <div className="text-xl font-bold">{recentActivities.filter(a => 
              a.status === 'sent' && 
              a.date.toDateString() === new Date().toDateString()
            ).length}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 flex-1">
            <div className="text-xs text-white/80">Redeemed Today</div>
            <div className="text-xl font-bold">{recentActivities.filter(a => 
              a.status === 'redeemed' && 
              a.date.toDateString() === new Date().toDateString()
            ).length}</div>
          </div>
        </div>
      </header>
      
      {/* Main content - shifted up to overlay with header */}
      <div className="flex-1 -mt-6">
        <div className="bg-white rounded-t-3xl shadow-lg h-full flex flex-col">
          {/* Success message for newly created coupon */}
          {createdCoupon && (
            <div className="bg-green-50 p-4 m-4 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-green-800">Coupon Created!</h2>
              </div>
              <div className="mt-2 pl-10">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Title:</span> {createdCoupon.title}
                </p>
                <p className="text-sm text-green-700">
                  <span className="font-medium">Code:</span> {createdCoupon.code}
                </p>
                <p className="text-sm text-green-700">
                  <span className="font-medium">Sent to:</span> {createdCoupon.customerCount} customer{createdCoupon.customerCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
          
          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Coupon Activity</h2>
            {isLoading ? (
              <LoadingState message="Loading results..." />
            ) : recentActivities.length === 0 ? (
              <EmptyResultsState />
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
                  >
                    <div>
                      <div className="font-medium">{activity.customerName}</div>
                      <div className="text-sm text-gray-600">{activity.couponTitle}</div>
                      <div className="text-xs text-gray-500">{formatDate(activity.date)}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      activity.status === 'redeemed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status === 'redeemed' ? 'Redeemed' : 'Sent'}
                    </div>
                  </div>
                ))}
                
                <div className="text-center mt-6">
                  <button
                    onClick={() => navigate('/business/coupons')}
                    className="text-indigo-600 font-medium"
                  >
                    View Full Reports
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleCreateNewCoupon}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl"
            >
              CREATE NEW COUPON
            </button>
            
            {/* More options button */}
            <div className="mt-4">
              <MoreOptionsButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // On mobile, render directly; on desktop, wrap with SimpleLayout
  return isMobile ? content : <SimpleLayout>{content}</SimpleLayout>;
};

export default SimpleResults;