import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface CouponCardProps {
  id: string;
  title: string;
  code: string;
  discount: string;
  validPeriod: {
    start: string;
    end: string;
  };
  usage: {
    current: number;
    max: number;
  };
  isActive: boolean;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

const CouponCardWithDistribution: React.FC<CouponCardProps> = ({
  id,
  title,
  code,
  discount,
  validPeriod,
  usage,
  isActive,
  onEdit,
  onShare,
  onDelete
}) => {
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistributionCount = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'couponDistributions'),
          where('couponId', '==', id)
        );

        const querySnapshot = await getDocs(q);
        setCustomerCount(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching coupon distribution count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributionCount();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className={`p-4 ${isActive ? 'bg-gradient-to-br from-purple-50 to-indigo-100' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          {isActive ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Active
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
              Inactive
            </span>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer border border-gray-100 mb-3"
          onClick={handleCopy}>
          <span className="font-mono text-sm font-medium text-gray-700">{code}</span>
          <button className="text-gray-500 hover:text-gray-700 text-xs flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-1 flex justify-between">
          <span>Usage: {usage.current}/{usage.max > 0 ? usage.max : '∞'}</span>
          <span>{discount} discount</span>
        </div>

        <div className="text-xs text-gray-500">
          Valid Period
        </div>
        <div className="text-sm text-gray-700 mb-2">
          {validPeriod.start} - {validPeriod.end}
        </div>

        <div className="text-xs text-gray-500">
          Sent to
        </div>
        <div className="text-sm text-gray-700">
          {loading ? (
            <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
          ) : (
            `${customerCount} customer${customerCount !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-2 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(id)}
          className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200"
        >
          Edit
        </button>
        <button
          onClick={() => onShare(id)}
          className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200"
        >
          Share
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CouponCardWithDistribution;