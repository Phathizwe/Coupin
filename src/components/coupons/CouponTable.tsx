import React from 'react';
import { Coupon } from '../../types';
import { getCouponStatusLabel, getCouponStatusColor } from './CouponUtils';

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
}

const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Coupon
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Discount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Validity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coupons.map((coupon) => {
            const status = getCouponStatusLabel(coupon);
            const statusColor = getCouponStatusColor(status);
            
            return (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{coupon.title}</div>
                  <div className="text-sm text-gray-500">{coupon.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.type === 'percentage' && `${coupon.value}% off`}
                    {coupon.type === 'fixed' && `$${coupon.value.toFixed(2)} off`}
                    {coupon.type === 'buyXgetY' && `Buy ${coupon.buyQuantity} get ${coupon.getQuantity}`}
                    {coupon.type === 'freeItem' && `Free ${coupon.freeItem}`}
                  </div>
                  {coupon.minPurchase && (
                    <div className="text-xs text-gray-500">
                      Min. purchase: ${coupon.minPurchase.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.usageCount} / {coupon.usageLimit || '∞'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {coupon.distributionCount || 0} sent
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-primary-600 hover:text-primary-900 mr-3"
                    onClick={() => onEdit(coupon)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${coupon.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                    onClick={() => onToggleStatus(coupon)}
                  >
                    {coupon.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onDelete(coupon.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CouponTable;