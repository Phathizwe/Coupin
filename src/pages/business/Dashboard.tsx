import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import { fetchDashboardStatsOptimized, DashboardStats } from '../../services/dashboardStatsService';
import { checkOnboardingStatus } from '../../services/businessOnboardingService';
import EmotionalSimpleDashboardFixed from '../../components/dashboard/EmotionalSimpleDashboardFixed';
import DashboardFeatureCard from '../../components/business/DashboardFeatureCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import '../../styles/animations.css';

const BusinessDashboard: React.FC = () => {
  console.log('Dashboard component rendering');

  // Get viewMode from context with a fallback to prevent errors
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';
  console.log('Dashboard view mode:', viewMode);

  const { user, businessProfile: contextBusinessProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState(contextBusinessProfile);
  const [onboardingStatus, setOnboardingStatus] = useState({
    hasCreatedCoupons: false,
    hasCompletedProfile: false,
    hasSharedCoupons: false
  });

  // EMERGENCY FIX: Directly fetch business profile if it's missing from context
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.businessId || businessProfile) return;
      
      try {
        console.log('Emergency fix: Fetching business profile directly for ID:', user.businessId);
        const businessDoc = await getDoc(doc(db, 'businesses', user.businessId));
        
        if (businessDoc.exists()) {
          const businessData = businessDoc.data();
          const profile = {
            businessId: user.businessId,
            businessName: businessData.businessName || '',
            industry: businessData.industry || '',
            address: businessData.address || '',
            phone: businessData.phone || '',
            website: businessData.website || '',
            logo: businessData.logo || '',
            colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' },
            subscriptionTier: businessData.subscriptionTier || 'free',
            subscriptionStatus: businessData.subscriptionStatus || 'active'
          };

          console.log('Emergency fix: Successfully loaded business profile:', profile);
          setBusinessProfile(profile);
        } else {
          console.error('Emergency fix: Business document does not exist');
        }
      } catch (err) {
        console.error('Emergency fix: Error fetching business profile:', err);
      }
    };
    
    fetchBusinessProfile();
  }, [user?.businessId, businessProfile]);

  // Update businessProfile when contextBusinessProfile changes
  useEffect(() => {
    if (contextBusinessProfile) {
      setBusinessProfile(contextBusinessProfile);
    }
  }, [contextBusinessProfile]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.businessId) {
        console.log('No business ID available, skipping data load');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading dashboard data for business:', user.businessId);
        setLoading(true);

        // Fetch dashboard stats optimized
        const dashboardStats = await fetchDashboardStatsOptimized(user.businessId);
        console.log('Dashboard stats loaded:', dashboardStats);
        setStats(dashboardStats);

        // Check onboarding status
        const status = await checkOnboardingStatus(user.businessId);
        console.log('Onboarding status:', status);
        setOnboardingStatus(status);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadDashboardData();
    }
  }, [user?.businessId, authLoading]);

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-600 animate-pulse">Loading your dashboard experience...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Dashboard Error</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render based on view mode
  if (viewMode === 'simple') {
    console.log('Rendering simple dashboard');
    return <EmotionalSimpleDashboardFixed />;
  }

  // Default detailed dashboard view
  console.log('Rendering detailed dashboard');
  return (
    <div className="dashboard-container min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 space-y-6">
        {/* Enhanced Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {businessProfile?.businessName || user?.displayName || 'Business Owner'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Active Coupons</p>
                <p className="text-3xl font-bold">{stats?.activeCoupons || 0}</p>
              </div>
              <div className="text-4xl opacity-80">🎫</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Redemptions</p>
                <p className="text-3xl font-bold">{stats?.totalRedemptions || 0}</p>
              </div>
              <div className="text-4xl opacity-80">✨</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">This Month</p>
                <p className="text-3xl font-bold">{stats?.loyalCustomers || 0}</p>
              </div>
              <div className="text-4xl opacity-80">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Total Customers</p>
                <p className="text-3xl font-bold">{stats?.totalCustomers || 0}</p>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/business/coupons/create')}
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <div className="text-3xl mr-4">🎫</div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Create Coupon</h3>
                <p className="text-sm text-gray-600">Design a new promotional offer</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/business/customers')}
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
            >
              <div className="text-3xl mr-4">👥</div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Manage Customers</h3>
                <p className="text-sm text-gray-600">View and organize your customer base</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/business/analytics')}
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
            >
              <div className="text-3xl mr-4">📊</div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Track your business performance</p>
              </div>
            </button>
          </div>
        </div>

        {/* Rest of your dashboard code remains the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default BusinessDashboard;