// src/components/coupons/OptimizedCouponList.tsx
import React from 'react';
import { useOptimizedCoupons } from '../../hooks/useOptimizedCoupons';

interface OptimizedCouponListProps {
  businessId: string;
  filterStatus?: string;
  activeOnly?: boolean;
  maxResults?: number;
}

const OptimizedCouponList: React.FC<OptimizedCouponListProps> = ({
  businessId,
  filterStatus,
  activeOnly = true,
  maxResults = 20
}) => {
  const {
    coupons,
    loading,
    error,
    hasMore,
    loadMore
  } = useOptimizedCoupons({
    businessId,
    status: filterStatus,
    active: activeOnly,
    maxResults
  });

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  // Function to display discount information based on coupon type
  const getDiscountDisplay = (coupon: any) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% off`;
      case 'fixed':
        return `R${coupon.value} off`;
      case 'buyXgetY':
        return `Buy ${coupon.buyQuantity}, Get ${coupon.getQuantity}`;
      case 'freeItem':
        return `Free ${coupon.freeItem}`;
      default:
        return `${coupon.value} off`;
    }
  };

  return (
    <div className="optimized-coupon-list">
      <h2>Coupons ({coupons.length})</h2>

      {/* Coupon list */}
      <div className="coupon-grid">
        {coupons.map(coupon => (
          <div key={coupon.id} className="coupon-card">
            <h3>{coupon.title}</h3>
            <p>{coupon.description}</p>
            <div className="coupon-details">
              <span className="discount">{getDiscountDisplay(coupon)}</span>
              <span className="code">{coupon.code}</span>
            </div>
            <div className="coupon-status">
              <span className={`status ${coupon.active ? 'active' : 'inactive'}`}>
                {coupon.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && <div className="loading">Loading...</div>}

      {/* Load more button */}
      {!loading && hasMore && (
        <button
          className="load-more-button"
          onClick={loadMore}
        >
          Load More
        </button>
      )}

      {/* Empty state */}
      {!loading && coupons.length === 0 && (
        <div className="empty-state">
          <p>No coupons found. Create your first coupon to get started!</p>
        </div>
      )}
    </div>
  );
};

export default OptimizedCouponList;