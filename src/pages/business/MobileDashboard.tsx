import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateCouponModal } from '../../components/coupons';
import { Coupon } from '../../types';
import { toast } from 'react-hot-toast';
import InvitationsChecker from '../../components/dashboard/InvitationsChecker';
import SimpleDashboardMobile from '../../components/dashboard/SimpleDashboardMobile';
import { useAuth } from '../../hooks/useAuth';

const MobileDashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    type: string;
    data: Partial<Coupon>;
  } | null>(null);
  const navigate = useNavigate();
  const { user, businessProfile } = useAuth();
  
  // Get user's first name for greeting
  const getUserFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return businessProfile?.businessName || 'there';
  };

  // Template definitions for different coupon types
  const couponTemplates = {
    firstTime: {
      type: 'First-Time Customer Discount',
      data: {
        title: 'First-Time Customer Discount',
        description: 'Special offer for new customers only',
        type: 'percentage' as const,
        value: 15, // 15% off
        firstTimeOnly: true,
        minPurchase: 0,
        termsAndConditions: 'Valid for first-time customers only. Cannot be combined with other offers.',
        branding: {
          backgroundColor: '#f3f4f6',
          textColor: '#1f2937'
        }
      }
    },
    buyOneGetOne: {
      type: 'Buy One Get One Free',
      data: {
        title: 'Buy One Get One Free',
        description: 'Purchase one item and get another one free',
        type: 'buyXgetY' as const,
        buyQuantity: 1,
        getQuantity: 1,
        value: 100, // 100% off the second item
        firstTimeOnly: false,
        termsAndConditions: 'Second item must be of equal or lesser value. Cannot be combined with other offers.',
        branding: {
          backgroundColor: '#fee2e2',
          textColor: '#7f1d1d'
        }
      }
    },
    loyalty: {
      type: 'Loyalty Reward',
      data: {
        title: 'Loyalty Reward',
        description: 'Special discount for our loyal customers',
        type: 'percentage' as const,
        value: 20, // 20% off
        firstTimeOnly: false,
        minPurchase: 0,
        termsAndConditions: 'For returning customers only. Cannot be combined with other offers.',
        branding: {
          backgroundColor: '#e0f2fe',
          textColor: '#0c4a6e'
        }
      }
    }
  };

  const handleOpenCreateModal = (templateKey?: keyof typeof couponTemplates) => {
    if (templateKey) {
      setSelectedTemplate(couponTemplates[templateKey]);
    } else {
      setSelectedTemplate(null);
    }
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleCouponCreated = (coupon: Coupon) => {
    toast.success('Coupon created successfully!');
    // Navigate to the coupons page to see the newly created coupon
    navigate('/business/coupons');
  };

  return (
    <div className="h-full">
      {/* Add the InvitationsChecker component to show pending invitations */}
      <InvitationsChecker />
      
      {/* Render our mobile dashboard with the business ID for fetching stats */}
      {user?.businessId && (
        <SimpleDashboardMobile 
          userName={getUserFirstName()}
          businessId={user.businessId}
        />
      )}

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCouponCreated={handleCouponCreated}
        templateData={selectedTemplate?.data}
        templateType={selectedTemplate?.type}
      />
    </div>
  );
};

export default MobileDashboard;