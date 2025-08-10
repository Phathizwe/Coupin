import React, { useState, useEffect } from 'react';
import { Customer, Coupon, LoyaltyProgram } from '../../types';
import { collection, query, where, getDocs, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

interface LoyaltySendCouponModalProps {
  program: LoyaltyProgram;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal component for sending coupons to customers
 */
const LoyaltySendCouponModal: React.FC<LoyaltySendCouponModalProps> = ({
  program,
  onClose,
  onSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available coupons when component mounts
  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        const couponsRef = collection(db, 'coupons');
        const q = query(
          couponsRef,
          where('businessId', '==', program.businessId),
          where('active', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedCoupons: Coupon[] = [];
          snapshot.forEach(doc => {
            fetchedCoupons.push({ id: doc.id, ...doc.data() } as Coupon);
          });
          setCoupons(fetchedCoupons);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setErrorMessage('Failed to load available coupons');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoupons();
  }, [program.businessId]);

  // Search for customers
  const searchCustomers = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setErrorMessage('Please enter at least 2 characters to search');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const customersRef = collection(db, 'customers');
      const searchTermLower = searchTerm.toLowerCase();
      
      // We'll search by phone number if the search term contains only numbers
      if (/^\d+$/.test(searchTerm)) {
        const q = query(
          customersRef,
          where('businessId', '==', program.businessId),
          where('phone', '>=', searchTerm),
          where('phone', '<=', searchTerm + '\uf8ff')
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedCustomers: Customer[] = [];
          snapshot.forEach(doc => {
            fetchedCustomers.push({ id: doc.id, ...doc.data() } as Customer);
          });
          setCustomers(fetchedCustomers);
        } else {
          setCustomers([]);
          setErrorMessage('No customers found with that phone number');
        }
      } else {
        // For text search, we'll fetch all customers and filter client-side
        // In a production app, you'd want to use a more efficient search method
        const q = query(
          customersRef,
          where('businessId', '==', program.businessId)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedCustomers: Customer[] = [];
          snapshot.forEach(doc => {
            const customer = { id: doc.id, ...doc.data() } as Customer;
            const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
            const email = (customer.email || '').toLowerCase();
            
            if (fullName.includes(searchTermLower) || email.includes(searchTermLower)) {
              fetchedCustomers.push(customer);
            }
          });
          
          setCustomers(fetchedCustomers);
          
          if (fetchedCustomers.length === 0) {
            setErrorMessage('No customers found matching your search');
          }
        } else {
          setCustomers([]);
          setErrorMessage('No customers found for this business');
        }
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setErrorMessage('An error occurred while searching for customers');
    } finally {
      setIsLoading(false);
    }
  };

  // Send coupon to selected customer
  const sendCoupon = async () => {
    if (!selectedCustomer || !selectedCoupon) {
      setErrorMessage('Please select both a customer and a coupon');
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real app, you'd create a customer_coupons record and possibly send an email/SMS
      const customerCouponsRef = collection(db, 'customer_coupons');
      
      await addDoc(customerCouponsRef, {
        customerId: selectedCustomer.id,
        couponId: selectedCoupon.id,
        businessId: program.businessId,
        redeemed: false,
        sentAt: Timestamp.now(),
        expiresAt: selectedCoupon.endDate
      });
      
      toast.success(`Coupon sent to ${selectedCustomer.firstName}!`);
      onSuccess();
    } catch (error) {
      console.error('Error sending coupon:', error);
      setErrorMessage('Failed to send coupon');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Send Coupon to Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Customer search section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Find Customer
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, email or phone"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={searchCustomers}
              disabled={isLoading || searchTerm.length < 2}
              className={`px-4 py-2 rounded-md font-medium ${
                isLoading || searchTerm.length < 2
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {/* Customer results */}
        {customers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select a Customer
            </h3>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {customers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-800">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.email || 'No email'} • {customer.phone || 'No phone'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Coupon selection section */}
        {selectedCustomer && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select a Coupon to Send
            </h3>
            {coupons.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {coupons.map(coupon => (
                  <div
                    key={coupon.id}
                    onClick={() => setSelectedCoupon(coupon)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedCoupon?.id === coupon.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-800">
                      {coupon.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {coupon.type === 'percentage' && `${coupon.value}% off`}
                      {coupon.type === 'fixed' && `$${coupon.value} off`}
                      {coupon.type === 'buyXgetY' && `Buy ${coupon.buyQuantity} get ${coupon.getQuantity}`}
                      {coupon.type === 'freeItem' && `Free ${coupon.freeItem}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500">No active coupons available</p>
              </div>
            )}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={sendCoupon}
            disabled={isSending || !selectedCustomer || !selectedCoupon}
            className={`px-4 py-2 rounded-md font-medium ${
              isSending || !selectedCustomer || !selectedCoupon
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSending ? 'Sending...' : 'Send Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySendCouponModal;