import React, { useState } from 'react';
import { Coupon } from '../../types';
import { deleteCoupon, updateCoupon } from '../../services/couponService';
import ConfirmDialog from '../ui/ConfirmDialog';

interface CouponListItemProps {
  coupon: Coupon;
  onDelete: (id: string) => void;
  onUpdate: (coupon: Coupon) => void;
}

const CouponListItem: React.FC<CouponListItemProps> = ({ coupon, onDelete, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      await updateCoupon(coupon.id, { active: !coupon.active });
      onUpdate({ ...coupon, active: !coupon.active });
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCoupon(coupon.id);
      onDelete(coupon.id);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const getDiscountText = () => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% off`;
      case 'fixed':
        return `$${coupon.value} off`;
      case 'buyXgetY':
        return `Buy ${coupon.buyQuantity} get ${coupon.getQuantity}`;
      case 'freeItem':
        return `Free ${coupon.freeItem}`;
      default:
        return 'Special offer';
    }
  };

  const isExpired = new Date(coupon.endDate) < new Date();
  const isUpcoming = new Date(coupon.startDate) > new Date();

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-lg">{coupon.title}</h3>
              {isExpired ? (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Expired</span>
              ) : isUpcoming ? (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Upcoming</span>
              ) : coupon.active ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
          </div>
          <div className="text-right">
            <div className="font-bold">{getDiscountText()}</div>
            <div className="text-sm text-gray-500">Code: {coupon.code}</div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between text-sm text-gray-500">
          <div>Valid: {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</div>
          <div>{coupon.usageCount} used {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}</div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`text-sm ${isToggling ? 'text-gray-400' : 'text-primary-600 hover:text-primary-700'}`}
              title={coupon.active ? "Deactivate coupon" : "Activate coupon"}
            >
              {isToggling ? 'Updating...' : (coupon.active ? "Deactivate" : "Activate")}
            </button>
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="text-sm text-red-600 hover:text-red-700"
              title="Delete coupon"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
};

export default CouponListItem;