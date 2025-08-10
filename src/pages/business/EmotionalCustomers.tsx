import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getCustomers } from '../../services/customerService';
import { getCustomerCouponStats } from '../../services/customerCouponService';
import { getLoyaltyProgram } from '../../services/loyaltyService';
import { addSampleCustomers } from '../../services/sampleDataService';
import { Customer } from '../../types';
import { CustomerWithCouponStats } from '../../types/customer';
import AddCustomerModal from '../../components/customers/AddCustomerModal';
import AssignCouponModal from '../../components/customers/AssignCouponModal';

// Import our emotional design components
import EmotionalCustomerHeader from '../../components/business-emotional-design/EmotionalCustomerHeader';
import EmotionalCustomerSearch from '../../components/business-emotional-design/EmotionalCustomerSearch';
import EmotionalCustomerInsights from '../../components/business-emotional-design/EmotionalCustomerInsights';
import CustomerGridView from '../../components/business-emotional-design/CustomerGridView';
import EmotionalCustomerDetailView from '../../components/business-emotional-design/EmotionalCustomerDetailView';
import BusinessAchievementsSection from '../../components/business-emotional-design/BusinessAchievementsSection';
import BusinessMascot from '../../components/business-emotional-design/BusinessMascot';

const EmotionalCustomers: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<CustomerWithCouponStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithCouponStats | null>(null);
  const [hasLoyaltyProgram, setHasLoyaltyProgram] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [addingSampleData, setAddingSampleData] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [previousCustomerCount, setPreviousCustomerCount] = useState(0);
  const [mascotState, setMascotState] = useState<'welcome' | 'thinking' | 'happy' | 'excited' | 'idle'>('welcome');
  const [mascotMessage, setMascotMessage] = useState("Welcome to your customer community! Click me for tips.");
  const [mascotInteractions, setMascotInteractions] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Get the business ID from user object (check both businessId and currentBusinessId)
  // If no business ID but user has business role, use their user ID as business ID
  let businessId = user?.businessId || user?.currentBusinessId;
  if (!businessId && user?.role === 'business' && user?.uid) {
    businessId = user.uid;
    console.log('Using user ID as business ID for EmotionalCustomers:', businessId);
  }

  // Fetch customers on component mount
  useEffect(() => {
    // Don't try to fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // If user is loaded but no businessId, show appropriate message
    if (user && !businessId) {
      setLoading(false);
      setError("No business profile found. Please contact support if this issue persists.");
      setMascotState('thinking');
      setMascotMessage("Hmm, I can't find your business profile. Let's get this sorted out!");
      return;
    }

    // If no user at all, show loading (auth might still be initializing)
    if (!user) {
      setLoading(true);
      return;
    }

    // If we have a user and businessId, fetch customers
    if (businessId) {
      fetchCustomers();
      checkLoyaltyProgram();
    }
  }, [user, businessId, authLoading]);

  // Track customer count changes for celebrations
  useEffect(() => {
    if (previousCustomerCount > 0 && customers.length > previousCustomerCount) {
      // Trigger celebration for new customers
      if (customers.length === 10 || customers.length === 25 || customers.length === 50 || customers.length === 100) {
        setAchievementMessage(`Congratulations! You now have ${customers.length} customers in your community!`);
        setShowCelebration(true);
        setMascotState('excited');
        setMascotMessage(`Great job! ${customers.length} customers in your community!`);

        // Hide celebration after 5 seconds
        setTimeout(() => {
          setShowCelebration(false);
          setMascotState('idle');
        }, 5000);
      }
    }

    setPreviousCustomerCount(customers.length);
  }, [customers.length]);

  // Check if business has a loyalty program
  const checkLoyaltyProgram = async () => {
    if (!businessId) return;

    try {
      const program = await getLoyaltyProgram(businessId);
      setHasLoyaltyProgram(!!program);
    } catch (error) {
      console.error('Error checking loyalty program:', error);
    }
  };

  // Fetch customers from Firestore
  const fetchCustomers = async (reset = true) => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getCustomers(
        businessId,
        reset ? null : lastVisible,
        20,
        searchTerm
      );

      // Get coupon stats for each customer
      const customersWithStats = await Promise.all(
        result.customers.map(async (customer) => {
          try {
            const stats = await getCustomerCouponStats(customer.id);
            return {
              ...customer,
              couponStats: stats
            };
          } catch (error) {
            console.error(`Error fetching coupon stats for customer ${customer.id}:`, error);
            return {
              ...customer,
              couponStats: {
                totalAllocated: 0,
                totalUsed: 0,
                unusedCoupons: 0
              }
            };
          }
        })
      );

      if (reset) {
        setCustomers(customersWithStats);
      } else {
        setCustomers(prev => [...prev, ...customersWithStats]);
      }

      setLastVisible(result.lastVisible);
      setHasMore(result.customers.length === 20); // If we got less than the limit, there's no more data

      // Update mascot state based on customer count
      if (customersWithStats.length === 0 && reset) {
        setMascotState('thinking');
        setMascotMessage("Looks like you don't have any customers yet. Would you like to add some?");
        setMascotInteractions(1);
      } else if (customersWithStats.length > 0 && reset) {
        setMascotState('happy');
        setMascotMessage(`You have ${customersWithStats.length} customers in your community!`);
      }

      // Reset retry count on successful fetch
      setRetryCount(0);

    } catch (error) {
      console.error('Error fetching customers:', error);
      setError("There was a problem loading your customers. Please try again.");
      setMascotState('thinking');
      setMascotMessage("Oops! I'm having trouble loading your customers. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding sample customers
  const handleAddSampleData = async () => {
    if (!businessId || addingSampleData) return;

    try {
      setAddingSampleData(true);
      setMascotState('thinking');
      setMascotMessage("Adding some sample customers for you...");

      await addSampleCustomers(businessId);
      // Refresh the customer list
      await fetchCustomers(true);

      // Show celebration for adding sample data
      setAchievementMessage('Great job! You added sample customers to see how your dashboard works!');
      setShowCelebration(true);
      setMascotState('excited');
      setMascotMessage("Excellent! Now you can see how your customer community looks!");

      // Hide celebration after 5 seconds
      setTimeout(() => {
        setShowCelebration(false);
        setMascotState('idle');
      }, 5000);
    } catch (error) {
      console.error('Error adding sample customers:', error);
      setError("There was a problem adding sample customers. Please try again.");
      setMascotState('thinking');
      setMascotMessage("Hmm, there was a problem adding sample customers. Try again?");
    } finally {
      setAddingSampleData(false);
    }
  };

  // Handle mascot interaction
  const handleMascotClick = () => {
    setMascotInteractions(prev => prev + 1);

    // Cycle through different tips based on the number of interactions
    const tips = [
      "💡 Tip: Use the search bar to quickly find specific customers!",
      "🎯 Pro tip: Assign coupons to reward your loyal customers!",
      "📊 Did you know? You can track customer engagement in the insights section!",
      "🌟 Keep building relationships - every customer matters!",
      "💝 Happy customers become your best advocates!",
      "🚀 Your customer community is the heart of your business!"
    ];

    const tipIndex = (mascotInteractions - 1) % tips.length;
    setMascotMessage(tips[tipIndex]);
    setMascotState('happy');

    // Return to idle after showing tip
    setTimeout(() => {
      setMascotState('idle');
      setMascotMessage("Click me anytime for more tips!");
    }, 4000);
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchCustomers(true);
  };

  // Handle search
  const handleSearch = () => {
    fetchCustomers(true);
  };

  // Load more customers
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCustomers(false);
    }
  };

  // Handle adding a new customer
  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [{
      ...newCustomer,
      couponStats: {
        totalAllocated: 0,
        totalUsed: 0,
        unusedCoupons: 0
      }
    }, ...prev]);

    // Show celebration for first customer
    if (customers.length === 0) {
      setAchievementMessage('Congratulations! You added your first customer!');
      setShowCelebration(true);
      setMascotState('excited');
      setMascotMessage("Fantastic! Your first customer is here!");

      setTimeout(() => {
        setShowCelebration(false);
        setMascotState('happy');
      }, 5000);
    }
  };

  // Handle assigning a coupon to a customer
  const handleAssignCoupon = (customer: CustomerWithCouponStats) => {
    setSelectedCustomer(customer);
    setShowAssignModal(true);
  };

  // Handle coupon assignment completion
  const handleCouponAssigned = () => {
    // Refresh the customer list to show updated coupon stats
    fetchCustomers(true);
  };

  // Handle customer update (including loyalty points)
  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === updatedCustomer.id ? { ...customer, ...updatedCustomer } : customer
    ));

    if (selectedCustomer && selectedCustomer.id === updatedCustomer.id) {
      setSelectedCustomer(prev => prev ? { ...prev, ...updatedCustomer } : null);
    }
  };

  // View customer details
  const handleViewCustomer = (customer: CustomerWithCouponStats) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  // Calculate total redemptions for achievements
  const totalRedemptions = customers.reduce((sum, c) => sum + (c.couponStats?.totalUsed || 0), 0);

  // Filter customers based on search term (client-side filtering for additional flexibility)
  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show loading state while auth is loading or initial data fetch
  if (authLoading || (loading && customers.length === 0 && !error)) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mt-6 mb-2">Building your customer community...</h3>
          <p className="text-gray-500 max-w-md">
            We're gathering all your customer relationships and preparing your dashboard with care.
          </p>
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Loading your community</span>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error loading customers, show an enhanced error message
  if (error && !loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-orange-100 p-4 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">We're having trouble connecting</h3>
          <p className="text-gray-500 mb-6 max-w-md">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
            {retryCount < 2 && (
              <button
                onClick={handleAddSampleData}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Sample Data
              </button>
            )}
          </div>
          {retryCount >= 2 && (
            <p className="text-sm text-gray-400 mt-4">
              Still having trouble? Please contact support for assistance.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-6 rounded-xl shadow-2xl animate-bounce transform scale-110">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">{achievementMessage}</h3>
            </div>
          </div>
        </div>
      )}

      <EmotionalCustomerHeader
        customerCount={customers.length}
        onAddCustomer={() => setShowAddModal(true)}
        onAddSampleData={handleAddSampleData}
        loading={addingSampleData}
      />

      <EmotionalCustomerSearch
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        hasLoyaltyProgram={hasLoyaltyProgram}
        customerCount={customers.length}
      />

      {/* Customer insights */}
      <EmotionalCustomerInsights
        customers={filteredCustomers}
        hasLoyaltyProgram={hasLoyaltyProgram}
      />

      {/* Customer grid view */}
      <CustomerGridView
        customers={filteredCustomers}
        loading={loading}
        onViewCustomer={handleViewCustomer}
        onAssignCoupon={handleAssignCoupon}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isLoadingMore={loading && customers.length > 0}
        onAddFirstCustomer={() => setShowAddModal(true)}
      />

      {/* Business achievements section */}
      <BusinessAchievementsSection
        customers={filteredCustomers}
        totalRedemptions={totalRedemptions}
      />

      {/* Business mascot */}
      <BusinessMascot
        state={mascotState}
        message={mascotMessage}
        interactionCount={mascotInteractions}
        onClick={handleMascotClick}
      />

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCustomerAdded={handleCustomerAdded}
        />
      )}

      {/* Assign Coupon Modal */}
      {showAssignModal && selectedCustomer && (
        <AssignCouponModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          customer={selectedCustomer}
          onCouponAssigned={handleCouponAssigned}
        />
      )}

      {/* Customer Detail View */}
      {showCustomerDetail && selectedCustomer && (
        <EmotionalCustomerDetailView
          customer={selectedCustomer}
          onClose={() => setShowCustomerDetail(false)}
          onCustomerUpdated={handleCustomerUpdated}
          onAssignCoupon={handleAssignCoupon}
          hasLoyaltyProgram={hasLoyaltyProgram}
        />
      )}
    </div>
  );
};

export default EmotionalCustomers;