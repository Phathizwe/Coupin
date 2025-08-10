import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Coupon } from '../types';
import { QRCodeService } from '../services/qrCodeService';
import { QRCodeAnalyticsService } from '../services/qrCodeAnalyticsService';

interface QRCodeData {
  selectedCoupon: string;
  downloadFormat: string;
  coupons: Array<{ id: string; name: string; code: string }>;
  qrCodeDataUrl: string;
  isLoading: boolean;
  error: string | null;
  generatedDate: string;
  totalScans: number;
  uniqueCustomers: number;
  conversionRate: number;
  isLoadingAnalytics: boolean;
}

interface QRCodeActions {
  setSelectedCoupon: (value: string) => void;
  setDownloadFormat: (value: string) => void;
  handleDownload: () => void;
  handleShare: () => void;
}

export const useQRCodeGenerator = (): [QRCodeData, QRCodeActions] => {
  const { user } = useAuth();
  const [selectedCoupon, setSelectedCoupon] = useState<string>('all');
  const [downloadFormat, setDownloadFormat] = useState<string>('png');
  const [coupons, setCoupons] = useState<Array<{ id: string, name: string, code: string }>>([
    { id: 'all', name: 'All Coupons', code: '' }
  ]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDate, setGeneratedDate] = useState<string>(new Date().toLocaleDateString());
  const [totalScans, setTotalScans] = useState<number>(0);
  const [uniqueCustomers, setUniqueCustomers] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);

  // Fetch coupons on component mount
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user?.businessId) return;

      setIsLoading(true);
      try {
        const couponsRef = collection(db, 'coupons');
        const q = query(
          couponsRef,
          where('businessId', '==', user.businessId),
          where('active', '==', true)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const fetchedCoupons = snapshot.docs.map(doc => {
            const data = doc.data() as Coupon;
            return {
              id: doc.id,
              name: data.title,
              code: data.code
            };
          });

          setCoupons([
            { id: 'all', name: 'All Coupons', code: '' },
            ...fetchedCoupons
          ]);
        }

        // Fetch analytics data for all coupons initially
        fetchAnalytics('all');
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Failed to load coupons. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [user?.businessId]);

  // Generate QR code when selected coupon changes
  useEffect(() => {
    const generateQRCode = async () => {
      setIsLoading(true);
      try {
        const selectedCouponObj = coupons.find(c => c.id === selectedCoupon);

        if (!selectedCouponObj) {
          throw new Error('Selected coupon not found');
        }

        // For "All Coupons", create a special QR code that links to the business's coupon page
        if (selectedCoupon === 'all') {
          // Create a business-specific URL or identifier
          const businessQrData = JSON.stringify({
            type: 'business',
            id: user?.businessId
          });

          // Generate QR code for the business
          const qrCode = await QRCodeService.generateCouponQRCode(businessQrData);
          setQrCodeDataUrl(qrCode);
        } else {
          // Generate QR code for a specific coupon
          const qrCode = await QRCodeService.generateCouponQRCode(selectedCouponObj.code);
          setQrCodeDataUrl(qrCode);
        }

        setGeneratedDate(new Date().toLocaleDateString());
        
        // Fetch analytics for the selected coupon
        fetchAnalytics(selectedCoupon);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCoupon) {
      generateQRCode();
    }
  }, [selectedCoupon, coupons, user?.businessId]);

  // Fetch analytics data from Firestore
  const fetchAnalytics = async (couponId: string) => {
    if (!user?.businessId) return;

    setIsLoadingAnalytics(true);
    try {
      let analytics;
      
      if (couponId === 'all') {
        // Get analytics for all QR codes for this business
        analytics = await QRCodeAnalyticsService.getBusinessQRCodeAnalytics(user.businessId);
      } else {
        // Get analytics for this specific coupon
        analytics = await QRCodeAnalyticsService.getCouponQRCodeAnalytics(user.businessId, couponId);
      }
      
      setTotalScans(analytics.totalScans);
      setUniqueCustomers(analytics.uniqueCustomers);
      setConversionRate(analytics.conversionRate);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Don't show error to user, just use zeros
      setTotalScans(0);
      setUniqueCustomers(0);
      setConversionRate(0);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Handle download of QR code
  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `coupon-qrcode-${selectedCoupon}-${new Date().getTime()}.${downloadFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle sharing of QR code
  const handleShare = async () => {
    if (!qrCodeDataUrl || !navigator.share) return;

    try {
      // Convert data URL to Blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'coupon-qrcode.png', { type: 'image/png' });

      await navigator.share({
        title: 'Coupon QR Code',
        text: 'Scan this QR code to access your coupon!',
        files: [file]
      });
    } catch (err) {
      console.error('Error sharing QR code:', err);
      alert('Could not share QR code. Try downloading it instead.');
    }
  };

  const data: QRCodeData = {
    selectedCoupon,
    downloadFormat,
    coupons,
    qrCodeDataUrl,
    isLoading,
    error,
    generatedDate,
    totalScans,
    uniqueCustomers,
    conversionRate,
    isLoadingAnalytics
  };

  const actions: QRCodeActions = {
    setSelectedCoupon,
    setDownloadFormat,
    handleDownload,
    handleShare
  };

  return [data, actions];
};