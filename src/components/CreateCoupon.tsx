import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Customer } from '../types';
import { useCustomers } from '../contexts/CustomerContext';
import CouponTypeSelector, { CouponType } from './create-coupon/CouponTypeSelector';
import CustomerSearchBar from './create-coupon/CustomerSearchBar';
import CustomerList from './create-coupon/CustomerList';
import AddCustomerModal from './create-coupon/AddCustomerModal';
import { createAndDistributeCoupon } from '../services/couponService';

// Enhanced coupon types with emotional design elements
const COUPON_TYPES: CouponType[] = [
  {
    id: 'percent',
    label: '💝 WELCOME BACK TREAT',
    subtitle: '10% OFF NEXT VISIT',
    description: 'Perfect for loyal friends',
    icon: '💝',
    customerView: 'Your favorite spot misses you!',
    successRate: '87%',
    popularity: 'Most loved',
    value: { type: 'percentage', value: 10 }
  },
  {
    id: 'appetizer',
    label: '🍽️ SURPRISE STARTER',
    subtitle: 'FREE APPETIZER',
    description: 'First impressions matter',
    icon: '🍽️',
    customerView: 'A delicious welcome awaits!',
    successRate: '92%',
    popularity: 'Customer favorite',
    value: { type: 'freeItem', item: 'Appetizer' }
  },
  {
    id: 'bogo',
    label: '🤝 BRING A FRIEND',
    subtitle: 'BUY 1 GET 1',
    description: 'Share the love',
    icon: '🤝',
    customerView: 'Double the joy, double the fun!',
    successRate: '78%',
    popularity: 'Great for groups',
    value: { type: 'buyXgetY', buyQty: 1, getQty: 1 }
  },
  {
    id: 'custom',
    label: '🎨 YOUR SPECIAL CREATION',
    subtitle: 'CUSTOM OFFER',
    description: 'Make it uniquely yours',
    icon: '🎨',
    customerView: 'Something special just for you!',
    successRate: '85%',
    popularity: 'Personalized',
    value: { type: 'custom' }
  }
];

const CreateCoupon: React.FC = () => {
  const navigate = useNavigate();
  const { user, businessProfile } = useAuth();
  const { customers, addCustomer, isLoading: customersLoading } = useCustomers();

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCouponType, setSelectedCouponType] = useState(COUPON_TYPES[0].id);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Filter customers based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );

    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleAddCustomer = async (customerData: { firstName: string; lastName: string; phone: string }) => {
    if (!customerData.firstName || !customerData.phone) return;

    setIsLoading(true);

    try {
      const newCustomerData = await addCustomer(customerData);
      setSelectedCustomers(prev => [...prev, newCustomerData.id]);
      setShowAddCustomer(false);
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer to receive your gift!');
      return;
    }

    setIsLoading(true);

    try {
      const selectedType = COUPON_TYPES.find(type => type.id === selectedCouponType);
      if (!selectedType) return;

      // Get business ID with proper fallback logic
      let businessId = user?.businessId || user?.currentBusinessId;
      if (!businessId && user?.role === 'business' && user?.uid) {
        businessId = user.uid;
      }

      // Fix 1: Pass the arguments separately instead of as an object
      await createAndDistributeCoupon(
        businessId || '',
        // Fix 2: Use optional chaining with a type assertion to access businessProfile properties
        (businessProfile as any)?.name || 'Your Business',
        selectedType,
        selectedCustomers
      );

      // Show success celebration
      alert('🎉 Your gifts have been sent! Your customers will be delighted!');
      navigate('/business/coupons');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Oops! Something went wrong while creating your gift. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = COUPON_TYPES.find(type => type.id === selectedCouponType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-amber-600 transition-colors duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ✨ Craft Something Special
                </h1>
                <p className="text-sm text-gray-600">Create a delightful surprise for your customers</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">Step 2 of 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gift Type Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🎁 Choose Your Gift Type</h2>
                <p className="text-gray-600">What kind of joy will you create today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {COUPON_TYPES.map((type, index) => (
                  <div
                    key={type.id}
                    className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedCouponType === type.id
                      ? 'ring-4 ring-amber-400 ring-opacity-50'
                      : ''
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedCouponType(type.id)}
                  >
                    <div className={`
                      relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300
                      ${selectedCouponType === type.id
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
                      }
                    `}>
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-20 transform translate-x-10 -translate-y-10"></div>

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-3xl">{type.icon}</div>
                          {selectedCouponType === type.id && (
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-1">{type.label}</h3>
                        <p className="text-amber-600 font-semibold mb-2">{type.subtitle}</p>
                        <p className="text-gray-600 text-sm mb-4">{type.description}</p>

                        {/* Success indicators */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {type.successRate} success rate
                          </span>
                          <span className="text-gray-500">{type.popularity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 Who Will You Delight?</h2>
                  <p className="text-gray-600">Choose the friends in your community to surprise</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Selected</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedCustomers.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <CustomerSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Find friends in your community..."
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Select All Friends</span>
                  </button>

                  <button
                    onClick={() => setShowAddCustomer(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Invite New Friend</span>
                  </button>
                </div>

                <CustomerList
                  customers={filteredCustomers}
                  selectedCustomers={selectedCustomers}
                  onSelectCustomer={handleSelectCustomer}
                  isLoading={customersLoading}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Preview & Actions */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Customer Preview</h3>
              <div className="bg-gray-900 rounded-xl p-4 text-white">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">{selectedType?.icon}</div>
                  <h4 className="font-bold text-lg">{selectedType?.subtitle}</h4>
                  <p className="text-sm opacity-90 mt-1">{selectedType?.customerView}</p>
                  <div className="mt-3 bg-white/20 rounded-lg py-2 px-4">
                    <span className="text-sm">From TYCA with ❤️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Gift Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipients</span>
                  <span className="font-semibold text-amber-600">{selectedCustomers.length} friends</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected joy</span>
                  <span className="font-semibold text-green-600">High 📈</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success rate</span>
                  <span className="font-semibold text-blue-600">{selectedType?.successRate}</span>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateCoupon}
              disabled={isLoading || selectedCustomers.length === 0}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform
                ${selectedCustomers.length > 0 && !isLoading
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Magic...</span>
                </div>
              ) : selectedCustomers.length > 0 ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>🎁</span>
                  <span>Send {selectedCustomers.length} Gift{selectedCustomers.length !== 1 ? 's' : ''}</span>
                </div>
              ) : (
                'Select Friends to Continue'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal - Fix 3: Remove the isOpen prop as it's not in the interface */}
      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onSave={handleAddCustomer}
          isLoading={isLoading}
        />
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `
      }} />
    </div>
  );
};

export default CreateCoupon;