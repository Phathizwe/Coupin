import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../hooks/useAuth';
import CouponCardWithDistribution from '../components/CouponCardWithDistribution';
import CreateCouponModal from '../../../components/coupons/CreateCouponModal';
import { Coupon } from '../../../types'; // Changed from '../../../customer/types/coupon'

const CouponsPage: React.FC = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired' | 'drafts'>('all');

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user?.businessId) return;

      try {
        setLoading(true);

        let couponQuery = query(
          collection(db, 'coupons'),
          where('businessId', '==', user.businessId),
          orderBy('createdAt', 'desc')
        );

        if (activeFilter === 'active') {
          couponQuery = query(
            collection(db, 'coupons'),
            where('businessId', '==', user.businessId),
            where('active', '==', true),
            orderBy('createdAt', 'desc')
          );
        } else if (activeFilter === 'expired') {
          const now = new Date();
          couponQuery = query(
            collection(db, 'coupons'),
            where('businessId', '==', user.businessId),
            where('endDate', '<', now),
            orderBy('endDate', 'desc')
          );
        } else if (activeFilter === 'drafts') {
          couponQuery = query(
            collection(db, 'coupons'),
            where('businessId', '==', user.businessId),
            where('active', '==', false),
            orderBy('createdAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(couponQuery);
        const fetchedCoupons: Coupon[] = [];

        querySnapshot.forEach((doc) => {
          fetchedCoupons.push({
            id: doc.id,
            ...doc.data()
          } as Coupon);
        });

        setCoupons(fetchedCoupons);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [user?.businessId, activeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateCoupon = () => {
    setShowCreateModal(true);
  };

  const handleEditCoupon = (id: string) => {
    // Implement edit functionality
    console.log('Edit coupon:', id);
  };

  const handleShareCoupon = (id: string) => {
    // Implement share functionality
    console.log('Share coupon:', id);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
        setCoupons(coupons.filter(coupon => coupon.id !== id));
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCoupons = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-10 bg-gray-100 rounded mb-3"></div>
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredCoupons.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ?
              "We couldn't find any coupons matching your search." :
              "You haven't created any coupons yet."}
          </p>
          <button
            onClick={handleCreateCoupon}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg"
          >
            Create Your First Coupon
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CouponCardWithDistribution
              id={coupon.id}
              title={coupon.title}
              code={coupon.code}
              discount={getDiscountString(coupon)}
              validPeriod={{
                start: coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Invalid Date',
                end: coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'Invalid Date'
              }}
              usage={{
                current: coupon.usageCount || 0,
                max: coupon.usageLimit || 0
              }}
              isActive={coupon.active || false}
              onEdit={handleEditCoupon}
              onShare={handleShareCoupon}
              onDelete={handleDeleteCoupon}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  // Helper function to generate discount string based on coupon type
  const getDiscountString = (coupon: Coupon): string => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% off`;
      case 'fixed':
        return `$${coupon.value} off`;
      case 'buyXgetY':
        return `Buy ${coupon.buyQuantity || 1} get ${coupon.getQuantity || 1} free`;
      case 'freeItem':
        return `Free ${coupon.freeItem || 'item'}`;
      default:
        return `${coupon.value || 0}% off`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
        <button
          onClick={handleCreateCoupon}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Coupon
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by coupon name or code..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                All Coupons
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Active
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'expired'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expired
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('drafts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'drafts'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Drafts
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {renderCoupons()}
        </div>
      </div>

      {showCreateModal && (
        <CreateCouponModal
          onClose={() => setShowCreateModal(false)}
          onCouponCreated={(newCoupon: Coupon) => {
            setCoupons([newCoupon, ...coupons]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CouponsPage;