import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCustomers } from '../../services/customerService';
import { CustomerWithCouponStats } from '../../types/customer';

const SimpleCustomersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerWithCouponStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers from Firebase
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customerData = await getCustomers(user.businessId);
        setCustomers(customerData.customers || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [user?.businessId]);

  const handleAddCustomer = () => {
    // Navigate to add customer or show modal
    navigate('/business/customers');
  };

  const handleBackToDashboard = () => {
    navigate('/business/dashboard/simple');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="ml-3 text-gray-600 animate-pulse">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error Loading Customers</h3>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Connections</h1>
          <p className="text-gray-600">Manage and connect with your valued customers</p>
        </div>

        {/* Add Customer Button */}
        <div className="mb-6">
          <button
            onClick={handleAddCustomer}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Customer
          </button>
        </div>

        {/* Customer List */}
        {customers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Your Customers ({customers.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {customer.firstName ? customer.firstName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.firstName && customer.lastName
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.firstName || customer.lastName || 'Unknown Customer'}
                        </h3>
                        <p className="text-gray-600">
                          {customer.email || customer.phone || 'No contact info'}
                        </p>
                        {customer.couponStats && (
                          <p className="text-sm text-green-600 font-medium">
                            {customer.couponStats.totalUsed} coupons redeemed
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Building Relationships</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect with your customers by creating personalized coupons and offers. Your first customer connection is just a click away!
            </p>
            <button
              onClick={handleAddCustomer}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add Your First Customer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCustomersPage;