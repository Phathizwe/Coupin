import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getCoupons, updateCoupon, deleteCoupon, debugCoupons } from '../../services/couponService';
import { Coupon } from '../../types';
import CreateCouponModal from '../../components/coupons/CreateCouponModal';
import CouponFilters from '../../components/coupons/CouponFilters';
import CouponTable from '../../components/coupons/CouponTable';
import MobileCouponsList from '../../components/coupons/MobileCouponsList';
import CouponTemplates from '../../components/coupons/CouponTemplates';
import CouponTips from '../../components/coupons/CouponTips';
import EmptyCouponState from '../../components/coupons/EmptyCouponState';
import LoadingState from '../../components/coupons/LoadingState';
import { filterCoupons } from '../../components/coupons/CouponUtils';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import ViewToggle from '../../components/ui/ViewToggle';
import { toast } from 'react-hot-toast';
import BusinessCouponDebugger from '../../components/debug/BusinessCouponDebugger';
import BusinessIdFixer from '../../utils/BusinessIdFixer';

const BusinessCoupons: React.FC = () => {
  console.log('[BusinessCoupons] Component initializing at:', new Date().toISOString());
  console.log('[BusinessCoupons] Component mounted/rendering');

  const { user, businessProfile } = useAuth();
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';

  console.log('[BusinessCoupons] Initial state - user:', user, 'businessProfile:', businessProfile);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'scheduled'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [showFixer, setShowFixer] = useState(false);

  // Debug log to see what we're getting from useAuth
  console.log('[BusinessCoupons] Current auth state - user:', user);
  console.log('[BusinessCoupons] Current auth state - businessProfile:', businessProfile);
  console.log('[BusinessCoupons] User businessId:', user?.businessId);
  console.log('[BusinessCoupons] BusinessProfile businessId:', businessProfile?.businessId);

  // State to track screen width for responsive design
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Set up event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch coupons on component mount and when business profile changes
  useEffect(() => {
    console.log('[BusinessCoupons] useEffect triggered - user:', user, 'businessProfile:', businessProfile);
    console.log('[BusinessCoupons] Component mounted/updated at:', new Date().toISOString());

    if (user?.businessId) {
      console.log('[BusinessCoupons] User has businessId, fetching coupons:', user.businessId);
      fetchCoupons();
    } else if (user?.uid && !user?.businessId) {
      console.log('[BusinessCoupons] User exists but no businessId available. User data:', user);
      // Try to get businessId from businessProfile
      if (businessProfile?.businessId) {
        console.log('[BusinessCoupons] Found businessId in businessProfile:', businessProfile.businessId);
        fetchCouponsWithBusinessId(businessProfile.businessId);
      } else {
        console.log('[BusinessCoupons] No businessId in user or businessProfile');
        // Show the fixer if no businessId is found
        setShowFixer(true);
      }
    } else {
      console.log('[BusinessCoupons] No user available yet');
    }
  }, [user, businessProfile]);

  // Helper function to get the correct businessId
  const getCorrectBusinessId = (businessId: string): string => {
    // Handle the known businessId mismatch
    if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
      return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
    }
    return businessId;
  };

  // Fetch coupons from Firestore
  const fetchCoupons = async () => {
    if (!user?.businessId) {
      console.log('[BusinessCoupons] Cannot fetch coupons: No businessId available');
      console.log('[BusinessCoupons] User object:', user);
      return;
    }

    const correctedBusinessId = getCorrectBusinessId(user.businessId);
    console.log('[BusinessCoupons] Starting fetchCoupons with businessId:', user.businessId);
    console.log('[BusinessCoupons] Using corrected businessId:', correctedBusinessId);
    setLoading(true);
    try {
      console.log('[BusinessCoupons] Fetching coupons for business:', correctedBusinessId);
      console.log('[BusinessCoupons] Calling getCoupons with parameters:', {
        businessId: correctedBusinessId,
        filterStatus: null,
        maxResults: 100,
        activeOnly: false
      });
      const fetchedCoupons = await getCoupons(correctedBusinessId);
      console.log('[BusinessCoupons] Fetched coupons result:', fetchedCoupons);
      console.log('[BusinessCoupons] Number of coupons fetched:', fetchedCoupons?.length || 0);

      if (fetchedCoupons && fetchedCoupons.length > 0) {
        console.log('[BusinessCoupons] Setting coupons:', fetchedCoupons);
        setCoupons(fetchedCoupons);
      } else {
        console.log('[BusinessCoupons] No coupons found for this business');
        setCoupons([]);

        // If no coupons found, try the known business ID from the Firestore screenshot
        const knownBusinessId = 'Mt8ZZpQXyXOHzlEAOKNe'; // Updated to match Firestore screenshot
        if (user.businessId !== knownBusinessId) {
          console.log('[BusinessCoupons] Trying with known business ID:', knownBusinessId);
          const alternativeCoupons = await getCoupons(knownBusinessId);
          if (alternativeCoupons && alternativeCoupons.length > 0) {
            console.log('[BusinessCoupons] Found coupons with alternative business ID:', alternativeCoupons);
            toast.success(`Found ${alternativeCoupons.length} coupons with a different business ID. Use the Business ID Fixer to access them.`);
            setShowFixer(true);
          }
        }
      }
    } catch (error) {
      console.error('[BusinessCoupons] Error fetching coupons:', error);
      toast.error('Failed to load coupons. Please try again.');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Alternative fetch function that accepts businessId directly
  const fetchCouponsWithBusinessId = async (businessId: string) => {
    if (!businessId) {
      console.log('[BusinessCoupons] Cannot fetch coupons: No businessId provided');
      return;
    }

    console.log('[BusinessCoupons] Starting fetchCouponsWithBusinessId with businessId:', businessId);
    setLoading(true);
    try {
      console.log('[BusinessCoupons] Fetching coupons for business (direct):', businessId);
      const fetchedCoupons = await getCoupons(businessId);
      console.log('[BusinessCoupons] Fetched coupons (direct) result:', fetchedCoupons);
      console.log('[BusinessCoupons] Number of coupons fetched (direct):', fetchedCoupons?.length || 0);

      if (fetchedCoupons && fetchedCoupons.length > 0) {
        console.log('[BusinessCoupons] Setting coupons (direct):', fetchedCoupons);
        setCoupons(fetchedCoupons);
        toast.success(`Successfully loaded ${fetchedCoupons.length} coupons!`);
      } else {
        console.log('[BusinessCoupons] No coupons found for this business (direct)');
        setCoupons([]);

        // If no coupons found, try the known business ID from the Firestore screenshot
        const knownBusinessId = 'Mt8ZZpQXyXOHzlEAOKNe'; // Updated to match Firestore screenshot
        if (businessId !== knownBusinessId) {
          console.log('[BusinessCoupons] Trying with known business ID from Firestore:', knownBusinessId);
          const alternativeCoupons = await getCoupons(knownBusinessId);
          if (alternativeCoupons && alternativeCoupons.length > 0) {
            console.log('[BusinessCoupons] Found coupons with alternative business ID:', alternativeCoupons);
            toast.success(`Found ${alternativeCoupons.length} coupons with a different business ID. Use the Business ID Fixer to access them.`);
            setShowFixer(true);
          } else {
            toast('No coupons found. Try creating your first coupon!');
          }
        } else {
          toast('No coupons found for this business ID. Try creating your first coupon!');
        }
      }
    } catch (error) {
      console.error('[BusinessCoupons] Error fetching coupons (direct):', error);
      toast.error('Failed to load coupons. Please try again.');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle coupon creation success
  const handleCouponCreated = (coupon: Coupon) => {
    setShowCreateModal(false);

    // Add the new coupon to the state immediately for better UX
    setCoupons(prevCoupons => [coupon, ...prevCoupons]);
    toast.success('Coupon created successfully!');

    // Force a refresh with a longer delay to ensure server timestamp is processed
    setTimeout(() => {
      setLoading(true); // Show loading state
      fetchCoupons();
    }, 1000);
  };

  // Handle coupon edit
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowCreateModal(true);
  };

  // Handle coupon status toggle (active/inactive)
  const handleToggleCouponStatus = async (coupon: Coupon) => {
    if (!user?.businessId) return;

    try {
      await updateCoupon(coupon.id, { active: !coupon.active });
      // Update local state to reflect the change
      setCoupons(coupons.map(c =>
        c.id === coupon.id ? { ...c, active: !c.active } : c
      ));
      toast.success(`Coupon ${coupon.active ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('[BusinessCoupons] Error updating coupon status:', error);
      toast.error('Failed to update coupon status. Please try again.');
    }
  };

  // Handle coupon deletion
  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deleteCoupon(couponId);
      // Remove from local state
      setCoupons(coupons.filter(c => c.id !== couponId));
      toast.success('Coupon deleted successfully!');
    } catch (error) {
      console.error('[BusinessCoupons] Error deleting coupon:', error);
      toast.error('Failed to delete coupon. Please try again.');
    }
  };

  // Open create modal with no editing coupon
  const handleCreateNew = () => {
    setEditingCoupon(null);
    setShowCreateModal(true);
  };

  // Handle view toggle change
  const handleViewChange = (view: 'default' | 'simple') => {
    if (context?.onViewChange) {
      context.onViewChange(view);
    }
  };

  // Handle manual refresh button click
  const handleRefresh = () => {
    const businessId = user?.businessId || businessProfile?.businessId;
    console.log('[BusinessCoupons] Manual refresh triggered. BusinessId:', businessId);

    if (businessId) {
      fetchCouponsWithBusinessId(businessId);
    } else {
      fetchCoupons();
    }
    toast.success('Refreshing coupons...');
  };

  // Debug function to help troubleshoot coupon issues
  const handleDebugCoupons = async () => {
    const businessId = user?.businessId || businessProfile?.businessId;

    if (!businessId) {
      console.error('[BusinessCoupons] No business ID available for debugging. User:', user, 'BusinessProfile:', businessProfile);
      toast.error('No business ID available for debugging');
      setShowFixer(true);
      return;
    }

    try {
      console.log('[BusinessCoupons] Starting debug process for businessId:', businessId);
      const debugResults = await debugCoupons(businessId);
      console.log('[BusinessCoupons] Debug results:', debugResults);

      toast.success(`Debug complete! Found ${debugResults.summary.totalCoupons} coupons, ${debugResults.summary.totalDistributions} distributions, ${debugResults.summary.totalCustomerCoupons} customer coupons. Check console for details.`);

      // If we found coupons in other collections but not in the main collection, try to refresh
      if (debugResults.summary.totalCoupons === 0 && (debugResults.summary.totalDistributions > 0 || debugResults.summary.totalCustomerCoupons > 0)) {
        console.log('[BusinessCoupons] Found coupons in other collections, attempting to sync...');
        toast.loading('Found coupons in other collections, attempting to sync...');
        setTimeout(() => {
          fetchCouponsWithBusinessId(businessId);
        }, 2000);
      }

      // Show the debugger
      setShowDebugger(true);

      // Also try to debug with the known business ID
      const knownBusinessId = 'nmmUO1gFlcZQV1LMkwKPxbYbes83';
      if (businessId !== knownBusinessId) {
        console.log('[BusinessCoupons] Also debugging with known business ID:', knownBusinessId);
        const alternativeResults = await debugCoupons(knownBusinessId);
        console.log('[BusinessCoupons] Alternative debug results:', alternativeResults);

        if (alternativeResults.summary.totalCoupons > 0) {
          toast.success(`Found ${alternativeResults.summary.totalCoupons} coupons with a different business ID. Use the Business ID Fixer to access them.`);
          setShowFixer(true);
        }
      }
    } catch (error) {
      console.error('[BusinessCoupons] Debug error:', error);
      toast.error('Debug failed. Check console for details.');
    }
  };

  // Filter coupons based on search and status
  const filteredCoupons = filterCoupons(coupons, searchTerm, filterStatus);

  // Determine if we should use mobile view based on screen size or viewMode
  const useMobileView = isMobileView || viewMode === 'simple';

  return (
    <div className={useMobileView ? "px-4 pb-6" : ""}>
      {/* Add the Business ID Fixer at the top if needed */}
      {showFixer && <BusinessIdFixer />}

      {/* Add the debugger component at the top */}
      {showDebugger && <BusinessCouponDebugger />}

      <div className={`flex ${useMobileView ? "flex-col" : "justify-between"} items-center mb-6`}>
        <div className={`flex ${useMobileView ? "w-full justify-between mb-4" : ""} items-center`}>
          <h1 className={`${useMobileView ? "text-2xl" : "text-3xl"} font-bold`}>
            Manage Coupons
          </h1>

          {/* Add the ViewToggle component for mobile screens */}
          {isMobileView && (
            <div className="ml-auto">
              <ViewToggle
                onChange={handleViewChange}
                initialView={viewMode}
              />
            </div>
          )}
        </div>

        <div className={`flex ${useMobileView ? "flex-col gap-2" : "gap-4"} items-center`}>
          <button
            className={`bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex items-center ${useMobileView ? "w-full justify-center" : ""}`}
            onClick={handleCreateNew}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Coupon
          </button>

          {/* Debug button */}
          <button
            className={`bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center ${useMobileView ? "w-full justify-center" : ""}`}
            onClick={handleDebugCoupons}
            title="Debug coupon data across all collections"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Debug Coupons
          </button>

          {/* Refresh button */}
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center ${useMobileView ? "w-full justify-center" : ""}`}
            onClick={handleRefresh}
            title="Refresh coupon data"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>

          {/* Test with known businessId button */}
          <button
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center ${useMobileView ? "w-full justify-center" : ""}`}
            onClick={() => {
              console.log('[BusinessCoupons] Testing with known businessId: Mt8ZZpQXyXOHzlEAOKNe');
              fetchCouponsWithBusinessId('Mt8ZZpQXyXOHzlEAOKNe');
            }}
            title="Test with known businessId from Firestore"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Test Known ID
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <CouponFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onRefresh={handleRefresh}
        isMobileView={useMobileView}
      />

      {/* Loading state */}
      {loading && <LoadingState />}

      {/* Empty state */}
      {!loading && coupons.length === 0 && (
        <EmptyCouponState
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Coupon list or table */}
      {!loading && coupons.length > 0 && (
        <>
          {useMobileView ? (
            <MobileCouponsList
              coupons={filteredCoupons}
              onEdit={handleEditCoupon}
              onToggleStatus={handleToggleCouponStatus}
              onDelete={handleDeleteCoupon}
            />
          ) : (
            <CouponTable
              coupons={filteredCoupons}
              onEdit={handleEditCoupon}
              onToggleStatus={handleToggleCouponStatus}
              onDelete={handleDeleteCoupon}
            />
          )}
        </>
      )}

      {/* Coupon templates section - FIXED PROP NAME */}
      {!loading && coupons.length === 0 && (
        <CouponTemplates onUseTemplate={handleCreateNew} />
      )}

      {/* Tips section - REMOVED INVALID PROP */}
      {!loading && <CouponTips />}

      {/* Create/Edit Modal - FIXED PROPS */}
      {showCreateModal && (
        <CreateCouponModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCouponCreated={handleCouponCreated}
          templateData={editingCoupon || undefined}
        />
      )}
    </div>
  );
};

export default BusinessCoupons;