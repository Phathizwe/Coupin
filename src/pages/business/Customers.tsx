import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getCustomers } from '../../services/customerService';
import { getCustomerCouponStats } from '../../services/customerCouponService';
import { getLoyaltyProgram } from '../../services/loyaltyService';
import { Customer } from '../../types';
import AddCustomerModal from '../../components/customers/AddCustomerModal';
import AssignCouponModal from '../../components/customers/AssignCouponModal';
import CustomerDetailView from '../../components/customers/CustomerDetailView';
import CustomerSearchFilter from '../../components/customers/CustomerSearchFilter';
import CustomerTable from '../../components/customers/CustomerTable';
import CustomerInsights from '../../components/customers/CustomerInsights';
import { CustomerWithCouponStats } from '../../types/customer';
import { useDashboardContext } from '../../layouts/DashboardLayout';

const BusinessCustomers: React.FC = () => {
  const { user } = useAuth();
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';

  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<CustomerWithCouponStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithCouponStats | null>(null);
  const [hasLoyaltyProgram, setHasLoyaltyProgram] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

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

  // Fetch customers on component mount
  useEffect(() => {
    if (user?.businessId) {
      fetchCustomers();
      checkLoyaltyProgram();
    }
  }, [user]);

  // Check if business has a loyalty program
  const checkLoyaltyProgram = async () => {
    if (!user?.businessId) return;

    try {
      const program = await getLoyaltyProgram(user.businessId);
      setHasLoyaltyProgram(!!program);
    } catch (error) {
      console.error('Error checking loyalty program:', error);
    }
  };

  // Fetch customers from Firestore
  const fetchCustomers = async (reset = true) => {
    if (!user?.businessId) return;

    try {
      setLoading(true);
      const result = await getCustomers(
        user.businessId,
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
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
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

  // Handle view toggle change
  const handleViewChange = (view: 'default' | 'simple') => {
    if (context?.onViewChange) {
      context.onViewChange(view);
    }
  };

  // Filter customers based on search term (client-side filtering for additional flexibility)
  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Determine if we should use mobile view based on screen size or viewMode
  const useMobileView = isMobileView || viewMode === 'simple';

  return (
    <div className={useMobileView ? "px-4 pb-6" : ""}>
      <div className={`flex ${useMobileView ? "flex-col" : "justify-between"} items-center mb-6`}>
        <div className={`flex ${useMobileView ? "w-full justify-between mb-4" : ""} items-center`}>
          <h1 className={`${useMobileView ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>
            Customers
          </h1>
        </div>
        <div className={`${useMobileView ? "w-full" : ""}`}>
          <button
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 w-full md:w-auto font-medium"
            onClick={() => setShowAddModal(true)}
          >
            Add Customer
          </button>
        </div>
      </div>

      {/* Rest of the component JSX... */}
    </div>
  );
};

export default BusinessCustomers;