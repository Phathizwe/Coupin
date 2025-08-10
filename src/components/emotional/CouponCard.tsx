import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount: string;
  status: string;
  validFrom: string;
  validUntil: string;
  usage: {
    used: number;
    limit: number;
  };
  sent: number;
  description?: string;
}

interface CouponCardProps {
  coupon: Coupon;
  onAction: (action: string) => void;
  viewMode?: 'detailed' | 'simple';
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onAction, viewMode = 'detailed' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get status color
  const getStatusColor = () => {
    switch (coupon.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-amber-100 text-amber-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (dateString === 'Invalid Date') return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Calculate usage percentage
  const usagePercentage = coupon.usage.limit > 0 
    ? (coupon.usage.used / coupon.usage.limit) * 100 
    : 0;

  // Render a simpler version if viewMode is 'simple'
  if (viewMode === 'simple') {
    return (
      <motion.div
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative"
        whileHover={{ 
          y: -3,
          transition: { duration: 0.2 }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">{coupon.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
              {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-baseline mb-3">
            <span className="text-2xl font-bold mr-2 text-purple-600">{coupon.discount}</span>
            <span className="text-sm text-gray-500">discount</span>
          </div>
          
          <div className="flex justify-between text-sm mb-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Code</div>
              <div className="font-mono bg-gray-50 px-2 py-1 rounded">{coupon.code}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Valid Until</div>
              <div>{formatDate(coupon.validUntil)}</div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-2">
            <motion.button
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('share')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </motion.button>
            
            <motion.button
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('edit')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </motion.button>
          </div>
        </div>
        
        {/* Hover effect - subtle glow */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1) inset',
              borderRadius: '0.75rem'
            }}
          />
        )}
      </motion.div>
    );
  }

  // Detailed view (default)
  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
          {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
        </span>
      </div>
      
      {/* Card header with gradient based on discount */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
        <h3 className="text-lg font-bold mb-1">{coupon.title}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold mr-2">{coupon.discount}</span>
          <span className="text-sm opacity-80">discount</span>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        {/* Coupon code with copy animation */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Coupon Code</div>
          <div className="flex items-center">
            <motion.div 
              className="bg-gray-100 rounded px-3 py-2 font-mono text-sm flex-1 mr-2"
              whileTap={{ scale: 0.98 }}
            >
              {coupon.code}
            </motion.div>
            <motion.button
              className="text-purple-500 p-1 rounded hover:bg-purple-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                navigator.clipboard.writeText(coupon.code);
                // Show a toast or notification
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </motion.button>
          </div>
        </div>
        
        {/* Validity period */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Valid Period</div>
          <div className="text-sm text-gray-700">
            {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
          </div>
        </div>
        
        {/* Usage stats with animated progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Usage</span>
            <span className="text-xs font-medium">
              {coupon.usage.used} / {coupon.usage.limit === 0 ? '∞' : coupon.usage.limit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
        
        {/* Sent count */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Sent to</div>
          <div className="text-sm text-gray-700 flex items-center">
            <span className="mr-1">{coupon.sent}</span>
            <span>{coupon.sent === 1 ? 'customer' : 'customers'}</span>
          </div>
        </div>
      </div>
      
      {/* Card actions */}
      <div className="border-t border-gray-100 p-4 flex justify-between">
        <motion.button
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction('edit')}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </motion.button>
        
        <motion.button
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction('share')}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </motion.button>
        
        <motion.button
          className="text-sm text-red-600 hover:text-red-800 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction('delete')}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </motion.button>
      </div>
      
      {/* Hover effect - subtle glow */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1) inset',
            borderRadius: '0.75rem'
          }}
        />
      )}
    </motion.div>
  );
};

export default CouponCard;