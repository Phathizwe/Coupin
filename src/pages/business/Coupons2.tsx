import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOptimizedCoupons } from '../../hooks/useOptimizedCoupons';
import { Coupon } from '../../types/coupon';
import { clearCouponsCache } from '../../services/coupons2Service';

// Mock components for now - these need to be implemented
const CouponFilters2 = ({ searchTerm, filterStatus }: { searchTerm: string; filterStatus: string }) => (
  <div className="mb-4 p-4 bg-gray-100 rounded">
    <p>Search: {searchTerm} | Filter: {filterStatus}</p>
  </div>
);

const ViewToggle = () => (
  <div className="mb-4 p-2 bg-gray-100 rounded">
    <p>View Toggle Component</p>
  </div>
);

const EmptyCouponState2 = () => (
  <div className="text-center py-8">
    <p className="text-gray-500">No coupons found</p>
    <p className="text-sm text-gray-400">Get started by creating your first coupon.</p>
  </div>
);

const MobileCouponsList2 = ({ coupons }: { coupons: Coupon[] }) => (
  <div className="space-y-4">
    {coupons.map((coupon) => (
      <div key={coupon.id} className="p-4 border rounded-lg">
        <h3 className="font-semibold">{coupon.title}</h3>
        <p className="text-sm text-gray-600">{coupon.description}</p>
        <p className="text-xs text-gray-500">Code: {coupon.code}</p>
      </div>
    ))}
  </div>
);

const CouponTable2 = ({ coupons }: { coupons: Coupon[] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {coupons.map((coupon) => (
          <tr key={coupon.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.title}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.code}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {coupon.active ? 'Active' : 'Inactive'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CreateCouponModal = ({ isOpen, onClose, onCouponCreated }: {
  isOpen: boolean;
  onClose: () => void;
  onCouponCreated: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
        <p className="text-gray-600 mb-4">Coupon creation form would go here.</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCouponCreated();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const Coupons2: React.FC = () => {
  const { user } = useAuth();
  const businessId = user?.businessId || '';

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'scheduled'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch coupons using the optimized hook
  const { coupons, loading, error, refresh } = useOptimizedCoupons({
    businessId,
    status: filterStatus === 'all' ? undefined : filterStatus,
    maxResults: 20
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(coupon =>
    coupon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event handlers
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingCoupon(null);
  };

  const handleCouponCreated = () => {
    refresh();
  };

  const handleClearCache = async () => {
    try {
      await clearCouponsCache();
      await refresh();
      console.log('[Coupons2] Cache cleared and data refreshed');
    } catch (error) {
      console.error('[Coupons2] Error clearing cache:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Coupons 2.0</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Clear Cache
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Coupon
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <strong>Debug Info:</strong> Business ID: {businessId}, Coupons: {coupons.length}, Loading: {loading.toString()}, Error: {error ? 'Error occurred' : 'None'}
      </div>

      {/* Coupon Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-600">Active</h3>
          <p className="text-2xl font-bold">{coupons.filter(c => c.active).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-600">Scheduled</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-600">Expired</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-purple-600">Redemptions</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Filters */}
      <CouponFilters2
        searchTerm={searchTerm}
        filterStatus={filterStatus}
      />

      {/* View Toggle */}
      <div className="mb-4">
        <ViewToggle />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Empty State */}
      {!loading && coupons.length === 0 && !error && (
        <EmptyCouponState2 />
      )}

      {/* Coupons List */}
      {coupons.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          {isMobile ? (
            <MobileCouponsList2
              coupons={filteredCoupons}
            />
          ) : (
            <CouponTable2
              coupons={filteredCoupons}
            />
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateCouponModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          onCouponCreated={handleCouponCreated}
        />
      )}
    </div>
  );
};

export default Coupons2;