import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './styles/preview.module.css';

interface CustomerPreviewPanelProps {
  refreshTrigger: number;
  previewType?: 'mobile' | 'receipt' | 'coupon';
}

const CustomerPreviewPanel: React.FC<CustomerPreviewPanelProps> = ({ 
  refreshTrigger,
  previewType = 'mobile'
}) => {
  const { businessProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  
  useEffect(() => {
    // Simulate loading when refreshTrigger changes
    if (refreshTrigger > 0) {
      setIsLoading(true);
      
      // Simulate network delay for preview update
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPreviewKey(prev => prev + 1);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [refreshTrigger]);
  
  // Initial load simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const renderMobilePreview = () => {
    const businessName = businessProfile?.businessName || 'Your Business';
    const description = businessProfile?.description || 'Your business description will appear here. Tell customers what makes your business special.';
    const logo = businessProfile?.logo || '🏪';
    const primaryColor = businessProfile?.colors?.primary || '#2563EB';
    
    return (
      <div className={styles.mobilePreview} key={previewKey}>
        <div className={styles.mobileHeader} style={{ backgroundColor: primaryColor }}>
          <div className={styles.statusBar}>
            <div className={styles.time}>9:41</div>
            <div className={styles.icons}>
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>
          <div className={styles.appHeader}>
            <div className={styles.backButton}>←</div>
            <div className={styles.headerTitle}>Business Details</div>
            <div className={styles.menuButton}>⋯</div>
          </div>
        </div>
        
        <div className={styles.mobileContent}>
          <div className={styles.businessCard}>
            <div className={styles.businessLogo}>
              {typeof logo === 'string' && logo.startsWith('http') ? (
                <img src={logo} alt={businessName} />
              ) : (
                <span className={styles.logoPlaceholder}>{logo}</span>
              )}
            </div>
            
            <div className={styles.businessInfo}>
              <h3 className={styles.businessName}>{businessName}</h3>
              
              {businessProfile?.industry && (
                <div className={styles.businessCategory}>
                  {getIndustryIcon(businessProfile.industry)} {getIndustryName(businessProfile.industry)}
                </div>
              )}
              
              <p className={styles.businessDescription}>{description}</p>
              
              <div className={styles.contactInfo}>
                {businessProfile?.phone && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📞</span>
                    <span>{businessProfile.phone}</span>
                  </div>
                )}
                
                {businessProfile?.email && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>✉️</span>
                    <span>{businessProfile.email}</span>
                  </div>
                )}
                
                {businessProfile?.website && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>🌐</span>
                    <span>{businessProfile.website}</span>
                  </div>
                )}
                
                {businessProfile?.address && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📍</span>
                    <span>{businessProfile.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.previewCoupons}>
            <h4 className={styles.sectionTitle}>Available Coupons</h4>
            <div className={styles.couponCard} style={{ borderColor: primaryColor }}>
              <div className={styles.couponHeader} style={{ backgroundColor: primaryColor }}>
                <div className={styles.couponTitle}>Welcome Offer</div>
                <div className={styles.couponValue}>20% OFF</div>
              </div>
              <div className={styles.couponBody}>
                <p>Welcome to {businessName}! Use this coupon for 20% off your first purchase.</p>
                <div className={styles.couponCode}>CODE: WELCOME20</div>
                <div className={styles.couponExpiry}>Valid until Dec 31, 2025</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.mobileFooter}>
          <div className={styles.navItem}>🏠</div>
          <div className={styles.navItem}>🎟️</div>
          <div className={styles.navItem}>👤</div>
        </div>
      </div>
    );
  };
  
  const renderReceiptPreview = () => {
    const businessName = businessProfile?.businessName || 'Your Business';
    const address = businessProfile?.address || '123 Main Street, City';
    const phone = businessProfile?.phone || '(123) 456-7890';
    
    return (
      <div className={styles.receiptPreview} key={previewKey}>
        <div className={styles.receiptHeader}>
          <div className={styles.receiptLogo}>
            {businessProfile?.logo ? (
              <img src={businessProfile.logo} alt={businessName} />
            ) : (
              <span className={styles.logoPlaceholder}>🏪</span>
            )}
          </div>
          <h3 className={styles.receiptBusinessName}>{businessName}</h3>
          <p className={styles.receiptAddress}>{address}</p>
          <p className={styles.receiptPhone}>{phone}</p>
          <p className={styles.receiptDate}>Date: {new Date().toLocaleDateString()}</p>
          <p className={styles.receiptNumber}>Receipt #: R-12345</p>
        </div>
        
        <div className={styles.receiptItems}>
          <div className={styles.receiptItem}>
            <span className={styles.itemName}>Product 1</span>
            <span className={styles.itemPrice}>$19.99</span>
          </div>
          <div className={styles.receiptItem}>
            <span className={styles.itemName}>Product 2</span>
            <span className={styles.itemPrice}>$24.99</span>
          </div>
          <div className={styles.receiptItem}>
            <span className={styles.itemName}>Product 3</span>
            <span className={styles.itemPrice}>$9.99</span>
          </div>
        </div>
        
        <div className={styles.receiptSummary}>
          <div className={styles.summaryItem}>
            <span>Subtotal</span>
            <span>$54.97</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Tax</span>
            <span>$5.50</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>$60.47</span>
          </div>
        </div>
        
        <div className={styles.receiptFooter}>
          <p>Thank you for your business!</p>
          {businessProfile?.website && (
            <p className={styles.receiptWebsite}>{businessProfile.website}</p>
          )}
        </div>
      </div>
    );
  };
  
  const renderCouponPreview = () => {
    const businessName = businessProfile?.businessName || 'Your Business';
    const primaryColor = businessProfile?.colors?.primary || '#2563EB';
    const secondaryColor = businessProfile?.colors?.secondary || '#DBEAFE';
    
    return (
      <div 
        className={styles.couponPreview} 
        key={previewKey}
        style={{ 
          borderColor: primaryColor,
          backgroundColor: secondaryColor
        }}
      >
        <div 
          className={styles.couponPreviewHeader}
          style={{ backgroundColor: primaryColor }}
        >
          <div className={styles.couponPreviewLogo}>
            {businessProfile?.logo ? (
              <img src={businessProfile.logo} alt={businessName} />
            ) : (
              <span className={styles.logoPlaceholder}>🏪</span>
            )}
          </div>
          <h3 className={styles.couponPreviewTitle}>{businessName}</h3>
          <div className={styles.couponPreviewOffer}>20% OFF</div>
        </div>
        
        <div className={styles.couponPreviewContent}>
          <p className={styles.couponPreviewDescription}>
            Welcome to {businessName}! Enjoy 20% off your first purchase.
          </p>
          
          <div className={styles.couponPreviewCode}>
            <span className={styles.codeLabel}>USE CODE:</span>
            <span className={styles.codeValue}>WELCOME20</span>
          </div>
          
          <div className={styles.couponPreviewValidity}>
            <span className={styles.validityLabel}>Valid until:</span>
            <span className={styles.validityValue}>December 31, 2025</span>
          </div>
          
          <div className={styles.couponPreviewTerms}>
            <p>Terms & Conditions apply. Cannot be combined with other offers.</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to get industry icon
  const getIndustryIcon = (industry: string): string => {
    const icons: Record<string, string> = {
      retail: '🛍️',
      restaurant: '🍽️',
      beauty: '💆',
      health: '🏋️',
      education: '🎓',
      technology: '💻',
      professional: '👔',
      entertainment: '🎭',
      travel: '✈️',
      other: '📦'
    };
    
    return icons[industry] || '🏢';
  };
  
  // Helper function to get industry name
  const getIndustryName = (industry: string): string => {
    const names: Record<string, string> = {
      retail: 'Retail',
      restaurant: 'Restaurant',
      beauty: 'Beauty & Wellness',
      health: 'Health & Fitness',
      education: 'Education',
      technology: 'Technology',
      professional: 'Professional Services',
      entertainment: 'Entertainment',
      travel: 'Travel & Hospitality',
      other: 'Business'
    };
    
    return names[industry] || 'Business';
  };
  
  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>
          <span className={styles.previewIcon}>👁️</span> Customer View
        </h3>
        <div className={styles.previewControls}>
          <button 
            className={`${styles.previewTypeButton} ${previewType === 'mobile' ? styles.active : ''}`}
            onClick={() => setPreviewKey(prev => prev + 1)}
          >
            📱 Mobile
          </button>
          <button 
            className={`${styles.previewTypeButton} ${previewType === 'receipt' ? styles.active : ''}`}
            onClick={() => setPreviewKey(prev => prev + 1)}
          >
            🧾 Receipt
          </button>
          <button 
            className={`${styles.previewTypeButton} ${previewType === 'coupon' ? styles.active : ''}`}
            onClick={() => setPreviewKey(prev => prev + 1)}
          >
            🎫 Coupon
          </button>
        </div>
      </div>
      
      <div className={styles.previewContent}>
        {isLoading ? (
          <div className={styles.previewLoading}>
            <div className={styles.previewSpinner}></div>
            <p>Updating preview...</p>
          </div>
        ) : (
          <>
            {previewType === 'mobile' && renderMobilePreview()}
            {previewType === 'receipt' && renderReceiptPreview()}
            {previewType === 'coupon' && renderCouponPreview()}
          </>
        )}
      </div>
      
      <div className={styles.previewFooter}>
        <div className={styles.updateIndicator}>
          <span className={styles.updateIcon}>🔄</span>
          <span className={styles.updateText}>
            Updates as you type
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerPreviewPanel;