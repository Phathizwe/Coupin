import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getCoupons } from '../../services/couponService';
import { allocateCouponToCustomer } from '../../services/customerCouponService';
import { Coupon, Customer } from '../../types';

interface AssignCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onCouponAssigned: () => void;
}

const AssignCouponModal: React.FC<AssignCouponModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCouponAssigned
}) => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch available coupons when modal opens
  useEffect(() => {
    if (isOpen && user?.businessId) {
      fetchCoupons();
    }
  }, [isOpen, user]);

  // Fetch active coupons from Firestore
  const fetchCoupons = async () => {
    if (!user?.businessId) return;
    
    try {
      setLoading(true);
      const fetchedCoupons = await getCoupons(user.businessId, null, 100, true); // Only get active coupons
      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle coupon selection
  const handleCouponSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCouponId(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCouponId) {
      setError('Please select a coupon to assign');
      return;
    }
    
    if (!user?.businessId) {
      setError('Business ID not found. Please try again later.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Find the selected coupon
      const selectedCoupon = coupons.find(coupon => coupon.id === selectedCouponId);
      
      if (!selectedCoupon) {
        throw new Error('Selected coupon not found');
      }
      
      // Convert the endDate properly based on its type
      let expiryDate: Date;
      if (selectedCoupon.endDate instanceof Date) {
        expiryDate = selectedCoupon.endDate;
      } else if (selectedCoupon.endDate && typeof selectedCoupon.endDate === 'object' && 'toDate' in selectedCoupon.endDate) {
        // Handle Firestore Timestamp
        expiryDate = selectedCoupon.endDate.toDate();
      } else {
        // Fallback for string or number timestamp
        expiryDate = new Date(selectedCoupon.endDate);
      }
      
      // Allocate the coupon to the customer
      await allocateCouponToCustomer(
        customer.id,
        selectedCoupon.id,
        user.businessId,
        selectedCoupon.code,
        expiryDate
      );
      
      setSuccess(`Coupon "${selectedCoupon.title}" has been successfully assigned to ${customer.firstName} ${customer.lastName}`);
      
      // Reset form
      setSelectedCouponId('');
      
      // Notify parent component
      onCouponAssigned();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error assigning coupon:', err);
      setError('Failed to assign coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Assign Coupon to {customer.firstName} {customer.lastName}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
                  Select Coupon
                </label>
                {loading ? (
                  <div className="mt-1 py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                    Loading coupons...
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="mt-1 py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                    No active coupons available
                  </div>
                ) : (
                  <select
                    id="coupon"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={selectedCouponId}
                    onChange={handleCouponSelect}
                    required
                  >
                    <option value="">-- Select a coupon --</option>
                    {coupons.map(coupon => (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.title} - {coupon.code} ({coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedCouponId && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Coupon Details</h3>
                  {(() => {
                    const coupon = coupons.find(c => c.id === selectedCouponId);
                    if (!coupon) return null;
                    
                    return (
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Code:</span> {coupon.code}</p>
                        <p><span className="font-medium">Discount:</span> {
                          coupon.type === 'percentage' ? `${coupon.value}% off` : 
                          coupon.type === 'fixed' ? `$${coupon.value} off` :
                          coupon.type === 'buyXgetY' ? `Buy ${coupon.buyQuantity} get ${coupon.getQuantity}` :
                          `Free ${coupon.freeItem}`
                        }</p>
                        <p><span className="font-medium">Valid until:</span> {new Date(coupon.endDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Description:</span> {coupon.description}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading || !selectedCouponId || coupons.length === 0}
              >
                {loading ? 'Assigning...' : 'Assign Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignCouponModal;