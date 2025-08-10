import React, { useState } from 'react';
import { useEnhancedQRCodeGenerator } from '../../hooks/useEnhancedQRCodeGenerator';
import QRGeneratorCard from './QRGeneratorCard';
import QRPreviewCard from './QRPreviewCard';
import QRAnalyticsCard from './QRAnalyticsCard';
import QRUsageTips from './QRUsageTips';
import EmotionalFeedback from './EmotionalFeedback';
import StoreQRCodeTab from './StoreQRCodeTab';
import { useViewport } from '../../hooks/qr-code/ui/useViewport';

const QRCodeLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coupon' | 'store'>('coupon');
  
  const [
    {
      selectedCoupon,
      downloadFormat,
      coupons,
      qrCodeDataUrl,
      isLoading,
      generatedDate,
      totalScans,
      uniqueCustomers,
      conversionRate,
      isLoadingAnalytics,
      error
    },
    {
      setSelectedCoupon,
      setDownloadFormat,
      handleDownload,
      handleShare
    }
  ] = useEnhancedQRCodeGenerator();

  const { isMobile } = useViewport();

  // Analytics data object for consistent passing
  const analytics = {
    totalScans,
    uniqueCustomers,
    conversionRate,
    isLoading: isLoadingAnalytics
  };

  // Determine selected coupon name for display
  const selectedCouponName = selectedCoupon === 'all' 
    ? 'All Coupons' 
    : coupons.find(c => c.id === selectedCoupon)?.name || '';

  // Tab navigation
  const renderTabNavigation = () => (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('coupon')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'coupon'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">🎟️</span>
            Coupon QR Codes
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'store'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">🏪</span>
            Store QR Code
          </button>
        </nav>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🎨 Your QR Code Studio
          </h1>
          <p className="text-gray-600">
            Create magical connections, one scan at a time ✨
          </p>
          
          {totalScans > 0 && activeTab === 'coupon' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-800">
                Your QR codes have created {totalScans} magical moments! 🌟
              </p>
            </div>
          )}
        </div>

        {renderTabNavigation()}

        {activeTab === 'coupon' ? (
          <div className="space-y-6">
            <QRGeneratorCard 
              coupons={coupons}
              selectedCoupon={selectedCoupon}
              downloadFormat={downloadFormat}
              onCouponSelect={setSelectedCoupon}
              onFormatSelect={setDownloadFormat}
              onGenerate={handleDownload}
              isLoading={isLoading}
            />

            <QRPreviewCard 
              qrCodeDataUrl={qrCodeDataUrl}
              isLoading={isLoading}
              selectedCouponName={selectedCouponName}
              generatedDate={generatedDate}
              onDownload={handleDownload}
              onShare={handleShare}
              analytics={analytics}
            />

            <QRAnalyticsCard 
              totalScans={totalScans}
              uniqueCustomers={uniqueCustomers}
              conversionRate={conversionRate}
              isLoading={isLoadingAnalytics}
            />

            <QRUsageTips />
            
            <EmotionalFeedback 
              totalScans={totalScans}
              uniqueCustomers={uniqueCustomers}
              isGenerating={isLoading}
            />
          </div>
        ) : (
          <StoreQRCodeTab />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎨 Your QR Code Studio
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Create magical connections, one scan at a time ✨
        </p>
      </div>

      {renderTabNavigation()}

      {activeTab === 'coupon' ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            <QRGeneratorCard 
              coupons={coupons}
              selectedCoupon={selectedCoupon}
              downloadFormat={downloadFormat}
              onCouponSelect={setSelectedCoupon}
              onFormatSelect={setDownloadFormat}
              onGenerate={handleDownload}
              isLoading={isLoading}
            />
            
            <QRAnalyticsCard 
              totalScans={totalScans}
              uniqueCustomers={uniqueCustomers}
              conversionRate={conversionRate}
              isLoading={isLoadingAnalytics}
            />
            
            <QRUsageTips />
          </div>
          
          {/* Right Column */}
          <div className="flex-1">
            <QRPreviewCard 
              qrCodeDataUrl={qrCodeDataUrl}
              isLoading={isLoading}
              selectedCouponName={selectedCouponName}
              generatedDate={generatedDate}
              onDownload={handleDownload}
              onShare={handleShare}
              analytics={analytics}
            />
          </div>
        </div>
      ) : (
        <StoreQRCodeTab />
      )}
      
      {activeTab === 'coupon' && (
        <EmotionalFeedback 
          totalScans={totalScans}
          uniqueCustomers={uniqueCustomers}
          isGenerating={isLoading}
        />
      )}
    </div>
  );
};

export default QRCodeLayout;